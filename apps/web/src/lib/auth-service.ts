import {
  PhoneSignInSchema,
  PhoneOtpRequestSchema,
  PhoneOtpVerifySchema,
  PasswordResetRequestSchema,
  PasswordResetConfirmSchema,
  PhoneUtils,
  type PhoneSignIn,
  type PhoneOtpRequest,
  type PhoneOtpVerify,
  type PasswordResetRequest,
  type PasswordResetConfirm,
} from '@repo/shared'
import { authClient } from './auth-client'
import { mapAuthError } from './error-mapper'

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
      const res = await authClient.phoneNumber.requestPasswordReset({
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

  async resetPassword(input: PasswordResetConfirm): Promise<ServiceResult> {
    const parseResult = PasswordResetConfirmSchema.safeParse(input)
    if (!parseResult.success) {
      return { success: false, error: parseResult.error.issues[0]?.message }
    }

    const normalizedPhone = PhoneUtils.normalize(parseResult.data.phoneNumber)

    try {
      const resetPayload = {
        phoneNumber: normalizedPhone,
        otp: parseResult.data.code,
        newPassword: parseResult.data.newPassword,
      } as unknown as Parameters<typeof authClient.phoneNumber.resetPassword>[0]

      const res = await authClient.phoneNumber.resetPassword(resetPayload)

      if (res.error) {
        return { success: false, error: mapAuthError(res.error) }
      }

      return { success: true, data: res.data }
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
