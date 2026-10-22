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

/** Unwrap whatever shape the server returns into { user, session } */
function extractSession(raw: unknown): { user: AuthUser; session: AuthSession } | null {
  if (!raw || typeof raw !== 'object') return null
  const obj = raw as Record<string, unknown>

  // Standard Better Auth format: { user, session }
  if (obj.user && obj.session) {
    return { user: obj.user as AuthUser, session: obj.session as AuthSession }
  }

  // Double-wrapped format: { data: { user, session } }
  if (obj.data && typeof obj.data === 'object') {
    const inner = obj.data as Record<string, unknown>
    if (inner.user && inner.session) {
      return { user: inner.user as AuthUser, session: inner.session as AuthSession }
    }
  }

  return null
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<{ user: AuthUser; session: AuthSession } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetchingRef = useRef(false)

  const fetchSession = useCallback(async () => {
    if (fetchingRef.current) return
    fetchingRef.current = true
    try {
      const result = await authClient.getSession()
      // result.data is the raw server payload — unwrap defensively
      const extracted = extractSession(result.data)
      setData(extracted)
    } catch {
      setData(null)
    } finally {
      setIsLoading(false)
      fetchingRef.current = false
    }
  }, [])

  useEffect(() => {
    fetchSession()
  }, [fetchSession])

  const handleSignOut = useCallback(async () => {
    try {
      await authClient.signOut()
    } catch { /* ignore */ }
    setData(null)
  }, [])

  const user    = data?.user    ?? null
  const session = data?.session ?? null

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role:            (user?.role ?? null) as UserRole | null,
        isAuthenticated: Boolean(user && session),
        isLoading,
        signOut:         handleSignOut,
        refetch:         fetchSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext)
}
