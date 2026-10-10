'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { UserRole } from '@repo/shared'
import { useAuth } from '../providers/auth-provider'
import { getDashboardPath } from './use-auth-session'

export function useRoleGuard(allowedRoles: UserRole[]) {
  const router = useRouter()
  const { user, role, isAuthenticated, isLoading } = useAuth()

  const isRolePermitted = Boolean(role && allowedRoles.includes(role))

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.replace('/sign-in')
      return
    }

    if (role && !allowedRoles.includes(role)) {
      router.replace(getDashboardPath(role))
    }
  }, [isLoading, isAuthenticated, role, allowedRoles, router])

  return {
    isAuthorized: isAuthenticated && isRolePermitted,
    isLoading,
    role,
    user,
  }
}
