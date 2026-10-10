'use client'

import React from 'react'
import { useRoleGuard } from '../../../src/hooks/use-role-guard'
import { OfficerWorkspace } from '../../../src/components/dashboard/officer-workspace'
import { Notice } from '../../../src/components/ui/notice'

const ALLOWED_ROLES = ['officer', 'system_admin'] as const

export default function OfficerPage() {
  const { isAuthorized, isLoading, user } = useRoleGuard([...ALLOWED_ROLES])

  if (isLoading) {
    return (
      <div className="p-12 text-center font-mono text-xs text-text-muted">
        [VERIFYING CITY AGRICULTURE OFFICE GOVERNANCE AUTHORITY...]
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto my-8">
        <Notice variant="danger" title="Access Prohibited">
          Your account role does not hold clearance for the City Agriculture Office Governance Desk. Redirecting to authorized portal...
        </Notice>
      </div>
    )
  }

  return (
    <OfficerWorkspace
      userName={user?.name}
      phoneNumber={user?.phoneNumber}
    />
  )
}
