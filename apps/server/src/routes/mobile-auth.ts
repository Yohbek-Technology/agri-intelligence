import { Hono } from 'hono'
import { auth } from '@/config/auth.js'
import { normalizeEthiopianPhone } from '@/services/sms.js'

const mobileAuthRouter = new Hono()

// ─── MOB-3 helper ────────────────────────────────────────────────────────────
function isRolePermittedOnAndroid(role: string): boolean {
  return role === 'farmer' || role === 'da'
}

// ─── Sign-in (phone + password) ──────────────────────────────────────────────
// POST /api/auth/sign-in/phone
// POST /api/auth/sign-in/phone-number  (alias)
mobileAuthRouter.post('/sign-in/phone', (c) => handleSignInPhone(c))
mobileAuthRouter.post('/sign-in/phone-number', (c) => handleSignInPhone(c))

async function handleSignInPhone(c: any): Promise<Response> {
  try {
    const body = await c.req.json().catch(() => ({}))
    const { phoneNumber, password } = body

    if (!phoneNumber || !password) {
      return c.json({ error: { code: 'invalid_credentials', message: 'Phone number and password are required.' } }, 400)
    }

    const normalized = normalizeEthiopianPhone(String(phoneNumber))

    const result = await auth.api.signInPhoneNumber({
      body: { phoneNumber: normalized, password: String(password) },
      headers: c.req.raw.headers,
      asResponse: false,
    })

    if (!result?.user) {
      return c.json({ error: { code: 'invalid_credentials', message: 'Incorrect phone number or password.' } }, 401)
    }

    // MOB-3: refuse Android clients whose role is not farmer or da
    const clientType = c.req.header('X-Client-Type')?.toLowerCase()
    const userRole: string = (result.user as any)?.role ?? 'farmer'
    if (clientType === 'android' && !isRolePermittedOnAndroid(userRole)) {
      try {
        if (result.token) {
          await auth.api.signOut({ headers: { authorization: `Bearer ${result.token}` } })
        }
      } catch { /* ignore */ }
      return c.json({
        error: {
          code: 'client_not_permitted',
          message: 'Officers and System Admins must use the City Web Portal. The mobile app is reserved for Farmers and DAs.',
        },
      }, 403)
    }

    // Return the user/session in Better Auth's native format so the SDK parses it correctly
    return c.json({ user: result.user, session: { token: result.token, userId: result.user.id }, token: result.token })
  } catch (err: any) {
    const message: string = err?.message ?? 'Authentication failed'
    const status: number = err?.status ?? (message.toLowerCase().includes('password') || message.toLowerCase().includes('user') ? 401 : 400)
    return c.json({ error: { code: 'auth_failed', message } }, status)
  }
}

// ─── Send OTP (sign-up) ───────────────────────────────────────────────────────
// POST /api/auth/sign-up/phone
// POST /api/auth/phone-number/send-otp  (alias)
// POST /api/auth/phone/resend-otp        (alias)
mobileAuthRouter.post('/sign-up/phone', (c) => handleSendOtp(c))
mobileAuthRouter.post('/phone-number/send-otp', (c) => handleSendOtp(c))
mobileAuthRouter.post('/phone/resend-otp', (c) => handleSendOtp(c))

async function handleSendOtp(c: any): Promise<Response> {
  try {
    const body = await c.req.json().catch(() => ({}))
    const { phoneNumber } = body
    if (!phoneNumber) {
      return c.json({ error: { code: 'invalid_phone_number', message: 'Phone number is required.' } }, 400)
    }
    const normalized = normalizeEthiopianPhone(String(phoneNumber))
    const result = await auth.api.sendPhoneNumberOTP({ body: { phoneNumber: normalized }, headers: c.req.raw.headers })
    return c.json({ data: { status: true, message: result?.message ?? 'SMS OTP sent successfully.' } })
  } catch (err: any) {
    return c.json({ error: { code: 'otp_request_failed', message: err?.message ?? 'Failed to send SMS OTP.' } }, 400)
  }
}

