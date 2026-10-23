'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { registryService } from '@/services/registryService'
import { officerService } from '@/services/officerService'
import type { PlotRow, AreaUnit, KebeleRow, CropRow } from '@repo/shared'

export interface OfficePlotFilterParams {
  kebele_id?: string
  crop_id?: string
  soil_class?: string
  status?: string
  unit: AreaUnit
  limit: number
}

export function useOfficePlots() {
  const [filters, setFilters] = useState<OfficePlotFilterParams>({
    unit: 'hectare',
    limit: 50,
  })

  // 1. Fetch office-wide plots
  const {
    data: plots = [],
    isLoading: plotsLoading,
    error: plotsError,
    refetch: refetchPlots,
  } = useQuery<PlotRow[]>({
    queryKey: ['office', 'plots', filters],
    queryFn: async () => {
      const res = await registryService.queryPlots(filters)
      if (!res.success) throw new Error(res.error || 'Failed to fetch office plots.')
      return res.data ?? []
    },
    staleTime: 30_000,
  })

  // 2. Auxiliaries
  const { data: kebeles = [] } = useQuery<KebeleRow[]>({
    queryKey: ['kebeles', 'list'],
    queryFn: async () => {
      const res = await officerService.listKebeles()
      return res.data ?? []
    },
    staleTime: 5 * 60_000,
  })

  const { data: crops = [] } = useQuery<CropRow[]>({
    queryKey: ['catalog', 'crops'],
    queryFn: async () => {
      const res = await officerService.listCrops()
      return res.data ?? []
    },
    staleTime: 5 * 60_000,
  })

  const setFilterField = <K extends keyof OfficePlotFilterParams>(
    field: K,
    value: OfficePlotFilterParams[K]
  ) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return {
    plots,
    plotsLoading,
    plotsError,
    filters,
    setFilterField,
    kebeles,
    crops,
    refetchPlots,
  }
}
