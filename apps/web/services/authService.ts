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
        username:          parsed.data.username?.toLowerCase(),
      } as unknown as Parameters<typeof authClient.phoneNumber.verify>[0]

      const res = await authClient.phoneNumber.verify(verifyPayload)
      if (res.error) return { success: false, error: mapAuthError(res.error) }

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

  // ─── Check username availability (Better Auth) ─────────────────────────────
  async isUsernameAvailable(username: string): Promise<ServiceResult<{ available: boolean }>> {
    try {
      const res = await authClient.isUsernameAvailable({
        username: username.toLowerCase(),
      })
      if (res.error) return { success: false, error: mapAuthError(res.error) }
      return { success: true, data: res.data as { available: boolean } }
    } catch (err) {
      return { success: false, error: mapAuthError(err) }
    }
  },

  // ─── Check phone existence ─────────────────────────────────────────────────
  async checkPhoneExists(phoneNumber: string): Promise<ServiceResult<{ exists: boolean }>> {
    const normalized = PhoneUtils.normalize(phoneNumber)
    return apiFetch<{ exists: boolean }>(`/api/v1/auth/check-phone?phone=${encodeURIComponent(normalized)}`)
  },
}
