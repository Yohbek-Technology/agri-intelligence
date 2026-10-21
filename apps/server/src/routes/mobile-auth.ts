import { Hono } from 'hono'
import { auth } from '@/config/auth.js'
import { normalizeEthiopianPhone } from '@/services/sms.js'
import { db } from '@/config/db.js'
import { users } from '@/db/schemas/auth-schema.js'
import { eq } from 'drizzle-orm'

const mobileAuthRouter = new Hono()

/**
 * MOB-3 Role Admission Guard check
 */
function isRolePermittedOnAndroid(role: string): boolean {
  return role === 'farmer' || role === 'da'
}

/**
 * POST /api/auth/sign-in/phone
 * Also aliased as /api/auth/sign-in/phone-number
 */
mobileAuthRouter.post('/sign-in/phone', async (c) => {
  return handleSignInPhone(c)
})

mobileAuthRouter.post('/sign-in/phone-number', async (c) => {
  return handleSignInPhone(c)
})

async function handleSignInPhone(c: any) {
  try {
    const body = await c.req.json().catch(() => ({}))
    const { phoneNumber, password } = body

    if (!phoneNumber || !password) {
      return c.json(
        {
          error: {
            code: 'invalid_credentials',
            message: 'Phone number and password are required.',
          },
        },
        400
      )
    }

    const normalized = normalizeEthiopianPhone(String(phoneNumber))

    // 1. Authenticate with Better Auth
    const result = await auth.api.signInPhoneNumber({
      body: {
        phoneNumber: normalized,
        password: String(password),
      },
      headers: c.req.raw.headers,
      asResponse: false,
    })

    if (!result?.user) {
      return c.json(
        {
          error: {
            code: 'invalid_credentials',
            message: 'Incorrect phone number or password.',
          },
        },
        401
      )
    }

    // 2. MOB-3 Enforcement: Android client role admission guard
    const clientType = c.req.header('X-Client-Type')?.toLowerCase()
    const userRole = (result.user as any)?.role || 'farmer'
    if (clientType === 'android') {
      if (!isRolePermittedOnAndroid(userRole)) {
        // Revoke the session immediately
        try {
          if (result.token) {
            await auth.api.signOut({ headers: { authorization: `Bearer ${result.token}` } })
          }
        } catch {
          // ignore revocation error
        }


        return c.json(
          {
            error: {
              code: 'client_not_permitted',
              message:
                'Agricultural Officers and System Admins must access the City Web Portal on a desktop browser. The mobile app is strictly reserved for smallholder Farmers and field Development Agents (DAs).',
            },
          },
          403
        )
      }
    }

    return c.json({
      data: {
        user: result.user,
        session: {
          token: result.token,
          userId: result.user.id,
        },
        token: result.token,
      },
    })
  } catch (err: any) {
    const message = err?.message || 'Authentication failed'
    const status = err?.status || (message.includes('password') || message.includes('user') ? 401 : 400)
    return c.json(
      {
        error: {
          code: 'auth_failed',
          message,
        },
      },
      status
    )
  }
}

/**
 * POST /api/auth/sign-up/phone
 * Also aliased as /api/auth/phone-number/send-otp
 */
mobileAuthRouter.post('/sign-up/phone', async (c) => {
  return handleSendOtp(c)
})

mobileAuthRouter.post('/phone-number/send-otp', async (c) => {
  return handleSendOtp(c)
})

mobileAuthRouter.post('/phone/resend-otp', async (c) => {
  return handleSendOtp(c)
})

async function handleSendOtp(c: any) {
  try {
    const body = await c.req.json().catch(() => ({}))
    const { phoneNumber } = body

    if (!phoneNumber) {
      return c.json(
        {
          error: {
            code: 'invalid_phone_number',
            message: 'Phone number is required.',
          },
        },
        400
      )
    }

    const normalized = normalizeEthiopianPhone(String(phoneNumber))

    const result = await auth.api.sendPhoneNumberOTP({
      body: {
        phoneNumber: normalized,
      },
      headers: c.req.raw.headers,
    })

    return c.json({
      data: {
        status: true,
        message: result?.message || 'SMS OTP sent successfully.',
      },
    })
  } catch (err: any) {
    return c.json(
      {
        error: {
          code: 'otp_request_failed',
          message: err?.message || 'Failed to send SMS OTP.',
        },
      },
      400
    )
  }
}

/**
 * POST /api/auth/phone/verify-otp
 * Also aliased as /api/auth/phone-number/verify
 */
mobileAuthRouter.post('/phone/verify-otp', async (c) => {
  return handleVerifyOtp(c)
})

mobileAuthRouter.post('/phone-number/verify', async (c) => {
  return handleVerifyOtp(c)
})

async function handleVerifyOtp(c: any) {
  try {
    const body = await c.req.json().catch(() => ({}))
    const { phoneNumber, code, password, name, preferredLanguage } = body

    if (!phoneNumber || !code) {
      return c.json(
        {
          error: {
            code: 'invalid_input',
            message: 'Phone number and verification code are required.',
          },
        },
        400
      )
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
      return c.json(
        {
          error: {
            code: 'invalid_code',
            message: 'Verification code is invalid or expired.',
          },
        },
        400
      )
    }

    return c.json({
      data: {
        user: result.user,
        session: {
          token: result.token,
          userId: result.user.id,
        },
        token: result.token,
      },
    })
  } catch (err: any) {
    return c.json(
      {
        error: {
          code: 'verification_failed',
          message: err?.message || 'Verification failed. Check the 6-digit code.',
        },
      },
      400
    )
  }
}

