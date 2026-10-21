import { describe, it, expect, vi, beforeAll } from 'vitest'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

vi.mock('@/services/sms.js', () => ({
  sendSms: vi.fn().mockResolvedValue({
    success: true,
    messageId: 'mock-sms-id',
    number: '+251911000003',
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

import { auth } from '@/config/auth.js'
import { mobileAuthRouter } from '@/routes/mobile-auth.js'
import { farmersRouter } from '@/routes/farmers.js'
import { plotsRouter } from '@/routes/plots.js'
import { cropCyclesRouter } from '@/routes/crop-cycles.js'
import { daTasksRouter } from '@/routes/da-tasks.js'

const app = new Hono()
app.use('*', cors({ origin: '*', credentials: true }))
app.route('/api/auth', mobileAuthRouter)
app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw))
app.route('/api/v1/farmers', farmersRouter)
app.route('/api/v1/plots', plotsRouter)
app.route('/api/v1/cycles', cropCyclesRouter)
app.route('/api/v1/da/tasks', daTasksRouter)

const BASE = 'http://localhost'
const RUN_ID = Date.now()
const TEST_PHONE = `+25191${String(RUN_ID).slice(-7)}`
const TEST_PASSWORD = 'FarmerSecret123!'

let farmerBearerToken = ''
let testPlotId = ''
let testCycleId = ''
let testTaskId = ''

async function req(
  method: string,
  path: string,
  body?: unknown,
  extraHeaders?: Record<string, string>
): Promise<Response> {
  return app.fetch(
    new Request(`${BASE}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Type': 'android',
        'X-Device-Id': 'integration-test-device-cycles',
        'X-App-Version': '1.0.0',
        Accept: 'application/json',
        ...(farmerBearerToken ? { Authorization: `Bearer ${farmerBearerToken}` } : {}),
        ...extraHeaders,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    })
  )
}

describe('Phase 5: Crop Lifecycle, Input Event Logging & DA Tasks Integration', () => {
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
      name: 'Sisay Lemma',
      preferredLanguage: 'am',
    })
    const verifyData = await verifyRes.json()
    farmerBearerToken = verifyData.data.token

    // 3. Create profile
    await req('POST', '/api/v1/farmers/me', {
      fullName: 'Sisay Lemma',
      localIdNumber: `FARMER-CYCLE-${String(RUN_ID).slice(-5)}`,
      preferredLanguage: 'am',
    })

    // 4. Register Plot
    const plotRes = await req('POST', '/api/v1/farmers/me/plots', {
      name: 'Lower Field - Teff',
      areaValue: 2.0,
      areaUnit: 'timad',
      centroidLatitude: 8.5411,
      centroidLongitude: 39.2704,
      gpsAccuracyMeters: 8.5,
      elevationMeters: 1710,
      soilClass: 'koticha_vertisol',
      drainage: 'waterlogs',
    })
    const plotData = await plotRes.json()
    testPlotId = plotData.data.id
  })

  it('1. POST /api/v1/plots/:id/cycles initiates active crop cycle', async () => {
    const res = await req('POST', `/api/v1/plots/${testPlotId}/cycles`, {
      seasonYear: 2024,
      startedOn: '2024-06-01',
    })

    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.data).toBeDefined()
    expect(json.data.status).toBe('active')
    expect(json.data.stage).toBe('land_preparation')
    testCycleId = json.data.id
  })

  it('2. Enforces 1 active cycle constraint (409 Conflict)', async () => {
    const res = await req('POST', `/api/v1/plots/${testPlotId}/cycles`, {
      seasonYear: 2024,
    })

    expect(res.status).toBe(409)
    const json = await res.json()
    expect(json.error).toContain('Conflict')
  })

  it('3. PUT /api/v1/cycles/:id/sowing logs planting event', async () => {
    const res = await req('PUT', `/api/v1/cycles/${testCycleId}/sowing`, {
      plantingDate: '2024-06-15',
      seedVarietyOther: 'Quncho DZ-Cr-37',
      seedSource: 'certified_improved',
      seedQuantityKg: 15.0,
      seedRateKgPerHa: 30.0,
    })

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data).toBeDefined()
    expect(json.data.seedVarietyOther).toBe('Quncho DZ-Cr-37')
  })

  it('4. Enforces urea_2_not_after_urea_1 constraint', async () => {
    // Attempting to log Urea 2 without Urea 1 logged or skipped
    const res = await req('PUT', `/api/v1/cycles/${testCycleId}/fertilizer-logs/urea_2`, {
      applied: true,
      quantityKg: 25.0,
      applicationDate: '2024-07-20',
      growthStageAtApplication: 'vegetative',
    })

    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain('2nd Urea cannot be logged before 1st Urea')
  })

  it('5. PUT /api/v1/cycles/:id/fertilizer-logs/basal logs basal NPS', async () => {
    const res = await req('PUT', `/api/v1/cycles/${testCycleId}/fertilizer-logs/basal`, {
      applied: true,
      quantityKg: 50.0,
      applicationDate: '2024-06-15',
      fertilizerProduct: 'nps',
    })

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.applicationType).toBe('basal')
    expect(json.data.fertilizerProduct).toBe('nps')
  })

  it('6. PUT /api/v1/cycles/:id/fertilizer-logs/urea_1 logs 1st Urea top-dress', async () => {
    const res = await req('PUT', `/api/v1/cycles/${testCycleId}/fertilizer-logs/urea_1`, {
      applied: true,
      quantityKg: 25.0,
      applicationDate: '2024-07-05',
      growthStageAtApplication: 'vegetative',
      daysAfterSowing: 38,
    })

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.applicationType).toBe('urea_1')
    expect(json.data.daysAfterSowing).toBe(38)
  })

  it('7. PUT /api/v1/cycles/:id/fertilizer-logs/urea_2 now succeeds after urea_1', async () => {
    const res = await req('PUT', `/api/v1/cycles/${testCycleId}/fertilizer-logs/urea_2`, {
      applied: true,
      quantityKg: 25.0,
      applicationDate: '2024-07-25',
      growthStageAtApplication: 'vegetative',
      daysAfterSowing: 45,
    })

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.applicationType).toBe('urea_2')
  })

  it('8. POST /api/v1/cycles/:id/operations logs field weeding', async () => {
    const res = await req('POST', `/api/v1/cycles/${testCycleId}/operations`, {
      operationType: 'weeding',
      operationDate: '2024-07-10',
      sequenceNumber: 1,
    })

    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.data.operationType).toBe('weeding')
  })

  it('9. Harvest plausibility check triggers 422 warning when yield > 80 Qt/Ha', async () => {
    const res = await req('PUT', `/api/v1/cycles/${testCycleId}/harvest`, {
      harvestDate: '2024-09-30',
      enteredVolume: 48.0,
      enteredUnit: 'quintal',
      yieldQtPerHa: 96.0, // > 80 threshold
      plausibilityConfirmed: false,
    })

    expect(res.status).toBe(422)
    const json = await res.json()
    expect(json.requiresConfirmation).toBe(true)
  })

  it('10. Harvest recorded with confirmation and closes cycle', async () => {
    const res = await req('PUT', `/api/v1/cycles/${testCycleId}/harvest`, {
      harvestDate: '2024-09-30',
      enteredVolume: 14.5,
      enteredUnit: 'quintal',
      yieldQtPerHa: 29.0,
      plausibilityConfirmed: true,
    })

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.enteredVolume).toBe('14.500')
    expect(json.data.plausibilityConfirmed).toBe(true)
  })

  it('11. POST /api/v1/cycles/:id/ledger records costs and revenue', async () => {
    // Add cost
    await req('POST', `/api/v1/cycles/${testCycleId}/ledger`, {
      category: 'input_cost',
      amountEtb: 6450.0,
    })

    // Add revenue
    const revRes = await req('POST', `/api/v1/cycles/${testCycleId}/ledger`, {
      category: 'harvest_revenue',
      amountEtb: 18500.0,
    })

    expect(revRes.status).toBe(201)
  })

  it('12. GET /api/v1/cycles/:id returns full cycle and ledger summary', async () => {
    const res = await req('GET', `/api/v1/cycles/${testCycleId}`)
    expect(res.status).toBe(200)

    const json = await res.json()
    expect(json.data.sowing).toBeDefined()
    expect(json.data.fertilizerLogs.length).toBeGreaterThanOrEqual(3)
    expect(json.data.harvest).toBeDefined()
    expect(json.data.ledger.summary.totalCostEtb).toBe(6450)
    expect(json.data.ledger.summary.expectedRevenueEtb).toBe(18500)
    expect(json.data.ledger.summary.netMarginEtb).toBe(12050)
  })

  it('13. POST and PATCH /api/v1/da/tasks manages DA visits', async () => {
    // 1. Create task
    const createRes = await req('POST', '/api/v1/da/tasks', {
      title: 'Examine elliptical lesions on lower canopy',
      taskType: 'diagnosis_review',
      plotId: testPlotId,
      checklist: [
        { label: 'Check spore presence', checked: false },
        { label: 'Survey 5m radius', checked: false },
      ],
    })

    expect(createRes.status).toBe(201)
    const createJson = await createRes.json()
    testTaskId = createJson.data.id

    // 2. Complete task
    const patchRes = await req('PATCH', `/api/v1/da/tasks/${testTaskId}`, {
      status: 'done',
      checklist: [
        { label: 'Check spore presence', checked: true },
        { label: 'Survey 5m radius', checked: true },
      ],
    })

    expect(patchRes.status).toBe(200)
    const patchJson = await patchRes.json()
    expect(patchJson.data.status).toBe('done')
    expect(patchJson.data.completedAt).toBeDefined()
  })
})
