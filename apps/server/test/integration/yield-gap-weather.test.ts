import { describe, it, expect, vi, beforeAll } from 'vitest'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

vi.mock('@/services/sms.js', () => ({
  sendSms: vi.fn().mockResolvedValue({
    success: true,
    messageId: 'mock-sms-id',
    number: '+251911000005',
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
    audio: Buffer.from('RIFF mock audio buffer yield gap advisory'),
    mimeType: 'audio/wav',
  }),
}))

import { auth } from '@/config/auth.js'
import { mobileAuthRouter } from '@/routes/mobile-auth.js'
import { farmersRouter } from '@/routes/farmers.js'
import { plotsRouter } from '@/routes/plots.js'
import { cropCyclesRouter } from '@/routes/crop-cycles.js'
import { yieldGapRouter } from '@/routes/yield-gap.js'
import { weatherRouter } from '@/routes/weather.js'

const app = new Hono()
app.use('*', cors({ origin: '*', credentials: true }))
app.route('/api/auth', mobileAuthRouter)
app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw))
app.route('/api/v1/farmers', farmersRouter)
app.route('/api/v1/plots', plotsRouter)
app.route('/api/v1/cycles', cropCyclesRouter)
app.route('/api/v1/yield-gap', yieldGapRouter)
app.route('/api/v1/weather', weatherRouter)

const BASE = 'http://localhost'
const RUN_ID = Date.now()
const TEST_PHONE = `+25191${String(RUN_ID).slice(-7)}`
const TEST_PASSWORD = 'FarmerSecret123!'

let farmerBearerToken = ''
let testPlotId = ''
let testCycleId = ''
let evaluatedYieldGapId = ''

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

