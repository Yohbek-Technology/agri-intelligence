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
  type AuthUser,
  type AuthSession,
} from '@repo/shared';
import { API_ENDPOINTS } from '@/config/env';
import { apiRequest, type ServiceResult } from './client';

export interface AuthResponseData {
  user: AuthUser;
  session: AuthSession;
  token?: string;
}

export const authService = {
  /**
   * Phone Number + Password Login (MOB-AUTH-1, ADM-8)
   * Only 'farmer' and 'da' roles are permitted on Android.
   */
  async signInWithPhone(input: PhoneSignIn): Promise<ServiceResult<AuthResponseData>> {
    const parse = PhoneSignInSchema.safeParse(input);
    if (!parse.success) {
      return { success: false, error: parse.error.issues[0]?.message };
    }

    const normalizedPhone = PhoneUtils.normalize(parse.data.phoneNumber);

    const result = await apiRequest<any>(API_ENDPOINTS.auth.signInPhone, {
      method: 'POST',
      body: JSON.stringify({
        phoneNumber: normalizedPhone,
        password: parse.data.password,
      }),
    });

    if (!result.success || !result.data) {
      return result;
    }

    const user: AuthUser = result.data.user;
    if (user && user.role !== 'farmer' && user.role !== 'da') {
      return {
        success: false,
        statusCode: 403,
        error: 'Agricultural Officers and Admins must use the Web Portal. Mobile is for Farmers and DAs only.',
      };
    }

    const token = result.data.token || result.data.session?.token;
    return {
      success: true,
      data: {
        user,
        session: result.data.session,
        token,
      },
    };
  },

  /**
   * Request 6-digit SMS OTP for Sign-Up or Verification (PLOT-1, ADM-8)
   */
  async requestOtp(input: PhoneOtpRequest): Promise<ServiceResult<{ status: boolean }>> {
    const parse = PhoneOtpRequestSchema.safeParse(input);
    if (!parse.success) {
      return { success: false, error: parse.error.issues[0]?.message };
    }

    const normalizedPhone = PhoneUtils.normalize(parse.data.phoneNumber);

    return await apiRequest(API_ENDPOINTS.auth.signUpPhone, {
      method: 'POST',
      body: JSON.stringify({
        phoneNumber: normalizedPhone,
      }),
    });
  },

  /**
   * Verify SMS OTP & Activate Credential Account
   */
  async verifyOtpAndSignUp(input: PhoneOtpVerify): Promise<ServiceResult<AuthResponseData>> {
    const parse = PhoneOtpVerifySchema.safeParse(input);
    if (!parse.success) {
      return { success: false, error: parse.error.issues[0]?.message };
    }

    const normalizedPhone = PhoneUtils.normalize(parse.data.phoneNumber);

    const result = await apiRequest<any>(API_ENDPOINTS.auth.verifyOtp, {
      method: 'POST',
      body: JSON.stringify({
        phoneNumber: normalizedPhone,
        code: parse.data.code,
        password: parse.data.password,
        name: parse.data.name,
        preferredLanguage: parse.data.preferredLanguage,
      }),
    });

    if (!result.success || !result.data) {
      return result;
    }

    const token = result.data.token || result.data.session?.token;
    return {
      success: true,
      data: {
        user: result.data.user,
        session: result.data.session,
        token,
      },
    };
  },

  /**
   * Request Password Reset SMS OTP
   */
  async requestPasswordReset(input: PasswordResetRequest): Promise<ServiceResult> {
    const parse = PasswordResetRequestSchema.safeParse(input);
    if (!parse.success) {
      return { success: false, error: parse.error.issues[0]?.message };
    }

    const normalizedPhone = PhoneUtils.normalize(parse.data.phoneNumber);

    return await apiRequest(API_ENDPOINTS.auth.forgotPassword, {
      method: 'POST',
      body: JSON.stringify({
        phoneNumber: normalizedPhone,
      }),
    });
  },

  /**
   * Reset Password with OTP Verification
   */
  async resetPassword(input: PasswordResetConfirm): Promise<ServiceResult> {
    const parse = PasswordResetConfirmSchema.safeParse(input);
    if (!parse.success) {
      return { success: false, error: parse.error.issues[0]?.message };
    }

    const normalizedPhone = PhoneUtils.normalize(parse.data.phoneNumber);

    return await apiRequest(API_ENDPOINTS.auth.resetPassword, {
      method: 'POST',
      body: JSON.stringify({
        phoneNumber: normalizedPhone,
        code: parse.data.code,
        newPassword: parse.data.newPassword,
      }),
    });
  },

  /**
   * Hydrate Active Session
   */
  async getSession(): Promise<ServiceResult<AuthResponseData>> {
    return await apiRequest<AuthResponseData>(API_ENDPOINTS.auth.getSession, {
      method: 'GET',
    });
  },

  /**
   * Revoke Session on Server
   */
  async signOut(): Promise<ServiceResult> {
    return await apiRequest(API_ENDPOINTS.auth.signOut, {
      method: 'POST',
    });
  },
};
