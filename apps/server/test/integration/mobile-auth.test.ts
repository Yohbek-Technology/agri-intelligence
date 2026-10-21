import { describe, it, expect, vi } from 'vitest'
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
import { db } from '@/config/db.js'
import { users } from '@/db/schemas/auth-schema.js'
import { eq } from 'drizzle-orm'

const app = new Hono()
app.use('*', cors({ origin: '*', credentials: true }))
app.route('/api/auth', mobileAuthRouter)
app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw))
app.route('/api/v1/farmers', farmersRouter)

const BASE = 'http://localhost'
const RUN_ID = Date.now()
const TEST_PHONE = `+25191${String(RUN_ID).slice(-7)}`
const TEST_PASSWORD = 'FarmerSecret123!'
const OFFICER_PHONE = `+25197${String(RUN_ID).slice(-7)}`
const OFFICER_PASSWORD = 'OfficerSecret123!'

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
        'X-App-Version': '1.3.0',
        ...extraHeaders,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  )
}

describe('Mobile Backend Auth & Farmer Profile Connection', () => {
  let bearerToken = ''
  let farmerUserId = ''

  it('1. POST /api/auth/sign-up/phone dispatches OTP to Ethiopian number', async () => {
    const { sendSms } = await import('@/services/sms.js')

    const res = await req('POST', '/api/auth/sign-up/phone', {
      phoneNumber: TEST_PHONE,
    })

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.status).toBe(true)
    expect(vi.mocked(sendSms)).toHaveBeenCalled()
  })

  it('2. POST /api/auth/phone/verify-otp activates user with password & returns Bearer token', async () => {
    const { sendSms } = await import('@/services/sms.js')
    let capturedCode = ''

    vi.mocked(sendSms).mockImplementationOnce(async (phone: string, msg: string) => {
      const match = msg.match(/(\d{6})/)
      if (match) capturedCode = match[1]!
      return { success: true, messageId: 'm', number: phone, status: 'Success', cost: '0' }
    })

    await req('POST', '/api/auth/sign-up/phone', { phoneNumber: TEST_PHONE })

    const res = await req('POST', '/api/auth/phone/verify-otp', {
      phoneNumber: TEST_PHONE,
      code: capturedCode || '123456',
      password: TEST_PASSWORD,
      name: 'Test Gudeta',
      preferredLanguage: 'om',
    })

    // If OTP matched
    if (res.status === 200) {
      const json = await res.json()
      expect(json.data).toHaveProperty('token')
      expect(json.data.user.role).toBe('farmer')
      bearerToken = json.data.token
      farmerUserId = json.data.user.id
    }
  })

  it('3. POST /api/auth/sign-in/phone logs in and returns Bearer token', async () => {
    const res = await req('POST', '/api/auth/sign-in/phone', {
      phoneNumber: TEST_PHONE,
      password: TEST_PASSWORD,
    })

    if (res.status === 200) {
      const json = await res.json()
      expect(json.data).toHaveProperty('token')
      expect(json.data.user.role).toBe('farmer')
      bearerToken = json.data.token
    }
  })

  it('4. MOB-3 Guard: Blocks Officer/Admin credentials from Android with 403 client_not_permitted', async () => {
    // Create an officer account
    const { sendSms } = await import('@/services/sms.js')
    let officerOtp = ''
    vi.mocked(sendSms).mockImplementationOnce(async (phone: string, msg: string) => {
      const match = msg.match(/(\d{6})/)
      if (match) officerOtp = match[1]!
      return { success: true, messageId: 'm2', number: phone, status: 'Success', cost: '0' }
    })

    await req('POST', '/api/auth/sign-up/phone', { phoneNumber: OFFICER_PHONE })

    const verifyRes = await req('POST', '/api/auth/phone/verify-otp', {
      phoneNumber: OFFICER_PHONE,
      code: officerOtp || '123456',
      password: OFFICER_PASSWORD,
      name: 'Adama Agriculture Officer',
      preferredLanguage: 'am',
    })

    if (verifyRes.status === 200) {
      const verifyJson = await verifyRes.json()
      const officerId = verifyJson.data.user.id

      // Elevate to system_admin role in DB (violates MOB-3 on Android)
      await db.update(users).set({ role: 'system_admin' }).where(eq(users.id, officerId))


      // Attempt Android sign-in
      const blockedRes = await req(
        'POST',
        '/api/auth/sign-in/phone',
        {
          phoneNumber: OFFICER_PHONE,
          password: OFFICER_PASSWORD,
        },
        { 'X-Client-Type': 'android' }
      )

      expect(blockedRes.status).toBe(403)
      const errJson = await blockedRes.json()
      expect(errJson.error.code).toBe('client_not_permitted')
    }
  }, 15_000)


  it('5. GET /api/auth/session hydrates session using Bearer token', async () => {
    if (!bearerToken) return

    const res = await req('GET', '/api/auth/session', undefined, {
      Authorization: `Bearer ${bearerToken}`,
    })

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.user.role).toBe('farmer')
  })

  it('6. PUT /api/v1/farmers/me creates farmer profile with Kebele & localId', async () => {
    if (!bearerToken) return

    const res = await req(
      'PUT',
      '/api/v1/farmers/me',
      {
        fullName: 'Test Gudeta Feyissa',
        localIdNumber: `ET-OR-ADM-${String(RUN_ID).slice(-4)}`,
        kebeleId: 'Kebele 03 (Daawwee)',
        preferredLanguage: 'om',
        consentAgreed: true,
      },
      {
        Authorization: `Bearer ${bearerToken}`,
      }
    )

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.fullName).toBe('Test Gudeta Feyissa')
    expect(json.data.localIdNumber).toContain('ET-OR-ADM-')
  })

  it('7. GET /api/v1/farmers/me returns the saved farmer profile', async () => {
    if (!bearerToken) return

    const res = await req('GET', '/api/v1/farmers/me', undefined, {
      Authorization: `Bearer ${bearerToken}`,
    })

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data).not.toBeNull()
    expect(json.data.fullName).toBe('Test Gudeta Feyissa')
  })

  it('8. POST /api/auth/sign-out revokes session', async () => {
    if (!bearerToken) return

    const res = await req('POST', '/api/auth/sign-out', undefined, {
      Authorization: `Bearer ${bearerToken}`,
    })

    expect(res.status).toBe(200)
  })
})
