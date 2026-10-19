import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  AuthUser,
  AuthSession,
  UserRole,
  PhoneSignIn,
  PhoneOtpRequest,
  PhoneOtpVerify,
  PasswordResetRequest,
  PasswordResetConfirm,
} from '@repo/shared';
import { authService, type AuthResponseData } from '@/services/api/auth-service';
import type { ServiceResult } from '@/services/api/client';
import { secureStorage } from '@/services/storage/keychain-storage';
import { SESSION_CONFIG } from '@/config/constants';

export interface AuthContextValue {
  user: AuthUser | null;
  session: AuthSession | null;
  role: UserRole | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signInWithPhone: (input: PhoneSignIn) => Promise<ServiceResult<AuthResponseData>>;
  requestOtp: (input: PhoneOtpRequest) => Promise<ServiceResult<{ status: boolean }>>;
  verifyOtpAndSignUp: (input: PhoneOtpVerify) => Promise<ServiceResult<AuthResponseData>>;
  requestPasswordReset: (input: PasswordResetRequest) => Promise<ServiceResult>;
  resetPassword: (input: PasswordResetConfirm) => Promise<ServiceResult>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const saveAuthData = useCallback(async (newUser: AuthUser, newSession: AuthSession, newToken?: string) => {
    // MOB-3 role admission guard
    if (newUser.role !== 'farmer' && newUser.role !== 'da') {
      throw new Error('Agricultural Officers and Admins must use the Web Portal.');
    }

    setUser(newUser);
    setSession(newSession);
    const effectiveToken = newToken || newSession.token;
    if (effectiveToken) {
      setToken(effectiveToken);
      await secureStorage.setItem(SESSION_CONFIG.storageKeyToken, effectiveToken);
    }
    await secureStorage.setItem(SESSION_CONFIG.storageKeyUser, JSON.stringify(newUser));
  }, []);

  const clearAuthData = useCallback(async () => {
    setUser(null);
    setSession(null);
    setToken(null);
    await secureStorage.removeItem(SESSION_CONFIG.storageKeyToken);
    await secureStorage.removeItem(SESSION_CONFIG.storageKeyUser);
  }, []);

  // Hydrate session on app launch
  const refreshSession = useCallback(async () => {
    try {
      const storedToken = await secureStorage.getItem(SESSION_CONFIG.storageKeyToken);
      const cachedUserJson = await secureStorage.getItem(SESSION_CONFIG.storageKeyUser);

      if (cachedUserJson) {
        try {
          const parsedUser = JSON.parse(cachedUserJson);
          if (parsedUser.role === 'farmer' || parsedUser.role === 'da') {
            setUser(parsedUser);
          }
        } catch {
          // ignore cache parse failure
        }
      }

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      setToken(storedToken);
      const res = await authService.getSession();
      if (res.success && res.data?.user && res.data?.session) {
        const u = res.data.user;
        if (u.role === 'farmer' || u.role === 'da') {
          setUser(u);
          setSession(res.data.session);
          await secureStorage.setItem(SESSION_CONFIG.storageKeyUser, JSON.stringify(u));
        } else {
          await clearAuthData();
        }
      }
    } catch {
      // offline fallback: keep cached user profile if present
    } finally {
      setIsLoading(false);
    }
  }, [clearAuthData]);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const signInWithPhone = useCallback(
    async (input: PhoneSignIn): Promise<ServiceResult<AuthResponseData>> => {
      setError(null);
      setIsLoading(true);
      try {
        const res = await authService.signInWithPhone(input);
        if (res.success && res.data) {
          await saveAuthData(res.data.user, res.data.session, res.data.token);
          return res;
        }
        setError(res.error ?? 'Authentication failed');
        return res;
      } catch (err: any) {
        const msg = err?.message || 'Authentication error';
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setIsLoading(false);
      }
    },
    [saveAuthData]
  );

  const requestOtp = useCallback(async (input: PhoneOtpRequest) => {
    setError(null);
    return await authService.requestOtp(input);
  }, []);

  const verifyOtpAndSignUp = useCallback(
    async (input: PhoneOtpVerify): Promise<ServiceResult<AuthResponseData>> => {
      setError(null);
      setIsLoading(true);
      try {
        const res = await authService.verifyOtpAndSignUp(input);
        if (res.success && res.data) {
          await saveAuthData(res.data.user, res.data.session, res.data.token);
          return res;
        }
        setError(res.error ?? 'Verification failed');
        return res;
      } catch (err: any) {
        const msg = err?.message || 'Verification error';
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setIsLoading(false);
      }
    },
    [saveAuthData]
  );

  const requestPasswordReset = useCallback(async (input: PasswordResetRequest) => {
    setError(null);
    return await authService.requestPasswordReset(input);
  }, []);

  const resetPassword = useCallback(async (input: PasswordResetConfirm) => {
    setError(null);
    return await authService.resetPassword(input);
  }, []);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.signOut();
    } finally {
      await clearAuthData();
      setIsLoading(false);
    }
  }, [clearAuthData]);

  const role = user?.role ?? null;
  const isAuthenticated = Boolean(user && (user.role === 'farmer' || user.role === 'da'));

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role,
        token,
        isAuthenticated,
        isLoading,
        error,
        signInWithPhone,
        requestOtp,
        verifyOtpAndSignUp,
        requestPasswordReset,
        resetPassword,
        signOut,
        refreshSession,
        clearError,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
