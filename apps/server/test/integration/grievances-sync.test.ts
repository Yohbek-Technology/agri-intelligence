import { describe, it, expect, vi, beforeAll } from 'vitest'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

vi.mock('@/services/sms.js', () => ({
  sendSms: vi.fn().mockResolvedValue({
    success: true,
    messageId: 'mock-sms-id',
    number: '+251911000008',
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
  getIO: vi.fn().mockReturnValue({
    emit: vi.fn(),
  }),
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
import { grievancesRouter } from '@/routes/grievances.js'
import { syncRouter, devicesRouter, appVersionRouter } from '@/routes/sync.js'
import crypto from 'node:crypto'

const app = new Hono()
app.use('*', cors({ origin: '*', credentials: true }))
app.route('/api/auth', mobileAuthRouter)
app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw))
app.route('/api/v1/farmers', farmersRouter)
app.route('/api/v1/plots', plotsRouter)
app.route('/api/v1/grievances', grievancesRouter)
app.route('/api/v1/sync', syncRouter)
app.route('/api/v1/devices', devicesRouter)
app.route('/api/v1/app', appVersionRouter)

const BASE = 'http://localhost'
const RUN_ID = Date.now()
const TEST_PHONE = `+25191${String(RUN_ID).slice(-7)}`
const TEST_PASSWORD = 'FarmerSecret123!'

let farmerBearerToken = ''
let testPlotId = ''
let createdGrievanceId = ''
const clientGrievanceUUID = crypto.randomUUID()

async function req(
  method: string,
  path: string,
  body?: any,
  token?: string,
  extraHeaders: Record<string, string> = {}
) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await app.request(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  return res
}

describe('Phase 8: Farmer Voice Grievance Box & Offline Sync Engine Integration', () => {
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
      name: 'Alemayehu Tadesse',
      preferredLanguage: 'am',
    })
    const verifyData = await verifyRes.json()
    farmerBearerToken = verifyData.data.token

    // 3. Setup Farmer Profile
    await req(
      'POST',
      '/api/v1/farmers/me',
      {
        fullName: 'Alemayehu Tadesse',
        localIdNumber: `FARM-P8-${String(RUN_ID).slice(-5)}`,
        preferredLanguage: 'am',
      },
      farmerBearerToken
    )

    // 4. Register Plot for Grievance Context
    const plotRes = await req(
      'POST',
      '/api/v1/farmers/me/plots',
      {
        name: 'Lower Field (Teff - Koticha)',
        areaValue: 1.2,
        areaUnit: 'hectare',
        centroidLatitude: 8.54,
        centroidLongitude: 39.27,
        gpsAccuracyMeters: 4.5,
        elevationMeters: 1710,
        agroZone: 'weyna_dega',
        soilClass: 'koticha_vertisol',
        drainage: 'waterlogs',
        plannedCropName: 'Teff (Quncho)',
        plannedSeasonYear: 2026,
      },
      farmerBearerToken
    )
    const plotJson = await plotRes.json()
    testPlotId = plotJson.data.id
  }, 30000)

  it('1. GET /api/v1/app/version returns app version policy', async () => {
    const res = await req('GET', '/api/v1/app/version')
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.min_supported_app_version).toBeDefined()
    expect(json.latest_app_version).toBeDefined()
    expect(json.update_required).toBe(false)
  })

  it('2. POST /api/v1/devices registers mobile client device', async () => {
    const res = await req(
      'POST',
      '/api/v1/devices',
      {
        deviceIdentifier: `test-device-${RUN_ID}`,
        platform: 'android',
        appVersion: '1.0.0',
        fcmToken: 'mock-fcm-token-ethiopia',
      },
      farmerBearerToken
    )

    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.data.deviceIdentifier).toBe(`test-device-${RUN_ID}`)
    expect(json.data.platform).toBe('android')
  })

  it('3. POST /api/v1/grievances submits new grievance ticket with voice and text notes', async () => {
    const res = await req(
      'POST',
      '/api/v1/grievances',
      {
        id: clientGrievanceUUID,
        category: 'input_shortage',
        plotId: testPlotId,
        textNote: 'Urea Depot 2 out of stock / የዩሪያ አቅርቦት በመጋዘን 2 አልቋል',
        priority: 'urgent',
        photoMediaIds: [],
      },
      farmerBearerToken
    )

    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.data.id).toBe(clientGrievanceUUID)
    expect(json.data.status).toBe('submitted')
    expect(json.data.category).toBe('input_shortage')
    createdGrievanceId = json.data.id
  })

  it('4. POST /api/v1/grievances with same UUID is idempotent and prevents duplicate tickets', async () => {
    const res = await req(
      'POST',
      '/api/v1/grievances',
      {
        id: clientGrievanceUUID,
        category: 'input_shortage',
        plotId: testPlotId,
        textNote: 'Duplicate submission attempt',
      },
      farmerBearerToken
    )

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.idempotent).toBe(true)
    expect(json.data.id).toBe(clientGrievanceUUID)
  })

  it('5. GET /api/v1/grievances lists farmer tickets', async () => {
    const res = await req('GET', '/api/v1/grievances', undefined, farmerBearerToken)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(Array.isArray(json.data)).toBe(true)
    expect(json.data.length).toBeGreaterThanOrEqual(1)
    expect(json.data[0].plotName).toBeDefined()
  })

  it('6. GET /api/v1/grievances/:id retrieves ticket details and plot context', async () => {
    const res = await req('GET', `/api/v1/grievances/${createdGrievanceId}`, undefined, farmerBearerToken)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.id).toBe(createdGrievanceId)
    expect(json.data.plot.name).toBe('Lower Field (Teff - Koticha)')
  })

  it('7. POST /api/v1/grievances/:id/messages adds follow-up message to thread', async () => {
    const res = await req(
      'POST',
      `/api/v1/grievances/${createdGrievanceId}/messages`,
      {
        messageType: 'text',
        textBody: 'When will the new shipment arrive? / አዲሱ ጭነት መቼ ይደርሳል?',
      },
      farmerBearerToken
    )

    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.data.textBody).toContain('When will the new shipment arrive?')
  })

  it('8. GET /api/v1/grievances/:id/messages returns chronological thread messages', async () => {
    const res = await req('GET', `/api/v1/grievances/${createdGrievanceId}/messages`, undefined, farmerBearerToken)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(Array.isArray(json.data)).toBe(true)
    expect(json.data.length).toBeGreaterThanOrEqual(2)
  })

  it('9. POST /api/v1/grievances/:id/confirm allows farmer to confirm resolution', async () => {
    const res = await req('POST', `/api/v1/grievances/${createdGrievanceId}/confirm`, {}, farmerBearerToken)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.status).toBe('resolved')
    expect(json.data.resolvedAt).toBeDefined()
  })

  it('10. POST /api/v1/grievances/:id/reopen allows reopening ticket within 7-day cutoff', async () => {
    const res = await req(
      'POST',
      `/api/v1/grievances/${createdGrievanceId}/reopen`,
      { reason: 'Depot still has no stock / አሁንም በመጋዘኑ ምንም ክምችት የለም' },
      farmerBearerToken
    )

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.status).toBe('reopened')
  })

  it('11. PATCH /api/v1/grievances/:id/status updates status to in_progress', async () => {
    const res = await req(
      'PATCH',
      `/api/v1/grievances/${createdGrievanceId}/status`,
      { status: 'in_progress', note: 'DA assigned to depot verification' },
      farmerBearerToken
    )

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.status).toBe('in_progress')
  })

  it('12. POST /api/v1/sync/push ingests batch of mutations and advances monotonic cursor', async () => {
    const testEntityId = crypto.randomUUID()
    const payload = { note: 'Offline logged field observation' }
    const payloadHash = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex')

    const res = await req(
      'POST',
      '/api/v1/sync/push',
      {
        mutations: [
          {
            id: crypto.randomUUID(),
            client_sequence_number: 1,
            entity_type: 'field_log',
            entity_id: testEntityId,
            operation: 'insert',
            payload,
            payload_hash: payloadHash,
            client_created_at: new Date().toISOString(),
          },
        ],
      },
      farmerBearerToken,
      { 'X-Device-Id': `test-device-${RUN_ID}` }
    )

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.results[0].status).toBe('applied')
    expect(json.server_cursor).toBeGreaterThan(0)
  })

  it('13. GET /api/v1/sync/pull retrieves monotonic changes since cursor', async () => {
    const res = await req('GET', '/api/v1/sync/pull?cursor=0&limit=10', undefined, farmerBearerToken)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(Array.isArray(json.changes)).toBe(true)
    expect(json.changes.length).toBeGreaterThanOrEqual(1)
    expect(json.next_cursor).toBeGreaterThan(0)
  })

  it('14. GET /api/v1/sync/bootstrap provides initial catalogs and plot snapshot', async () => {
    const res = await req('GET', '/api/v1/sync/bootstrap', undefined, farmerBearerToken)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.catalogs.crops).toBeDefined()
    expect(json.data.catalogs.varieties).toBeDefined()
    expect(json.data.plots).toBeDefined()
  })
})
