'use client'

import React from 'react'
import { useRoleGuard } from '../../../src/hooks/use-role-guard'
import { DaWorkspace } from '../../../src/components/dashboard/da-workspace'
import { Notice } from '../../../src/components/ui/notice'

const ALLOWED_ROLES = ['da', 'system_admin'] as const

export default function DaPage() {
  const { isAuthorized, isLoading, user } = useRoleGuard([...ALLOWED_ROLES])

  if (isLoading) {
    return (
      <div className="p-12 text-center font-mono text-xs text-text-muted">
        [VERIFYING DEVELOPMENT AGENT EXTENSION CREDENTIALS...]
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto my-8">
        <Notice variant="danger" title="Access Prohibited">
          Your account role does not hold clearance for the Development Agent Field Hub. Redirecting to authorized portal...
        </Notice>
      </div>
    )
  }

  return (
    <DaWorkspace
      userName={user?.name}
      phoneNumber={user?.phoneNumber}
    />
  )
}
