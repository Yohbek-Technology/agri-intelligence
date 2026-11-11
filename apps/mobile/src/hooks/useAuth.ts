/**
 * useAuth Hook
 * Access session, user role, city office, and authentication actions.
 */
import { useAuth as useAuthProvider } from '@/providers/auth-provider';

export function useAuth() {
  const auth = useAuthProvider();

  return {
    user: auth.user,
    session: auth.session,
    role: auth.role,
    cityId: auth.user?.cityId ?? null,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,
    signInWithPhone: auth.signInWithPhone,
    signInWithUsername: auth.signInWithUsername,
    requestOtp: auth.requestOtp,
    verifyOtpAndSignUp: auth.verifyOtpAndSignUp,
    signOut: auth.signOut,
    refreshSession: auth.refreshSession,
    clearError: auth.clearError,
  };
}

