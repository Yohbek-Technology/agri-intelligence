'use client'

import React from 'react'
import { useRoleGuard } from '../../../src/hooks/use-role-guard'
import { FarmerWorkspace } from '../../../src/components/dashboard/farmer-workspace'
import { Notice } from '../../../src/components/ui/notice'

const ALLOWED_ROLES = ['farmer', 'system_admin'] as const

export default function FarmerPage() {
  const { isAuthorized, isLoading, user } = useRoleGuard([...ALLOWED_ROLES])

  if (isLoading) {
    return (
      <div className="p-12 text-center font-mono text-xs text-text-muted">
        [VERIFYING PLOT & CADASTRE AUTHORIZATION...]
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto my-8">
        <Notice variant="danger" title="Access Prohibited">
          Your account role does not hold clearance for the Smallholder Farmer Workspace. Redirecting to authorized portal...
        </Notice>
      </div>
    )
  }

  return (
    <FarmerWorkspace
      userName={user?.name}
      phoneNumber={user?.phoneNumber}
    />
  )
}