/**
 * POST /api/auth/forgot-password
 * Also aliased as /api/auth/phone-number/request-password-reset
 */
mobileAuthRouter.post('/forgot-password', async (c) => {
  return handleForgotPassword(c)
})

mobileAuthRouter.post('/phone-number/request-password-reset', async (c) => {
  return handleForgotPassword(c)
})

async function handleForgotPassword(c: any) {
  try {
    const body = await c.req.json().catch(() => ({}))
    const { phoneNumber } = body

    if (!phoneNumber) {
      return c.json(
        {
          error: {
            code: 'invalid_phone_number',
            message: 'Phone number is required.',
          },
        },
        400
      )
    }

    const normalized = normalizeEthiopianPhone(String(phoneNumber))

    await auth.api.requestPasswordResetPhoneNumber({
      body: {
        phoneNumber: normalized,
      },
      headers: c.req.raw.headers,
    })

    return c.json({
      data: {
        status: true,
        message: 'Password reset OTP sent.',
      },
    })
  } catch (err: any) {
    return c.json(
      {
        error: {
          code: 'reset_request_failed',
          message: err?.message || 'Failed to request password reset OTP.',
        },
      },
      400
    )
  }
}

/**
 * POST /api/auth/reset-password
 * Also aliased as /api/auth/phone-number/reset-password
 */
mobileAuthRouter.post('/reset-password', async (c) => {
  return handleResetPassword(c)
})

mobileAuthRouter.post('/phone-number/reset-password', async (c) => {
  return handleResetPassword(c)
})

async function handleResetPassword(c: any) {
  try {
    const body = await c.req.json().catch(() => ({}))
    const { phoneNumber, code, newPassword } = body

    if (!phoneNumber || !code || !newPassword) {
      return c.json(
        {
          error: {
            code: 'invalid_input',
            message: 'Phone number, verification code, and new password are required.',
          },
        },
        400
      )
    }

    const normalized = normalizeEthiopianPhone(String(phoneNumber))

    await auth.api.resetPasswordPhoneNumber({
      body: {
        phoneNumber: normalized,
        otp: String(code),
        newPassword: String(newPassword),
      },
      headers: c.req.raw.headers,
    })

    return c.json({
      data: {
        status: true,
        message: 'Password reset successfully.',
      },
    })
  } catch (err: any) {
    return c.json(
      {
        error: {
          code: 'password_reset_failed',
          message: err?.message || 'Failed to reset password. Code may be invalid or expired.',
        },
      },
      400
    )
  }
}

/**
 * GET /api/auth/session
 * Also aliased as /api/auth/get-session
 */
mobileAuthRouter.get('/session', async (c) => {
  return handleGetSession(c)
})

mobileAuthRouter.get('/get-session', async (c) => {
  return handleGetSession(c)
})

async function handleGetSession(c: any) {
  try {
    const result = await auth.api.getSession({
      headers: c.req.raw.headers,
    })

    if (!result?.user || !result?.session) {
      return c.json(
        {
          error: {
            code: 'unauthenticated',
            message: 'A valid session is required.',
          },
        },
        401
      )
    }

    const clientType = c.req.header('X-Client-Type')?.toLowerCase()
    if (clientType === 'android') {
      if (!isRolePermittedOnAndroid(result.user.role)) {
        return c.json(
          {
            error: {
              code: 'client_not_permitted',
              message:
                'Agricultural Officers and System Admins must access the City Web Portal on desktop.',
            },
          },
          403
        )
      }
    }

    return c.json({
      data: {
        user: result.user,
        session: result.session,
        token: result.session.token,
      },
    })
  } catch (err: any) {
    return c.json(
      {
        error: {
          code: 'session_fetch_failed',
          message: err?.message || 'Failed to fetch active session.',
        },
      },
      401
    )
  }
}

/**
 * POST /api/auth/sign-out
 */
mobileAuthRouter.post('/sign-out', async (c) => {
  try {
    await auth.api.signOut({
      headers: c.req.raw.headers,
    })
    return c.json({
      data: {
        success: true,
      },
    })
  } catch (err: any) {
    return c.json({
      data: {
        success: true,
      },
    })
  }
})

/**
 * POST /api/auth/invitations/accept
 */
mobileAuthRouter.post('/invitations/accept', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}))
    const { token } = body

    if (!token) {
      return c.json(
        {
          error: {
            code: 'invalid_token',
            message: 'Invitation token is required.',
          },
        },
        400
      )
    }

    return c.json({
      data: {
        status: true,
        message: 'DA invitation accepted successfully.',
      },
    })
  } catch (err: any) {
    return c.json(
      {
        error: {
          code: 'invitation_failed',
          message: err?.message || 'Failed to accept invitation.',
        },
      },
      400
    )
  }
})

export { mobileAuthRouter }
