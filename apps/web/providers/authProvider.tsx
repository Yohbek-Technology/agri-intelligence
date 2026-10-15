'use client'

import React, { createContext, useContext, useCallback, useEffect, useRef, useState } from 'react'
import type { UserRole, AuthUser, AuthSession } from '@repo/shared'
import { authClient } from '@/lib/authClient'

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
  const [data, setData] = useState<{ user: AuthUser; session: AuthSession } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetchingRef = useRef(false)

  const fetchSession = useCallback(async () => {
    if (fetchingRef.current) return
    fetchingRef.current = true
    try {
      const result = await authClient.getSession()
      setData(result.data as unknown as { user: AuthUser; session: AuthSession } | null)
    } catch {
      setData(null)
    } finally {
      setIsLoading(false)
      fetchingRef.current = false
    }
  }, [])

  useEffect(() => {
    fetchSession()
    // Only fetch once on mount — no window focus polling
  }, [fetchSession])

  const handleSignOut = useCallback(async () => {
    await authClient.signOut()
    setData(null)
  }, [])

  const user = data?.user ?? null
  const session = data?.session ?? null

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role: user?.role ?? null,
        isAuthenticated: Boolean(user && session),
        isLoading,
        signOut: handleSignOut,
        refetch: fetchSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext)
}
