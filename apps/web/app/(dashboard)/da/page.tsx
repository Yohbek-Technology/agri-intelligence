'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { useAuthSession, useRoleGuard } from '@/hooks/useAuth'

export default function DaOverviewPage() {
  const t = useTranslations('Dashboard')
  const { user } = useAuthSession()
  const { isAuthorized, isLoading } = useRoleGuard(['da', 'system_admin'])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="text-sm text-text-faint tracking-widest animate-pulse">INITIALISING…</span>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="m-8 p-5 text-sm text-danger bg-danger-light border-2 border-danger rounded-xl">
        Access denied. Your role does not have clearance for the Development Agent workspace.
      </div>
    )
  }

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-text-primary">
        {t('overview_greeting', { name: user?.name ?? 'DA' })}
      </h1>
      <p className="mt-2 text-base text-text-muted">
        {t('da_overview_subtitle')}
      </p>
    </div>
  )
}
