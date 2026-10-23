'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useRoleGuard } from '@/hooks/useAuth'
import { usePlotDetail } from '@/hooks/usePlotDetail'
import { officerService } from '@/services/officerService'
import { useQuery } from '@tanstack/react-query'
import { PlotDetailView } from '@/components/farmer/PlotDetailView'
import type { CropRow } from '@repo/shared'

export default function FarmerPlotDetailPage() {
  const t = useTranslations('Phase2.farmer')
  const { isAuthorized, isLoading: authLoading } = useRoleGuard(['farmer', 'system_admin'])
  const params = useParams()
  const plotId = (params?.id as string) ?? ''

  const {
    plot,
    plotLoading,
    cropHistory,
    unit,
    setUnit,
    handleSaveCropHistory,
    isSavingHistory,
  } = usePlotDetail(plotId, 'timad')

  const { data: crops = [] } = useQuery<CropRow[]>({
    queryKey: ['catalog', 'crops'],
    queryFn: async () => {
      const res = await officerService.listCrops()
      return res.data ?? []
    },
    staleTime: 5 * 60_000,
  })

  if (authLoading || plotLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="text-xs font-mono uppercase tracking-widest text-text-faint animate-pulse">
          {t('loading_3d')}
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

  if (!plot) {
    return (
      <div className="m-8 p-6 text-center text-sm font-mono text-text-faint bg-surface rounded-2xl border-2 border-border-ui">
        {t('plot_not_found')}
      </div>
    )
  }

  return (
    <div className="w-full px-2.5 py-3 sm:p-6 lg:p-8">
      <PlotDetailView
        plot={plot}
        cropHistory={cropHistory}
        crops={crops}
        displayUnit={unit}
        onUnitChange={setUnit}
        onSaveCropHistory={handleSaveCropHistory}
        isSavingHistory={isSavingHistory}
        backHref="/farmer/plots"
      />
    </div>
  )
}
