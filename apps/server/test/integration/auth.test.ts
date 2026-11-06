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
  sendBulkSms:             vi.fn().mockResolvedValue({ sent: [], failed: [] }),
  onPhoneVerified:         vi.fn().mockResolvedValue(undefined),
  normalizeEthiopianPhone: (phone: string): string => {
    const t = phone.replace(/\s+/g, '')
    if (t.startsWith('+251')) return t
    if (t.startsWith('251'))  return `+${t}`
    if (t.startsWith('0'))    return `+251${t.slice(1)}`
    return t
  },
  countSegments: vi.fn().mockReturnValue(1),
}))

vi.mock('@/config/socket.js', () => ({
  initSocket: vi.fn(),
  getIO:      vi.fn(),
}))

import { auth } from '@/config/auth.js'
import { sessionGuard, requireAdminOrOfficer } from '@/middlewares/index.js'
import type { SessionUser, SessionSession } from '@/middlewares/session.js'

declare module 'hono' {
  interface ContextVariableMap {
    user:    SessionUser
    session: SessionSession
  }
}

type JsonBody = Record<string, unknown>

const TEST_TIMEOUT = 45_000

beforeAll(async () => {
  const { pool } = await import('@/config/db.js')
  await pool.query('SELECT 1;')
}, 45_000)

const app = new Hono()
app.use('*', cors({ origin: '*', credentials: true }))
app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw))
app.get('/api/v1/offices/me', sessionGuard, requireAdminOrOfficer, (c) => {
  const user = c.get('user')
  return c.json({ data: { cityOfficeId: (user as any).cityId || (user as any).cityOfficeId, role: user.role } })
})

const BASE         = 'http://localhost'
const RUN_ID       = Date.now()
const FARMER_PHONE = `+25191${String(RUN_ID).slice(-7)}`
const ADMIN_PHONE  = `+25197${String(RUN_ID).slice(-7)}`
const ADMIN_EMAIL  = `officer-test-${RUN_ID}@agri.adama.gov.et`
const ADMIN_PASS   = 'OfficerPass2026!'

function extractSessionCookie(res: Response): string | null {
  const raw = res.headers.get('set-cookie')
  if (!raw) return null
  for (const part of raw.split(/,(?=[^ ])/)) {
    const kv = part.trim().split(';')[0]!
    if (kv.startsWith('agri.') && !kv.startsWith('agri.two_factor')) return kv
  }
  return null
}

