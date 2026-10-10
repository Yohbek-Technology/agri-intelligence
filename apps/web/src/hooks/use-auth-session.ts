'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { UserRole } from '@repo/shared'
import { useAuth } from '../providers/auth-provider'

export function getDashboardPath(role: UserRole | string | null | undefined): string {
  switch (role) {
    case 'farmer':
      return '/farmer'
    case 'da':
      return '/da'
    case 'officer':
    case 'system_admin':
      return '/officer'
    default:
      return '/farmer'
  }
}

export function useAuthSession() {
  const router = useRouter()
  const { user, session, role, isAuthenticated, isLoading, signOut, refetch } = useAuth()

  const handleSignOut = useCallback(async () => {
    await signOut()
    router.push('/sign-in')
  }, [signOut, router])

  const redirectToDashboard = useCallback(() => {
    if (role) {
      router.push(getDashboardPath(role))
    }
  }, [role, router])

  return {
    user,
    session,
    role,
    isAuthenticated,
    isLoading,
    signOut: handleSignOut,
    refetch,
    dashboardPath: getDashboardPath(role),
    redirectToDashboard,
  }
}
