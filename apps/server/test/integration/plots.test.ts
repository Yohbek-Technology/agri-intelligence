import { describe, it, expect, vi, beforeAll } from 'vitest'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

vi.mock('@/services/sms.js', () => ({
  sendSms: vi.fn().mockResolvedValue({
    success: true,
    messageId: 'mock-sms-id',
    number: '+251911000002',
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

const app = new Hono()
app.use('*', cors({ origin: '*', credentials: true }))
app.route('/api/auth', mobileAuthRouter)
app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw))
app.route('/api/v1/farmers', farmersRouter)
app.route('/api/v1/plots', plotsRouter)

const BASE = 'http://localhost'
const RUN_ID = Date.now()
const TEST_PHONE = `+25191${String(RUN_ID).slice(-7)}`
const TEST_PASSWORD = 'FarmerSecret123!'

let farmerBearerToken = ''
let testPlotId = ''

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
        'X-Device-Id': 'integration-test-device-plots',
        'X-App-Version': '1.0.0',
        Accept: 'application/json',
        ...(farmerBearerToken ? { Authorization: `Bearer ${farmerBearerToken}` } : {}),
        ...extraHeaders,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    })
  )
}

describe('Phase 4: Land Parcel & Plot Management Integration', () => {
  beforeAll(async () => {
    const { sendSms } = await import('@/services/sms.js')
    let capturedCode = ''

    vi.mocked(sendSms).mockImplementation((phone: string, msg: string) => {
      const match = msg.match(/(\d{6})/)
      if (match) capturedCode = match[1]!
      return Promise.resolve({ success: true, messageId: 'm', number: phone, status: 'Success', cost: '0' })
    })

    // 1. Request sign up OTP
    await req('POST', '/api/auth/sign-up/phone', { phoneNumber: TEST_PHONE })

    // 2. Verify OTP and get bearer token
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
    await req('POST', '/api/v1/farmers/me', {
      fullName: 'Alemayehu Tadesse',
      localIdNumber: `FARMER-PLOTS-${String(RUN_ID).slice(-5)}`,
      preferredLanguage: 'am',
    })
  })

  it('1. Resolves geo elevation and derived agro-ecological zone', async () => {
    const res = await req('GET', '/api/v1/plots/geo/resolve?lat=8.5411&lng=39.2704')
    expect(res.status).toBe(200)

    const json = await res.json()
    expect(json.data).toBeDefined()
    expect(json.data.elevationMeters).toBe(1710)
    expect(json.data.agroZoneDerived).toBe('weyna_dega')
    expect(json.data.accuracyThresholdMeters).toBe(10)
  })

  it('2. Denies unauthenticated plot creation', async () => {
    const unauthRes = await app.fetch(
      new Request(`${BASE}/api/v1/plots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Hacker Plot' }),
      })
    )
    expect(unauthRes.status).toBe(401)
  })

  it('3. Registers new plot with Timad local unit and Koticha soil', async () => {
    const res = await req('POST', '/api/v1/farmers/me/plots', {
      name: 'Lower Field (ታችኛው ማሳ)',
      areaValue: 2.0,
      areaUnit: 'timad',
      centroidLatitude: 8.5411,
      centroidLongitude: 39.2704,
      gpsAccuracyMeters: 8.5,
      elevationMeters: 1710,
      soilClass: 'koticha_vertisol',
      drainage: 'waterlogs',
    })

    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.data).toBeDefined()
    expect(json.data.name).toBe('Lower Field (ታችኛው ማሳ)')
    expect(json.data.areaUnit).toBe('timad')
    expect(parseFloat(json.data.areaValue)).toBe(2.0)
    expect(json.data.hectaresPerUnitApplied).toBe('0.250000')
    expect(json.data.agroZone).toBe('weyna_dega')
    expect(json.data.status).toBe('active')

    testPlotId = json.data.id
    expect(testPlotId).toBeDefined()
  })

  it('4. Lists farmer plots via /api/v1/farmers/me/plots', async () => {
    const res = await req('GET', '/api/v1/farmers/me/plots')
    expect(res.status).toBe(200)

    const json = await res.json()
    expect(Array.isArray(json.data)).toBe(true)
    expect(json.data.length).toBeGreaterThanOrEqual(1)
    const found = json.data.find((p: any) => p.id === testPlotId)
    expect(found).toBeDefined()
    expect(found.name).toBe('Lower Field (ታችኛው ማሳ)')
  })

  it('5. Retrieves plot details via /api/v1/plots/:id', async () => {
    const res = await req('GET', `/api/v1/plots/${testPlotId}`)
    expect(res.status).toBe(200)

    const json = await res.json()
    expect(json.data.id).toBe(testPlotId)
    expect(json.data.soilClass).toBe('koticha_vertisol')
    expect(json.data.drainage).toBe('waterlogs')
    expect(json.data.elevationMeters).toBe(1710)
  })

  it('6. Updates plot attributes via PATCH /api/v1/plots/:id', async () => {
    const res = await req('PATCH', `/api/v1/plots/${testPlotId}`, {
      name: 'Lower Field - Terraced',
      drainage: 'moderate',
    })

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.name).toBe('Lower Field - Terraced')
    expect(json.data.drainage).toBe('moderate')
  })

  it('7. Records multi-season crop rotation history', async () => {
    const res = await req('POST', `/api/v1/plots/${testPlotId}/crop-history`, {
      seasonYear: 2023,
      fallow: true,
    })

    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.data.seasonYear).toBe(2023)
    expect(json.data.fallow).toBe(true)
  })

  it('8. Retrieves crop rotation history via /api/v1/plots/:id/crop-history', async () => {
    const res = await req('GET', `/api/v1/plots/${testPlotId}/crop-history`)
    expect(res.status).toBe(200)

    const json = await res.json()
    expect(Array.isArray(json.data)).toBe(true)
    expect(json.data.length).toBeGreaterThanOrEqual(1)
    expect(json.data[0].seasonYear).toBe(2023)
  })

  it('9. Soft-archives and restores plot', async () => {
    // Archive
    const archiveRes = await req('POST', `/api/v1/plots/${testPlotId}/archive`)
    expect(archiveRes.status).toBe(200)
    const archiveJson = await archiveRes.json()
    expect(archiveJson.data.status).toBe('archived')

    // Restore
    const restoreRes = await req('POST', `/api/v1/plots/${testPlotId}/restore`)
    expect(restoreRes.status).toBe(200)
    const restoreJson = await restoreRes.json()
    expect(restoreJson.data.status).toBe('active')
  })
})