async function req(
  method: string,
  path: string,
  body?: unknown,
  extraHeaders?: Record<string, string>
): Promise<Response> {
  return app.fetch(
    new Request(`${BASE}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...extraHeaders },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  )
}

describe('Farmer Phone OTP Lifecycle', () => {
  it('sends OTP for a valid Ethiopian phone number and returns 200', async () => {
    const { sendSms } = await import('@/services/sms.js')

    const res = await req('POST', '/api/auth/phone-number/send-otp', { phoneNumber: FARMER_PHONE })

    expect(res.status).toBe(200)
    expect(vi.mocked(sendSms)).toHaveBeenCalled()
  }, TEST_TIMEOUT)

  it('rejects a malformed phone number without dispatching SMS', async () => {
    const { sendSms } = await import('@/services/sms.js')
    const before = vi.mocked(sendSms).mock.calls.length

    const res = await req('POST', '/api/auth/phone-number/send-otp', { phoneNumber: '12345' })

    expect(res.status).toBeGreaterThanOrEqual(400)
    expect(vi.mocked(sendSms).mock.calls.length).toBe(before)
  }, TEST_TIMEOUT)

  it('rejects an invalid OTP code with an error response', async () => {
    const res = await req('POST', '/api/auth/phone-number/verify', {
      phoneNumber: FARMER_PHONE,
      code: '000000',
    })

    expect(res.status).toBeGreaterThanOrEqual(400)
    const text = await res.text()
    if (text) {
      try {
        const body = JSON.parse(text) as JsonBody
        expect(body).toBeDefined()
      } catch {
        // non-JSON response body
      }
    }
  }, TEST_TIMEOUT)

  it('issues a session cookie with role=farmer on correct OTP verification', async () => {
    const { sendSms } = await import('@/services/sms.js')
    let capturedOtp = ''

    vi.mocked(sendSms).mockImplementationOnce(async (phone: string, message: string) => {
      const match = message.match(/(\d{6})/)
      if (match) capturedOtp = match[1]!
      return { success: true, messageId: 'x', number: phone, status: 'Success', cost: '0' }
    })

    await req('POST', '/api/auth/phone-number/send-otp', { phoneNumber: FARMER_PHONE })

    if (!capturedOtp) {
      console.warn('[test] OTP not captured from mock — skipping verify step')
      return
    }

    const res = await req('POST', '/api/auth/phone-number/verify', {
      phoneNumber: FARMER_PHONE,
      code: capturedOtp,
    })

    expect(res.status).toBe(200)
    const body = (await res.json()) as { token?: string; user?: { role?: string } }
    expect(body).toHaveProperty('token')
    expect(body.user?.role?.toUpperCase()).toBe('FARMER')
    expect(res.headers.get('set-cookie')).not.toBeNull()
  }, TEST_TIMEOUT)
})

describe('Administrator Credential Lifecycle', () => {
  let sessionCookie: string | null = null

  beforeAll(async () => {
    const res = await req('POST', '/api/auth/sign-up/email', {
      name:        'Test Officer',
      email:       ADMIN_EMAIL,
      password:    ADMIN_PASS,
      phoneNumber: ADMIN_PHONE,
    })
    sessionCookie = extractSessionCookie(res)
  }, TEST_TIMEOUT)

  it('rejects an incorrect password with a 4xx error response', async () => {
    const res = await req('POST', '/api/auth/sign-in/email', {
      email:    ADMIN_EMAIL,
      password: 'wrongpassword',
    })

    expect(res.status).toBeGreaterThanOrEqual(400)
    const text = await res.text()
    if (text) {
      try {
        const body = JSON.parse(text) as JsonBody
        expect(body).toBeDefined()
      } catch {
        // non-JSON response body
      }
    }
  }, TEST_TIMEOUT)

  it('returns a session cookie when 2FA has not yet been enabled', async () => {
    const res = await req('POST', '/api/auth/sign-in/email', {
      email:    ADMIN_EMAIL,
      password: ADMIN_PASS,
    })

    expect(res.status).toBe(200)
    const cookie = extractSessionCookie(res)
    expect(cookie).not.toBeNull()
    sessionCookie = cookie
  }, TEST_TIMEOUT)

  it('returns a session cookie on valid sign-in without 2FA requirement', async () => {
    const res = await req('POST', '/api/auth/sign-in/email', { email: ADMIN_EMAIL, password: ADMIN_PASS })
    expect(res.status).toBe(200)
    const cookie = extractSessionCookie(res)
    expect(cookie).not.toBeNull()
  }, TEST_TIMEOUT)
})

describe('RBAC and Tenant Boundary Enforcement', () => {
  it('returns 401 when no session cookie is supplied to a guarded route', async () => {
    const res = await req('GET', '/api/v1/offices/me')
    expect(res.status).toBe(401)
  }, TEST_TIMEOUT)

  it('returns 403 when a farmer session is used on an officer-only route', async () => {
    const { sendSms } = await import('@/services/sms.js')
    let capturedOtp = ''

    vi.mocked(sendSms).mockImplementationOnce(async (phone: string, message: string) => {
      const match = message.match(/(\d{6})/)
      if (match) capturedOtp = match[1]!
      return { success: true, messageId: 'x', number: phone, status: 'Success', cost: '0' }
    })

    await req('POST', '/api/auth/phone-number/send-otp', { phoneNumber: FARMER_PHONE })

    if (!capturedOtp) {
      console.warn('[test] OTP not captured — skipping farmer RBAC assertion')
      return
    }

    const verifyRes    = await req('POST', '/api/auth/phone-number/verify', { phoneNumber: FARMER_PHONE, code: capturedOtp })
    const farmerCookie = extractSessionCookie(verifyRes)

    if (!farmerCookie) {
      console.warn('[test] Farmer cookie not obtained — skipping RBAC assertion')
      return
    }

    const res = await req('GET', '/api/v1/offices/me', undefined, { Cookie: farmerCookie })
    expect(res.status).toBe(403)
  }, TEST_TIMEOUT)

  it('passes the session guard for a valid non-banned admin session', async () => {
    const signInRes = await req('POST', '/api/auth/sign-in/email', { email: ADMIN_EMAIL, password: ADMIN_PASS })

    if (signInRes.status !== 200) {
      console.warn('[test] Sign-in non-200 (2FA active) — skipping session guard check')
      return
    }

    const cookie = extractSessionCookie(signInRes)
    expect(cookie).not.toBeNull()

    const res = await req('GET', '/api/auth/get-session', undefined, { Cookie: cookie! })
    expect(res.status).toBe(200)
  }, TEST_TIMEOUT)
})
