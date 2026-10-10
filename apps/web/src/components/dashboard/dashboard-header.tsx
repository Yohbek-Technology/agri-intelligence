import React from 'react'
import type { UserRole } from '@repo/shared'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'

export interface DashboardHeaderProps {
  userName?: string | null
  phoneNumber?: string | null
  role: UserRole | string
  onSignOut: () => void
}

export function DashboardHeader({
  userName,
  phoneNumber,
  role,
  onSignOut,
}: DashboardHeaderProps) {
  const roleLabels: Record<string, { label: string; badge: string }> = {
    farmer: { label: 'Smallholder Farmer', badge: '[ROLE-FARMER]' },
    da: { label: 'Development Agent', badge: '[ROLE-FIELD-DA]' },
    officer: { label: 'City Agriculture Officer', badge: '[ROLE-OFFICER]' },
    system_admin: { label: 'System Administrator', badge: '[ROLE-SYSADMIN]' },
  }

  const roleMeta = roleLabels[role] || { label: 'User', badge: '[ROLE-USER]' }

  return (
    <header className="bg-surface border-b-[1.5px] border-border-strong sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary text-background flex items-center justify-center font-mono font-bold text-xs rounded-[2px] border-[1px] border-border-strong">
            AG
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold tracking-tight text-text-primary uppercase">
                AgriIntelligence
              </span>
              <span className="font-mono text-[10px] text-text-faint">[ADAMA-HUB]</span>
            </div>
            <p className="text-[11px] text-text-muted font-mono">{roleMeta.label}</p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
          <div className="flex items-center gap-2 text-right">
            <div className="hidden sm:block">
              <div className="text-xs font-medium text-text-primary">{userName || 'Active Operator'}</div>
              <div className="text-[10px] font-mono text-text-muted">{phoneNumber || '+251---------'}</div>
            </div>
            <Badge variant="primary">{roleMeta.badge}</Badge>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onSignOut}
            className="text-xs font-mono"
          >
            Sign Out ⎋
          </Button>
        </div>
      </div>
    </header>
  )
}
