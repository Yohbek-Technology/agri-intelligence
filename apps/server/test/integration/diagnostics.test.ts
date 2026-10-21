import { describe, it, expect, vi, beforeAll } from 'vitest'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

vi.mock('@/services/sms.js', () => ({
  sendSms: vi.fn().mockResolvedValue({
    success: true,
    messageId: 'mock-sms-id',
    number: '+251911000004',
    status: 'Success',
    cost: '0',
  }),
  sendBulkSms: vi.fn().mockResolvedValue({ sent: [], failed: [] }),
  onPhoneVerified: vi.fn().mockResolvedValue(undefined),
  normalizeEthiopianPhone: (phone: string): string => {
    const t = phone.replace(/\s+/g, '')
    if (t.startsWith('+251')) return t
    if (t.startsWith('251')) return `+${t}`
    if (t.startsWith('0')) return `+251${t.slice(1)}`
    return t
  },
  countSegments: vi.fn().mockReturnValue(1),
}))

vi.mock('@/config/socket.js', () => ({
  initSocket: vi.fn(),
  getIO: vi.fn(),
}))

vi.mock('@/services/tts.js', () => ({
  synthesize: vi.fn().mockResolvedValue({
    audio: Buffer.from('RIFF mock audio buffer'),
    mimeType: 'audio/wav',
  }),
}))

import { auth } from '@/config/auth.js'
import { mobileAuthRouter } from '@/routes/mobile-auth.js'
import { farmersRouter } from '@/routes/farmers.js'
import { plotsRouter } from '@/routes/plots.js'
import { cropCyclesRouter } from '@/routes/crop-cycles.js'
import { daTasksRouter } from '@/routes/da-tasks.js'
import { diagnosticsRouter } from '@/routes/diagnostics.js'
import { catalogRouter } from '@/routes/catalog.js'

const app = new Hono()
app.use('*', cors({ origin: '*', credentials: true }))
app.route('/api/auth', mobileAuthRouter)
app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw))
app.route('/api/v1/farmers', farmersRouter)
app.route('/api/v1/plots', plotsRouter)
app.route('/api/v1/cycles', cropCyclesRouter)
app.route('/api/v1/da/tasks', daTasksRouter)
app.route('/api/v1/diagnoses', diagnosticsRouter)
app.route('/api/v1/catalog', catalogRouter)

const BASE = 'http://localhost'
const RUN_ID = Date.now()
const TEST_PHONE = `+25191${String(RUN_ID).slice(-7)}`
const TEST_PASSWORD = 'FarmerSecret123!'

let farmerBearerToken = ''
let testPlotId = ''
let testCycleId = ''
let highConfidenceDiagnosisId = ''
let lowConfidenceDiagnosisId = ''
let linkedDaTaskId = ''

async function req(
  method: string,
  path: string,
  body?: unknown,
  extraHeaders?: Record<string, string>
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(farmerBearerToken ? { Authorization: `Bearer ${farmerBearerToken}` } : {}),
    ...extraHeaders,
  }

  return app.request(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
}

