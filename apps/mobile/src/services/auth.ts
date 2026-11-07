import {
  PhoneSignInSchema,
  UsernameSignInSchema,
  PhoneOtpRequestSchema,
  PhoneOtpVerifySchema,
  PasswordResetRequestSchema,
  PasswordResetConfirmSchema,
  PhoneUtils,
  type PhoneSignIn,
  type UsernameSignIn,
  type PhoneOtpRequest,
  type PhoneOtpVerify,
  type PasswordResetRequest,
  type PasswordResetConfirm,
  type AuthUser,
  type AuthSession,
} from '@repo/shared';
import { API_ROUTES } from '@/lib/config';
import { mapAuthError } from '@/lib/error-mapper';

export interface AuthResponseData {
  user: AuthUser;
  session: AuthSession;
  token?: string;
}

export interface ServiceResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

async function requestJson<T>(
  url: string,
  options: RequestInit,
  token?: string | null
): Promise<ServiceResult<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        success: false,
        error: mapAuthError(data ?? res.statusText),
      };
    }

    if (data?.error) {
      return {
        success: false,
        error: mapAuthError(data.error),
      };
    }

    return {
      success: true,
      data: data as T,
    };
  } catch (err) {
    return {
      success: false,
      error: mapAuthError(err),
    };
  }
}

export const authService = {
  async signInWithPhone(input: PhoneSignIn): Promise<ServiceResult<AuthResponseData>> {
    const parse = PhoneSignInSchema.safeParse(input);
    if (!parse.success) {
      return { success: false, error: parse.error.issues[0]?.message };
    }

    const normalizedPhone = PhoneUtils.normalize(parse.data.phoneNumber);

    const result = await requestJson<any>(API_ROUTES.signInPhone, {
      method: 'POST',
      body: JSON.stringify({
        phoneNumber: normalizedPhone,
        password: parse.data.password,
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

  async signInWithUsername(input: UsernameSignIn): Promise<ServiceResult<AuthResponseData>> {
    const parse = UsernameSignInSchema.safeParse(input);
    if (!parse.success) {
      return { success: false, error: parse.error.issues[0]?.message };
    }

    const result = await requestJson<any>(API_ROUTES.signInUsername, {
      method: 'POST',
      body: JSON.stringify({
        username: parse.data.username.toLowerCase(),
        password: parse.data.password,
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

  async requestOtp(input: PhoneOtpRequest): Promise<ServiceResult<{ status: boolean }>> {
    const parse = PhoneOtpRequestSchema.safeParse(input);
    if (!parse.success) {
      return { success: false, error: parse.error.issues[0]?.message };
    }

    const normalizedPhone = PhoneUtils.normalize(parse.data.phoneNumber);

    return await requestJson(API_ROUTES.sendOtp, {
      method: 'POST',
      body: JSON.stringify({
        phoneNumber: normalizedPhone,
      }),
    });
  },

  async verifyOtpAndSignUp(
    input: PhoneOtpVerify
  ): Promise<ServiceResult<AuthResponseData>> {
    const parse = PhoneOtpVerifySchema.safeParse(input);
    if (!parse.success) {
      return { success: false, error: parse.error.issues[0]?.message };
    }

    const normalizedPhone = PhoneUtils.normalize(parse.data.phoneNumber);

    const verifyPayload: Record<string, unknown> = {
      phoneNumber: normalizedPhone,
      code: parse.data.code,
    };
    if (parse.data.password) verifyPayload.password = parse.data.password;
    if (parse.data.name) verifyPayload.name = parse.data.name;
    if (parse.data.preferredLanguage) verifyPayload.preferredLanguage = parse.data.preferredLanguage;

    const result = await requestJson<any>(API_ROUTES.verifyOtp, {
      method: 'POST',
      body: JSON.stringify(verifyPayload),
    });

    if (!result.success || !result.data) {
      return result;
    }

    const token = result.data.token || result.data.session?.token;

    // If username was provided, update it via backend updateUser
    if (parse.data.username && token) {
      await requestJson(
        API_ROUTES.updateUser,
        {
          method: 'POST',
          body: JSON.stringify({
            username: parse.data.username.toLowerCase(),
          }),
        },
        token
      );
    }

    return {
      success: true,
      data: {
        user: result.data.user,
        session: result.data.session,
        token,
      },
    };
  },

  async checkPhoneExists(phoneNumber: string): Promise<boolean> {
    try {
      const normalized = PhoneUtils.normalize(phoneNumber);
      const res = await fetch(`${API_ROUTES.checkPhone}?phone=${encodeURIComponent(normalized)}`);
      if (!res.ok) return false;
      const data = await res.json().catch(() => ({ exists: false }));
      return Boolean(data.exists);
    } catch {
      return false;
    }
  },

  async requestPasswordReset(input: PasswordResetRequest): Promise<ServiceResult> {
    const parse = PasswordResetRequestSchema.safeParse(input);
    if (!parse.success) {
      return { success: false, error: parse.error.issues[0]?.message };
    }

    const normalizedPhone = PhoneUtils.normalize(parse.data.phoneNumber);

    return await requestJson(API_ROUTES.requestPasswordReset, {
      method: 'POST',
      body: JSON.stringify({
        phoneNumber: normalizedPhone,
      }),
    });
  },

  async resetPassword(input: PasswordResetConfirm): Promise<ServiceResult> {
    const parse = PasswordResetConfirmSchema.safeParse(input);
    if (!parse.success) {
      return { success: false, error: parse.error.issues[0]?.message };
    }

    const normalizedPhone = PhoneUtils.normalize(parse.data.phoneNumber);

    return await requestJson(API_ROUTES.resetPassword, {
      method: 'POST',
      body: JSON.stringify({
        phoneNumber: normalizedPhone,
        otp: parse.data.code,
        newPassword: parse.data.newPassword,
      }),
    });
  },

  async getSession(token: string): Promise<ServiceResult<AuthResponseData>> {
    return await requestJson<AuthResponseData>(
      API_ROUTES.getSession,
      {
        method: 'GET',
      },
      token
    );
  },

  async signOut(token?: string | null): Promise<ServiceResult> {
    return await requestJson(
      API_ROUTES.signOut,
      {
        method: 'POST',
      },
      token
    );
  },
};
