import {
  PhoneSignInSchema,
  PhoneOtpRequestSchema,
  PhoneOtpVerifySchema,
  PasswordResetRequestSchema,
  PasswordResetConfirmSchema,
  PhoneUtils,
  UsernameSignInSchema,
  type PhoneSignIn,
  type PhoneOtpRequest,
  type PhoneOtpVerify,
  type PasswordResetRequest,
  type PasswordResetConfirm,
  type UsernameSignIn,
} from '@repo/shared'
import { authClient } from '@/lib/authClient'
import { mapAuthError } from '@/lib/errorMapper'
import { apiFetch, type ServiceResult } from '@/lib/apiFetch'

export type { ServiceResult } from '@/lib/apiFetch'

export const authService = {
  // ─── Sign-in by phone number + password ───────────────────────────────────
  async signIn(input: PhoneSignIn): Promise<ServiceResult> {
    const parsed = PhoneSignInSchema.safeParse(input)
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message }

    const normalizedPhone = PhoneUtils.normalize(parsed.data.phoneNumber)
    try {
      const res = await authClient.signIn.phoneNumber({
        phoneNumber: normalizedPhone,
        password: parsed.data.password,
      })
      if (res.error) return { success: false, error: mapAuthError(res.error) }
      return { success: true, data: res.data }
    } catch (err) {
      return { success: false, error: mapAuthError(err) }
    }
  },

  // ─── Sign-in by username + password ───────────────────────────────────────
  // Better Auth username plugin hits /api/auth/sign-in/username natively.
  // The server's Better Auth handler returns { user, session } which the SDK
  // wraps as result.data = { user, session }.
  async signInWithUsername(input: UsernameSignIn): Promise<ServiceResult> {
    const parsed = UsernameSignInSchema.safeParse(input)
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message }
    try {
      const res = await authClient.signIn.username({
        username: parsed.data.username.toLowerCase(),
        password: parsed.data.password,
      })
      if (res.error) return { success: false, error: mapAuthError(res.error) }
      return { success: true, data: res.data }
    } catch (err) {
      return { success: false, error: mapAuthError(err) }
    }
  },

  // ─── Request phone OTP (sign-up step 1) ───────────────────────────────────
  async requestOtp(input: PhoneOtpRequest): Promise<ServiceResult> {
    const parsed = PhoneOtpRequestSchema.safeParse(input)
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message }

    const normalizedPhone = PhoneUtils.normalize(parsed.data.phoneNumber)
    try {
      const res = await authClient.phoneNumber.sendOtp({ phoneNumber: normalizedPhone })
      if (res.error) return { success: false, error: mapAuthError(res.error) }
      return { success: true, data: res.data }
    } catch (err) {
      return { success: false, error: mapAuthError(err) }
    }
  },

  // ─── Verify OTP + complete sign-up ────────────────────────────────────────
  async verifyOtpAndSignUp(input: PhoneOtpVerify): Promise<ServiceResult> {
    const parsed = PhoneOtpVerifySchema.safeParse(input)
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message }

    const normalizedPhone = PhoneUtils.normalize(parsed.data.phoneNumber)
    try {
      // Do NOT pass username in the verify call — the phoneNumber plugin's
      // signUpOnVerification flow creates the user; we set username separately.
      const verifyPayload = {
        phoneNumber:       normalizedPhone,
        code:              parsed.data.code,
        password:          parsed.data.password,
        name:              parsed.data.name,
        preferredLanguage: parsed.data.preferredLanguage,
      } as unknown as Parameters<typeof authClient.phoneNumber.verify>[0]

      const res = await authClient.phoneNumber.verify(verifyPayload)
      if (res.error) return { success: false, error: mapAuthError(res.error) }

      // Update username after the account is created and the session is live
      if (parsed.data.username) {
        const updateRes = await authClient.updateUser({
          username: parsed.data.username.toLowerCase(),
        } as Parameters<typeof authClient.updateUser>[0])
        if (updateRes.error) {
          // Non-fatal: user is in, just couldn't set username
          return { success: true, data: res.data, error: mapAuthError(updateRes.error) }
        }
      }

      return { success: true, data: res.data }
    } catch (err) {
      return { success: false, error: mapAuthError(err) }
    }
  },

  // ─── Request password reset OTP ───────────────────────────────────────────
  async requestPasswordReset(input: PasswordResetRequest): Promise<ServiceResult> {
    const parsed = PasswordResetRequestSchema.safeParse(input)
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message }
    const normalizedPhone = PhoneUtils.normalize(parsed.data.phoneNumber)
    return apiFetch('/api/auth/phone-number/request-password-reset', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber: normalizedPhone }),
    })
  },

  // ─── Confirm password reset ───────────────────────────────────────────────
  async resetPassword(input: PasswordResetConfirm): Promise<ServiceResult> {
    const parsed = PasswordResetConfirmSchema.safeParse(input)
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message }
    const normalizedPhone = PhoneUtils.normalize(parsed.data.phoneNumber)
    return apiFetch('/api/auth/phone-number/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        phoneNumber: normalizedPhone,
        otp:         parsed.data.code,
        newPassword: parsed.data.newPassword,
      }),
    })
  },

  // ─── Sign-out ─────────────────────────────────────────────────────────────
  async signOut(): Promise<ServiceResult> {
    try {
      await authClient.signOut()
      return { success: true }
    } catch (err) {
      return { success: false, error: mapAuthError(err) }
    }
  },

  // ─── Get current session ──────────────────────────────────────────────────
  async getSession(): Promise<ServiceResult> {
    try {
      const res = await authClient.getSession()
      if (res.error) return { success: false, error: mapAuthError(res.error) }
      return { success: true, data: res.data }
    } catch (err) {
      return { success: false, error: mapAuthError(err) }
    }
  },
}