describe('Phase 6: Multimodal Pest & Disease AI Diagnostics Integration', () => {
  beforeAll(async () => {
    const { sendSms } = await import('@/services/sms.js')
    let capturedCode = ''

    vi.mocked(sendSms).mockImplementation((phone: string, msg: string) => {
      const match = msg.match(/(\d{6})/)
      if (match) capturedCode = match[1]!
      return Promise.resolve({ success: true, messageId: 'm', number: phone, status: 'Success', cost: '0' })
    })

    // 1. Sign up farmer
    await req('POST', '/api/auth/sign-up/phone', { phoneNumber: TEST_PHONE })

    // 2. Verify OTP
    const verifyRes = await req('POST', '/api/auth/phone/verify-otp', {
      phoneNumber: TEST_PHONE,
      code: capturedCode || '123456',
      password: TEST_PASSWORD,
      name: 'Alemayehu Tola',
      preferredLanguage: 'am',
    })
    const verifyData = await verifyRes.json()
    farmerBearerToken = verifyData.data.token

    // 3. Create profile
    await req('POST', '/api/v1/farmers/me', {
      fullName: 'Alemayehu Tola',
      localIdNumber: `FARMER-DIAG-${String(RUN_ID).slice(-5)}`,
      preferredLanguage: 'am',
    })

    // 4. Register plot
    const plotRes = await req('POST', '/api/v1/farmers/me/plots', {
      name: 'Hillside Wheat Plot',
      areaValue: 1.2,
      areaUnit: 'hectare',
      centroidLatitude: 8.54,
      centroidLongitude: 39.27,
      gpsAccuracyMeters: 4.5,
      elevationMeters: 1850,
      agroZone: 'weyna_dega',
      soilClass: 'beda_nitisol',
      drainage: 'free_draining',
      plannedCropName: 'Wheat (Kakaba)',
      plannedSeasonYear: 2026,
    })
    const plotJson = await plotRes.json()
    testPlotId = plotJson.data.id

    // 5. Start crop cycle
    const cycleRes = await req('POST', `/api/v1/plots/${testPlotId}/cycles`, {
      varietyId: null,
      seasonYear: 2026,
    })
    const cycleJson = await cycleRes.json()
    testCycleId = cycleJson.data.id
  })

  it('1. GET /api/v1/catalog/chemicals & /pests retrieves baseline MoA catalog', async () => {
    const pestRes = await req('GET', '/api/v1/catalog/pests')
    expect(pestRes.status).toBe(200)
    const pestJson = await pestRes.json()
    expect(pestJson.data.length).toBeGreaterThanOrEqual(1)
    const rust = pestJson.data.find((p: any) => p.code === 'wheat_stem_rust')
    expect(rust).toBeDefined()

    const chemRes = await req('GET', '/api/v1/catalog/chemicals')
    expect(chemRes.status).toBe(200)
    const chemJson = await chemRes.json()
    expect(chemJson.data.length).toBeGreaterThanOrEqual(1)
    const tilt = chemJson.data.find((c: any) => c.brandName.includes('Tilt'))
    expect(tilt).toBeDefined()
    expect(tilt.registrationNumber).toBe('MoA-ET/1042')
  })

  it('2. POST /api/v1/diagnoses submits high-confidence field case', async () => {
    const res = await req('POST', '/api/v1/diagnoses', {
      plotId: testPlotId,
      cycleId: testCycleId,
      symptomsDescription: 'Distinct reddish-brown powdery rust pustules on upper leaves',
      affectedAreaPercent: 20,
      confidenceOverride: 0.94,
    })

    expect(res.status).toBe(201)
    const json = await res.json()
    highConfidenceDiagnosisId = json.data.id

    expect(json.data.confidence).toBe('0.94')
    expect(json.data.severity).toBe('high')
    expect(json.data.reviewStatus).toBe('none')
    expect(json.data.daReviewQueued).toBe(false)
    expect(json.data.recommendations.primaryPrescription.brandName).toBe('Tilt 250 EC')
    expect(json.data.recommendations.primaryPrescription.safetyIntervalDays).toBe(30)
    expect(json.data.recommendations.primaryPrescription.protectiveEquipment.length).toBeGreaterThanOrEqual(3)
  })

  it('3. POST /api/v1/diagnoses triggers DIAG-6 DA task on low confidence (< 0.65)', async () => {
    const res = await req('POST', '/api/v1/diagnoses', {
      plotId: testPlotId,
      cycleId: testCycleId,
      symptomsDescription: 'Optical glare and dust residue on lower canopy',
      simulateLowConfidence: true,
      confidenceOverride: 0.58,
    })

    expect(res.status).toBe(201)
    const json = await res.json()
    lowConfidenceDiagnosisId = json.data.id

    expect(json.data.confidence).toBe('0.58')
    expect(json.data.reviewStatus).toBe('pending_da_review')
    expect(json.data.daReviewQueued).toBe(true)
    expect(json.data.daTask).toBeDefined()
    expect(json.data.daTask.taskType).toBe('diagnosis_review')
    expect(json.data.daTask.checklist.length).toBe(3)
    linkedDaTaskId = json.data.daTask.id
  })

  it('4. GET /api/v1/diagnoses/:id returns complete diagnosis and prescription', async () => {
    const res = await req('GET', `/api/v1/diagnoses/${highConfidenceDiagnosisId}`)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.id).toBe(highConfidenceDiagnosisId)
    expect(json.data.pest).toBeDefined()
    expect(json.data.pest.code).toBe('wheat_stem_rust')
  })

  it('5. GET /api/v1/diagnoses/plot/:plotId lists historical cases for plot', async () => {
    const res = await req('GET', `/api/v1/diagnoses/plot/${testPlotId}`)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.length).toBeGreaterThanOrEqual(2)
  })

  it('6. POST /api/v1/diagnoses/:id/review allows DA to certify and close linked DA task', async () => {
    const res = await req('POST', `/api/v1/diagnoses/${lowConfidenceDiagnosisId}/review`, {
      reviewStatus: 'confirmed',
      notes: 'Physical field inspection verified Puccinia graminis spores using 10x hand lens.',
    })

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.reviewStatus).toBe('reviewed')
    expect(json.data.reviewedAt).toBeDefined()

    // Verify linked da_tasks is marked done
    const taskRes = await req('GET', `/api/v1/da/tasks/${linkedDaTaskId}`)
    expect(taskRes.status).toBe(200)
    const taskJson = await taskRes.json()
    expect(taskJson.data.status).toBe('done')
  })

  it('7. GET /api/v1/diagnoses/:id/audio generates spoken audio narration', async () => {
    const res = await req('GET', `/api/v1/diagnoses/${highConfidenceDiagnosisId}/audio?lang=am`)
    expect(res.status).toBe(200)
  })
})
