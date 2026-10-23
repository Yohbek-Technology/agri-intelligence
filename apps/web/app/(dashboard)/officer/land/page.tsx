'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { useRoleGuard } from '@/hooks/useAuth'
import { useOfficePlots } from '@/hooks/useOfficePlots'
import { OfficePlotsTable } from '@/components/officer/OfficePlotsTable'

export default function OfficerLandPage() {
  const t = useTranslations('Phase2.registry')
  const { isAuthorized, isLoading: authLoading } = useRoleGuard(['officer', 'system_admin'])
  const { plots, plotsLoading, filters, setFilterField, kebeles, crops } = useOfficePlots()

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="text-xs font-mono uppercase tracking-widest text-text-faint animate-pulse">
          {t('loading_registry')}
        </span>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="m-8 p-5 text-sm text-danger bg-danger-light border-2 border-danger rounded-xl">
        {t('access_denied')}
      </div>
    )
  }

  return (
    <div className="w-full px-2.5 py-3 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-mono uppercase tracking-tight text-text-primary">
          {t('plots_title')}
        </h1>
        <p className="text-xs sm:text-sm text-text-muted mt-1">
          {t('plots_subtitle')}
        </p>
      </div>

      <OfficePlotsTable
        plots={plots}
        filters={filters}
        onFilterChange={setFilterField}
        kebeles={kebeles}
        crops={crops}
        isLoading={plotsLoading}
      />
    </div>
  )
}
