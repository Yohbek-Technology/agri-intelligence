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

export interface ServiceResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export const authService = {
  async signIn(input: PhoneSignIn): Promise<ServiceResult> {
    const parseResult = PhoneSignInSchema.safeParse(input)
    if (!parseResult.success) {
      return { success: false, error: parseResult.error.issues[0]?.message }
    }

    const normalizedPhone = PhoneUtils.normalize(parseResult.data.phoneNumber)

    try {
      const res = await authClient.signIn.phoneNumber({
        phoneNumber: normalizedPhone,
        password: parseResult.data.password,
      })

      if (res.error) {
        return { success: false, error: mapAuthError(res.error) }
      }

      return { success: true, data: res.data }
    } catch (err) {
      return { success: false, error: mapAuthError(err) }
    }
  },

  async signInWithUsername(input: UsernameSignIn): Promise<ServiceResult> {
    const parseResult = UsernameSignInSchema.safeParse(input)
    if (!parseResult.success) {
      return { success: false, error: parseResult.error.issues[0]?.message }
    }
    try {
      const res = await authClient.signIn.username({
        username: parseResult.data.username.toLowerCase(),
        password: parseResult.data.password,
      })
      if (res.error) return { success: false, error: mapAuthError(res.error) }
      return { success: true, data: res.data }
    } catch (err) {
      return { success: false, error: mapAuthError(err) }
    }
  },

  async requestOtp(input: PhoneOtpRequest): Promise<ServiceResult> {
    const parseResult = PhoneOtpRequestSchema.safeParse(input)
    if (!parseResult.success) {
      return { success: false, error: parseResult.error.issues[0]?.message }
    }

    const normalizedPhone = PhoneUtils.normalize(parseResult.data.phoneNumber)

    try {
      const res = await authClient.phoneNumber.sendOtp({
        phoneNumber: normalizedPhone,
      })

      if (res.error) {
        return { success: false, error: mapAuthError(res.error) }
      }

      return { success: true, data: res.data }
    } catch (err) {
      return { success: false, error: mapAuthError(err) }
    }
  },

  async verifyOtpAndSignUp(input: PhoneOtpVerify): Promise<ServiceResult> {
    const parseResult = PhoneOtpVerifySchema.safeParse(input)
    if (!parseResult.success) {
      return { success: false, error: parseResult.error.issues[0]?.message }
    }

    const normalizedPhone = PhoneUtils.normalize(parseResult.data.phoneNumber)

    try {
      // Do NOT pass username in the verify payload — the username plugin's
      // createUser hook intercepts it and throws a uniqueness conflict.
      // We update the username separately after verification succeeds.
      const verifyPayload = {
        phoneNumber: normalizedPhone,
        code: parseResult.data.code,
        password: parseResult.data.password,
        name: parseResult.data.name,
        preferredLanguage: parseResult.data.preferredLanguage,
      } as unknown as Parameters<typeof authClient.phoneNumber.verify>[0]

      const res = await authClient.phoneNumber.verify(verifyPayload)

      if (res.error) {
        return { success: false, error: mapAuthError(res.error) }
      }

      // Now set the username separately after the user is created & session established
      if (parseResult.data.username) {
        const updateRes = await authClient.updateUser({
          username: parseResult.data.username.toLowerCase(),
        } as Parameters<typeof authClient.updateUser>[0])
        if (updateRes.error) {
          // Username update failed — still return success so user gets in,
          // but surface the username error as a soft warning
          return { success: true, data: res.data, error: mapAuthError(updateRes.error) }
        }
      }

      return { success: true, data: res.data }
    } catch (err) {
      return { success: false, error: mapAuthError(err) }
    }
  },

  async requestPasswordReset(input: PasswordResetRequest): Promise<ServiceResult> {
    const parseResult = PasswordResetRequestSchema.safeParse(input)
    if (!parseResult.success) {
      return { success: false, error: parseResult.error.issues[0]?.message }
    }

    const normalizedPhone = PhoneUtils.normalize(parseResult.data.phoneNumber)

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000'}/api/auth/phone-number/request-password-reset`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ phoneNumber: normalizedPhone }),
        }
      )
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        return { success: false, error: mapAuthError(data) }
      }
      return { success: true, data }
    } catch (err) {
      return { success: false, error: mapAuthError(err) }
    }
  },

  async resetPassword(input: PasswordResetConfirm): Promise<ServiceResult> {
    const parseResult = PasswordResetConfirmSchema.safeParse(input)
    if (!parseResult.success) {
      return { success: false, error: parseResult.error.issues[0]?.message }
    }

    const normalizedPhone = PhoneUtils.normalize(parseResult.data.phoneNumber)

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000'}/api/auth/phone-number/reset-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            phoneNumber: normalizedPhone,
            otp: parseResult.data.code,
            newPassword: parseResult.data.newPassword,
          }),
        }
      )
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        return { success: false, error: mapAuthError(data) }
      }
      return { success: true, data }
    } catch (err) {
      return { success: false, error: mapAuthError(err) }
    }
  },

  async signOut(): Promise<ServiceResult> {
    try {
      await authClient.signOut()
      return { success: true }
    } catch (err) {
      return { success: false, error: mapAuthError(err) }
    }
  },

  async getSession(): Promise<ServiceResult> {
    try {
      const res = await authClient.getSession()
      if (res.error) {
        return { success: false, error: mapAuthError(res.error) }
      }
      return { success: true, data: res.data }
    } catch (err) {
      return { success: false, error: mapAuthError(err) }
    }
  },
}