describe('Phase 7: Yield Gap Analysis, Satellite Indices & Agro-Weather Advisory Integration', () => {
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
      name: 'Tesfaye Alemu',
      preferredLanguage: 'am',
    })
    const verifyData = await verifyRes.json()
    farmerBearerToken = verifyData.data.token

    // 3. Setup Farmer Profile
    await req('POST', '/api/v1/farmers/me', {
      fullName: 'Tesfaye Alemu',
      localIdNumber: `FARM-P7-${String(RUN_ID).slice(-5)}`,
      preferredLanguage: 'am',
    }, farmerBearerToken)

    // 4. Register Plot
    const plotRes = await req(
      'POST',
      '/api/v1/farmers/me/plots',
      {
        name: 'Lower Field (Teff - Koticha)',
        areaValue: 1.0,
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

    // 5. Initiate Crop Cycle
    const cycleRes = await req(
      'POST',
      `/api/v1/plots/${testPlotId}/cycles`,
      {
        seasonYear: 2026,
      },
      farmerBearerToken
    )
    const cycleJson = await cycleRes.json()
    testCycleId = cycleJson.data.id

    // 5. Log Sowing & Fertilizer & Harvest to simulate closed cycle
    await req(
      'PUT',
      `/api/v1/cycles/${testCycleId}/sowing`,
      {
        plantingDate: '2024-06-20',
        seedVarietyOther: 'Local Brown Teff',
        seedSource: 'recycled_local',
        seedQuantityKg: 30,
        seedRateKgPerHa: 30,
      },
      farmerBearerToken
    )

    await req(
      'PUT',
      `/api/v1/cycles/${testCycleId}/fertilizer-logs/basal`,
      {
        product: 'nps',
        applied: true,
        quantityKg: 100,
        applicationDate: '2024-06-20',
      },
      farmerBearerToken
    )

    await req(
      'PUT',
      `/api/v1/cycles/${testCycleId}/fertilizer-logs/urea_1`,
      {
        applied: true,
        quantityKg: 50,
        applicationDate: '2024-07-20',
        growthStage: 'vegetative',
      },
      farmerBearerToken
    )

    await req(
      'PUT',
      `/api/v1/cycles/${testCycleId}/fertilizer-logs/urea_2`,
      {
        applied: true,
        quantityKg: 50,
        applicationDate: '2024-08-10',
        growthStage: 'flowering',
      },
      farmerBearerToken
    )

    await req(
      'POST',
      `/api/v1/cycles/${testCycleId}/harvest`,
      {
        harvestDate: '2024-11-05',
        enteredVolume: 18.0,
        enteredUnit: 'quintal',
        yieldQtPerHa: 18.0,
        confirmHighYield: false,
      },
      farmerBearerToken
    )
  }, 30000)

  it('1. GET /api/v1/weather/current returns live conditions and Farm-or-Not decisions', async () => {
    const res = await req('GET', '/api/v1/weather/current?lat=8.5&lon=39.3')
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data.current).toBeDefined()
    expect(json.data.current.tempC).toBe(24)
    expect(json.data.current.soilCondition.state).toBe('Friable')
    expect(json.data.decisions).toBeDefined()
    expect(json.data.decisions.plowing.decision).toBe('GO')
    expect(json.data.decisions.spraying.decision).toBe('GO')
    expect(json.data.decisions.harvesting.decision).toBe('WAIT')
  })

  it('2. GET /api/v1/weather/forecast returns 7-day agricultural outlook', async () => {
    const res = await req('GET', '/api/v1/weather/forecast?lat=8.5&lon=39.3')
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data.forecastDays.length).toBe(7)
    expect(json.data.forecastDays[0].dayLabel).toBe('TODAY')
    expect(json.data.forecastDays[0].suitabilityRating).toBe('GO')
  })

  it('3. GET /api/v1/weather/alerts retrieves extreme weather warnings', async () => {
    const res = await req('GET', '/api/v1/weather/alerts?lat=8.5&lon=39.3')
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data.length).toBeGreaterThanOrEqual(1)
    expect(['frost', 'downpour']).toContain(json.data[0].alertType)
  })

  it('4. POST /api/v1/weather/alerts broadcasts and updates alerts', async () => {
    const res = await req('POST', '/api/v1/weather/alerts', {
      gridLatitude: 8.5,
      gridLongitude: 39.3,
      alertType: 'downpour',
      startsOn: '2024-10-25',
      endsOn: '2024-10-27',
      details: {
        title: 'Heavy Unseasonal Downpour Alert',
        severity: 'high',
        description: 'Unseasonal heavy rain expected during teff harvest window.',
      },
    })
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data.alertType).toBe('downpour')
  })

  it('5. GET /api/v1/weather/advisory/audio generates weekly audio advisory stream', async () => {
    const res = await req('GET', '/api/v1/weather/advisory/audio?lang=am')
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toContain('audio/wav')
  })

  it('6. POST /api/v1/yield-gap/evaluate computes 3-bar comparison and ranked root causes', async () => {
    const res = await req(
      'POST',
      '/api/v1/yield-gap/evaluate',
      {
        cycleId: testCycleId,
        engineVersion: 'v1.3-gemini',
      },
      farmerBearerToken
    )
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data.id).toBeDefined()
    evaluatedYieldGapId = json.data.id

    // Check 3-bar benchmark metrics
    expect(json.data.metrics.realizedYieldQtPerHa).toBe(18.0)
    expect(json.data.metrics.cohortMedianQtPerHa).toBe(26.5)
    expect(json.data.metrics.cohortTopQuartileQtPerHa).toBe(32.0)
    expect(json.data.metrics.gapPercent).toBe(43.8)
    expect(json.data.metrics.absoluteGapQtPerHa).toBe(14.0)

    // Check ranked root causes (3 causes)
    expect(json.data.factorResults.length).toBe(3)
    expect(json.data.factorResults[0].factor).toBe('urea_2_timing')
    expect(json.data.factorResults[0].lossContributionPercent).toBe(40)
    expect(json.data.factorResults[1].factor).toBe('weeding_window')
    expect(json.data.factorResults[2].factor).toBe('seed_genetic_purity')

    // Check next season action recommendations
    expect(json.data.recommendations.length).toBe(2)
    expect(json.data.recommendations[0].title).toContain('Schedule 2nd Urea')
  })

  it('7. GET /api/v1/yield-gap/cycle/:cycleId fetches latest evaluation for cycle', async () => {
    const res = await req('GET', `/api/v1/yield-gap/cycle/${testCycleId}`, undefined, farmerBearerToken)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data.id).toBe(evaluatedYieldGapId)
    expect(json.data.plotYieldQtPerHa).toBe('18.00')
    expect(json.data.cohortTopQuartileQtPerHa).toBe('32.00')
  })

  it('8. GET /api/v1/yield-gap/:id fetches analysis by ID', async () => {
    const res = await req('GET', `/api/v1/yield-gap/${evaluatedYieldGapId}`, undefined, farmerBearerToken)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.id).toBe(evaluatedYieldGapId)
  })

  it('9. GET /api/v1/yield-gap/:id/audio synthesizes plain-language voice explanation', async () => {
    const res = await req('GET', `/api/v1/yield-gap/${evaluatedYieldGapId}/audio?lang=am`, undefined, farmerBearerToken)
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toContain('audio/wav')
  })
})
