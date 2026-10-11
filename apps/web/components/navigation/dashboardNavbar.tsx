'use client'

import React from 'react'
import type { UserRole } from '@repo/shared'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BrandLogo } from '@/components/ui/brandLogo'

export interface DashboardNavbarProps {
  userName?: string | null
  phoneNumber?: string | null
  role: UserRole | string
  onSignOut: () => void
}

export function DashboardNavbar({
  userName,
  phoneNumber,
  role,
  onSignOut,
}: DashboardNavbarProps) {
  const roleLabels: Record<string, { label: string; badge: string; color: 'primary' | 'accent' | 'danger' | 'success' }> = {
    farmer: { label: 'Smallholder Farmer', badge: 'OPERATOR: FARMER', color: 'primary' },
    da: { label: 'Development Agent', badge: 'FIELD AGENT: DA', color: 'accent' },
    officer: { label: 'City Agriculture Officer', badge: 'DESK: MUNICIPAL OFFICER', color: 'success' },
    system_admin: { label: 'System Administrator', badge: 'SYSADMIN: FULL CLEARANCE', color: 'danger' },
  }

  const roleMeta = roleLabels[role] || { label: 'Operator', badge: 'OPERATOR', color: 'primary' }

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-border/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <BrandLogo size="md" />
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-semibold text-text-primary leading-tight">
              {userName || 'Active Operator'}
            </span>
            <span className="text-xs font-mono text-text-muted">
              {phoneNumber || '+251 9...'}
            </span>
          </div>

          <Badge variant={roleMeta.color} dot>
            {roleMeta.badge}
          </Badge>

          <Button
            variant="outline"
            size="sm"
            onClick={onSignOut}
            className="text-xs font-mono rounded-xl"
          >
            Sign Out ⎋
          </Button>
        </div>
      </div>
    </header>
  )
}
