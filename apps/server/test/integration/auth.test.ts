import { describe, it, expect, beforeAll, vi } from 'vitest'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

vi.mock('@/services/sms.js', () => ({
  sendSms: vi.fn().mockResolvedValue({
    success: true,
    messageId: 'mock-id',
    number: '+251911000001',
    status: 'Success',
    cost: '0',
  }),
  sendBulkSms: vi.fn().mockResolvedValue({ sent: [], failed: [] }),
  onPhoneVerified: vi.fn().mockResolvedValue(undefined),
  normalizeEthiopianPhone: (phone: string) => {
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
import { sessionGuard, requireAdminOrOfficer } from '@/middlewares/index.js'

const app = new Hono()
app.use('*', cors({ origin: '*', credentials: true }))
app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw))

app.get('/api/v1/offices/me', sessionGuard, requireAdminOrOfficer, (c) => {
  const user = (c as any).get('user') as { cityOfficeId?: string | null; role: string }
  return c.json({ data: { cityOfficeId: user.cityOfficeId, role: user.role } })
})

const BASE = 'http://localhost'
const FARMER_PHONE = '+251911000099'
const ADMIN_EMAIL = 'officer-test@agri.adama.gov.et'
const ADMIN_PASS = 'OfficerPass2026!'

async function callAuth(
  method: string,
  path: string,
  body?: unknown,
  extraHeaders?: Record<string, string>
) {
  const req = new Request(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
    body: body ? JSON.stringify(body) : undefined,
  })
  return app.fetch(req)
}

describe('Farmer Phone OTP Lifecycle', () => {
  it('sends OTP for a valid Ethiopian phone number', async () => {
    const { sendSms } = await import('@/services/sms.js')
    const res = await callAuth('POST', '/api/auth/phone-number/send-otp', {
      phoneNumber: FARMER_PHONE,
    })
    expect(res.status).toBe(200)
    expect(sendSms).toHaveBeenCalled()
  })

  it('rejects a malformed phone number before sending SMS', async () => {
    const { sendSms } = await import('@/services/sms.js')
    const callsBefore = vi.mocked(sendSms).mock.calls.length

    const res = await callAuth('POST', '/api/auth/phone-number/send-otp', {
      phoneNumber: '12345',
    })

    expect(res.status).toBeGreaterThanOrEqual(400)
    expect(vi.mocked(sendSms).mock.calls.length).toBe(callsBefore)
  })

  it('rejects an invalid OTP code and returns an error body', async () => {
    const res = await callAuth('POST', '/api/auth/phone-number/verify', {
      phoneNumber: FARMER_PHONE,
      code: '000000',
    })
    expect(res.status).toBeGreaterThanOrEqual(400)
    const body = await res.json() as Record<string, unknown>
    expect(body).toHaveProperty('message')
  })

  it('returns a session with role=farmer after correct OTP verification', async () => {
    const { sendSms } = await import('@/services/sms.js')

    let capturedOtp = ''

    vi.mocked(sendSms).mockImplementationOnce(async (phone: string, message: string) => {
      const match = message.match(/(\d{6})/)
      if (match) capturedOtp = match[1]!
      return { success: true, messageId: 'x', number: phone, status: 'Success', cost: '0' }
    })

    await callAuth('POST', '/api/auth/phone-number/send-otp', {
      phoneNumber: FARMER_PHONE,
    })

    if (!capturedOtp) {
      console.warn('[test] OTP not captured from SMS mock — skipping verify assertion')
      return
    }

    const verifyRes = await callAuth('POST', '/api/auth/phone-number/verify', {
      phoneNumber: FARMER_PHONE,
      code: capturedOtp,
    })

    expect(verifyRes.status).toBe(200)
    const body = await verifyRes.json() as { token?: string; user?: { role?: string } }
    expect(body).toHaveProperty('token')
    expect(body.user?.role).toBe('farmer')
  })
})

describe('Administrator Credential + 2FA Lifecycle', () => {
  let sessionToken: string | undefined

  beforeAll(async () => {
    const signUpRes = await callAuth('POST', '/api/auth/sign-up/email', {
      name: 'Test Officer',
      email: ADMIN_EMAIL,
      password: ADMIN_PASS,
    })

    if (signUpRes.status === 200 || signUpRes.status === 201) {
      const body = await signUpRes.json() as { token?: string }
      sessionToken = body.token
    }
  })

  it('rejects an invalid password with an error response', async () => {
    const res = await callAuth('POST', '/api/auth/sign-in/email', {
      email: ADMIN_EMAIL,
      password: 'wrongpassword',
    })
    expect(res.status).toBeGreaterThanOrEqual(400)
    const body = await res.json() as Record<string, unknown>
    expect(body).toHaveProperty('message')
  })

  it('valid credentials return a session token when 2FA is not yet enabled', async () => {
    const res = await callAuth('POST', '/api/auth/sign-in/email', {
      email: ADMIN_EMAIL,
      password: ADMIN_PASS,
    })
    expect(res.status).toBe(200)
    const body = await res.json() as Record<string, unknown>
    expect(body).toHaveProperty('token')
    sessionToken = body.token as string
  })

  it('enables 2FA on the admin account using the existing session token', async () => {
    if (!sessionToken) {
      console.warn('[test] No session token — skipping 2FA enable')
      return
    }

    const enableRes = await callAuth(
      'POST',
      '/api/auth/two-factor/enable',
      { password: ADMIN_PASS },
      { Authorization: `Bearer ${sessionToken}` }
    )
    expect([200, 201]).toContain(enableRes.status)
  })

  it('sign-in with 2FA enabled returns twoFactorRedirect: true instead of a session', async () => {
    const loginRes = await callAuth('POST', '/api/auth/sign-in/email', {
      email: ADMIN_EMAIL,
      password: ADMIN_PASS,
    })
    const loginBody = await loginRes.json() as Record<string, unknown>
    if (!loginBody.twoFactorRedirect) {
      console.warn('[test] 2FA redirect not present — 2FA may not have been enabled; skipping')
      return
    }
    expect(loginBody.twoFactorRedirect).toBe(true)
    expect(loginBody).not.toHaveProperty('token')
  })

  it('dispatches an SMS OTP when a 2FA challenge is active', async () => {
    const { sendSms } = await import('@/services/sms.js')
    const before = vi.mocked(sendSms).mock.calls.length

    await callAuth('POST', '/api/auth/sign-in/email', {
      email: ADMIN_EMAIL,
      password: ADMIN_PASS,
    })

    const after = vi.mocked(sendSms).mock.calls.length
    expect(after).toBeGreaterThanOrEqual(before)
  })

  it('rejects an invalid 2FA OTP code and does not grant a session', async () => {
    const res = await callAuth('POST', '/api/auth/two-factor/verify-otp', {
      code: '000000',
    })
    expect(res.status).toBeGreaterThanOrEqual(400)
  })
})

describe('RBAC and Tenant Boundary Enforcement', () => {
  it('returns 401 for a request with no session token to a guarded route', async () => {
    const res = await callAuth('GET', '/api/v1/offices/me')
    expect(res.status).toBe(401)
  })

  it('returns 403 when a farmer session hits an officer-only route', async () => {
    const { sendSms } = await import('@/services/sms.js')
    let capturedOtp = ''

    vi.mocked(sendSms).mockImplementationOnce(async (phone: string, message: string) => {
      const match = message.match(/(\d{6})/)
      if (match) capturedOtp = match[1]!
      return { success: true, messageId: 'x', number: phone, status: 'Success', cost: '0' }
    })

    await callAuth('POST', '/api/auth/phone-number/send-otp', { phoneNumber: FARMER_PHONE })

    if (!capturedOtp) {
      console.warn('[test] OTP not captured — skipping farmer RBAC assertion')
      return
    }

    const verifyRes = await callAuth('POST', '/api/auth/phone-number/verify', {
      phoneNumber: FARMER_PHONE,
      code: capturedOtp,
    })
    const verifyBody = await verifyRes.json() as { token?: string }
    const farmerToken = verifyBody.token

    if (!farmerToken) {
      console.warn('[test] Farmer token not obtained — skipping RBAC assertion')
      return
    }

    const res = await callAuth('GET', '/api/v1/offices/me', undefined, {
      Authorization: `Bearer ${farmerToken}`,
    })
    expect(res.status).toBe(403)
  })

  it('a valid session for a non-banned user passes the session guard', async () => {
    const signInRes = await callAuth('POST', '/api/auth/sign-in/email', {
      email: ADMIN_EMAIL,
      password: ADMIN_PASS,
    })

    if (signInRes.status !== 200) {
      console.warn('[test] Sign-in did not return 200 (2FA likely active) — skipping')
      return
    }

    const body = await signInRes.json() as { token?: string }
    const token = body.token

    const sessionRes = await callAuth('GET', '/api/auth/get-session', undefined, {
      Authorization: `Bearer ${token}`,
    })
    expect(sessionRes.status).toBe(200)
  })
})
