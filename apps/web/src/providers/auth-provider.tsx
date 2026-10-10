'use client'

import React, { createContext, useContext, useCallback } from 'react'
import type { UserRole, AuthUser, AuthSession } from '@repo/shared'
import { authClient, useSession } from '../lib/auth-client'

export interface AuthContextValue {
  user: AuthUser | null
  session: AuthSession | null
  role: UserRole | null
  isAuthenticated: boolean
  isLoading: boolean
  signOut: () => Promise<void>
  refetch: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  role: null,
  isAuthenticated: false,
  isLoading: true,
  signOut: async () => {},
  refetch: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, isPending, refetch } = useSession()

  const user = (data?.user as unknown as AuthUser) ?? null
  const session = (data?.session as unknown as AuthSession) ?? null
  const role = user?.role ?? null
  const isAuthenticated = Boolean(user && session)

  const handleSignOut = useCallback(async () => {
    await authClient.signOut()
    await refetch()
  }, [refetch])

  const handleRefetch = useCallback(async () => {
    await refetch()
  }, [refetch])

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role,
        isAuthenticated,
        isLoading: isPending,
        signOut: handleSignOut,
        refetch: handleRefetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext)
}