// ─── Verify OTP + sign-up ─────────────────────────────────────────────────────
// POST /api/auth/phone/verify-otp
// POST /api/auth/phone-number/verify  (alias)
mobileAuthRouter.post('/phone/verify-otp', (c) => handleVerifyOtp(c))
mobileAuthRouter.post('/phone-number/verify', (c) => handleVerifyOtp(c))

async function handleVerifyOtp(c: any): Promise<Response> {
  try {
    const body = await c.req.json().catch(() => ({}))
    const { phoneNumber, code, password, name, preferredLanguage } = body
    if (!phoneNumber || !code) {
      return c.json({ error: { code: 'invalid_input', message: 'Phone number and verification code are required.' } }, 400)
    }
    const normalized = normalizeEthiopianPhone(String(phoneNumber))
    const result = await auth.api.verifyPhoneNumber({
      body: {
        phoneNumber: normalized,
        code: String(code),
        password: password ? String(password) : undefined,
        name: name ? String(name) : undefined,
        preferredLanguage: preferredLanguage ? String(preferredLanguage) : 'am',
      },
      headers: c.req.raw.headers,
    })
    if (!result?.user) {
      return c.json({ error: { code: 'invalid_code', message: 'Verification code is invalid or expired.' } }, 400)
    }
    return c.json({ user: result.user, session: { token: result.token, userId: result.user.id }, token: result.token })
  } catch (err: any) {
    return c.json({ error: { code: 'verification_failed', message: err?.message ?? 'Verification failed.' } }, 400)
  }
}

// ─── Forgot password ──────────────────────────────────────────────────────────
// POST /api/auth/forgot-password
// POST /api/auth/phone-number/request-password-reset  (alias)
mobileAuthRouter.post('/forgot-password', (c) => handleForgotPassword(c))
mobileAuthRouter.post('/phone-number/request-password-reset', (c) => handleForgotPassword(c))

async function handleForgotPassword(c: any): Promise<Response> {
  try {
    const body = await c.req.json().catch(() => ({}))
    const { phoneNumber } = body
    if (!phoneNumber) {
      return c.json({ error: { code: 'invalid_phone_number', message: 'Phone number is required.' } }, 400)
    }
    const normalized = normalizeEthiopianPhone(String(phoneNumber))
    await auth.api.requestPasswordResetPhoneNumber({ body: { phoneNumber: normalized }, headers: c.req.raw.headers })
    return c.json({ data: { status: true, message: 'Password reset OTP sent.' } })
  } catch (err: any) {
    return c.json({ error: { code: 'reset_request_failed', message: err?.message ?? 'Failed to request password reset OTP.' } }, 400)
  }
}

// ─── Reset password ───────────────────────────────────────────────────────────
// POST /api/auth/reset-password
// POST /api/auth/phone-number/reset-password  (alias)
mobileAuthRouter.post('/reset-password', (c) => handleResetPassword(c))
mobileAuthRouter.post('/phone-number/reset-password', (c) => handleResetPassword(c))

async function handleResetPassword(c: any): Promise<Response> {
  try {
    const body = await c.req.json().catch(() => ({}))
    const { phoneNumber, code, newPassword } = body
    if (!phoneNumber || !code || !newPassword) {
      return c.json({ error: { code: 'invalid_input', message: 'Phone number, code, and new password are required.' } }, 400)
    }
    const normalized = normalizeEthiopianPhone(String(phoneNumber))
    await auth.api.resetPasswordPhoneNumber({
      body: { phoneNumber: normalized, otp: String(code), newPassword: String(newPassword) },
      headers: c.req.raw.headers,
    })
    return c.json({ data: { status: true, message: 'Password reset successfully.' } })
  } catch (err: any) {
    return c.json({ error: { code: 'password_reset_failed', message: err?.message ?? 'Failed to reset password.' } }, 400)
  }
}

// ─── Invitation accept stub ───────────────────────────────────────────────────
mobileAuthRouter.post('/invitations/accept', async (c) => {
  return c.json({ data: { status: true, message: 'Invitation accepted.' } })
})

// NOTE: /api/auth/session, /api/auth/get-session, /api/auth/sign-out are NOT
// handled here — they fall through to the Better Auth native handler which
// returns the correct format the authClient SDK expects.

export { mobileAuthRouter }
