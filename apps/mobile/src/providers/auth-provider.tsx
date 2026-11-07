import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  AuthUser,
  AuthSession,
  UserRole,
  PhoneSignIn,
  UsernameSignIn,
  PhoneOtpRequest,
  PhoneOtpVerify,
} from '@repo/shared';
import { authService, type ServiceResult } from '@/services/auth';
import { storage } from '@/lib/storage';

const TOKEN_KEY = 'agri_mobile_auth_token';
const USER_KEY = 'agri_mobile_auth_user';

export interface AuthContextValue {
  user: AuthUser | null;
  session: AuthSession | null;
  role: UserRole | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signInWithPhone: (input: PhoneSignIn) => Promise<ServiceResult>;
  signInWithUsername: (input: UsernameSignIn) => Promise<ServiceResult>;
  requestOtp: (input: PhoneOtpRequest) => Promise<ServiceResult>;
  verifyOtpAndSignUp: (input: PhoneOtpVerify) => Promise<ServiceResult>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  role: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  signInWithPhone: async () => ({ success: false }),
  signInWithUsername: async () => ({ success: false }),
  requestOtp: async () => ({ success: false }),
  verifyOtpAndSignUp: async () => ({ success: false }),
  signOut: async () => {},
  refreshSession: async () => {},
  clearError: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const saveAuthData = useCallback(async (newUser: AuthUser, newSession: AuthSession, newToken?: string) => {
    setUser(newUser);
    setSession(newSession);
    const effectiveToken = newToken || newSession.token;
    if (effectiveToken) {
      setToken(effectiveToken);
      await storage.setItem(TOKEN_KEY, effectiveToken);
    }
    await storage.setItem(USER_KEY, JSON.stringify(newUser));
  }, []);

  const clearAuthData = useCallback(async () => {
    setUser(null);
    setSession(null);
    setToken(null);
    await storage.removeItem(TOKEN_KEY);
    await storage.removeItem(USER_KEY);
  }, []);

  // Hydrate session on app launch
  const refreshSession = useCallback(async () => {
    try {
      const storedToken = await storage.getItem(TOKEN_KEY);
      const cachedUserJson = await storage.getItem(USER_KEY);

      if (cachedUserJson) {
        try {
          setUser(JSON.parse(cachedUserJson));
        } catch {
          // ignore cache parse failure
        }
      }

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      setToken(storedToken);
      const res = await authService.getSession(storedToken);
      if (res.success && res.data?.user && res.data?.session) {
        setUser(res.data.user);
        setSession(res.data.session);
        await storage.setItem(USER_KEY, JSON.stringify(res.data.user));
      } else {
        // Token expired or invalid on server
        await clearAuthData();
      }
    } catch {
      // offline fallback: keep cached user if present
    } finally {
      setIsLoading(false);
    }
  }, [clearAuthData]);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const signInWithPhone = useCallback(
    async (input: PhoneSignIn): Promise<ServiceResult> => {
      setError(null);
      setIsLoading(true);
      try {
        const res = await authService.signInWithPhone(input);
        if (res.success && res.data) {
          await saveAuthData(res.data.user, res.data.session, res.data.token);
          return { success: true, data: res.data };
        }
        setError(res.error ?? 'Authentication failed');
        return res;
      } finally {
        setIsLoading(false);
      }
    },
    [saveAuthData]
  );

  const signInWithUsername = useCallback(
    async (input: UsernameSignIn): Promise<ServiceResult> => {
      setError(null);
      setIsLoading(true);
      try {
        const res = await authService.signInWithUsername(input);
        if (res.success && res.data) {
          await saveAuthData(res.data.user, res.data.session, res.data.token);
          return { success: true, data: res.data };
        }
        setError(res.error ?? 'Authentication failed');
        return res;
      } finally {
        setIsLoading(false);
      }
    },
    [saveAuthData]
  );

  const requestOtp = useCallback(async (input: PhoneOtpRequest): Promise<ServiceResult> => {
    setError(null);
    return await authService.requestOtp(input);
  }, []);

  const verifyOtpAndSignUp = useCallback(
    async (input: PhoneOtpVerify): Promise<ServiceResult> => {
      setError(null);
      setIsLoading(true);
      try {
        const res = await authService.verifyOtpAndSignUp(input);
        if (res.success && res.data) {
          await saveAuthData(res.data.user, res.data.session, res.data.token);
          return { success: true, data: res.data };
        }
        setError(res.error ?? 'Verification failed');
        return res;
      } finally {
        setIsLoading(false);
      }
    },
    [saveAuthData]
  );

  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.signOut(token);
    } finally {
      await clearAuthData();
      setIsLoading(false);
    }
  }, [token, clearAuthData]);

  const role = user?.role ?? null;
  const isAuthenticated = Boolean(user);

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
        signInWithUsername,
        requestOtp,
        verifyOtpAndSignUp,
        signOut,
        refreshSession,
        clearError,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
