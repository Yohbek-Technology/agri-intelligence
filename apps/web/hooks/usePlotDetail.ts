'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { farmerService } from '@/services/farmerService'
import {
  plotCropHistorySchema,
  agroZoneOverrideSchema,
  type PlotRow,
  type PlotCropHistoryRow,
  type PlotCropHistoryInput,
  type AgroZoneOverrideInput,
  type AreaUnit,
} from '@repo/shared'

export function usePlotDetail(plotId: string, initialUnit: AreaUnit = 'timad') {
  const queryClient = useQueryClient()
  const [unit, setUnit] = useState<AreaUnit>(initialUnit)
  const [overrideModalOpen, setOverrideModalOpen] = useState(false)
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false)
  const [selectedSeason, setSelectedSeason] = useState<number>(new Date().getFullYear())

  // 1. Fetch Plot Detail
  const {
    data: plot,
    isLoading: plotLoading,
    error: plotError,
  } = useQuery<PlotRow | null>({
    queryKey: ['plot', plotId, unit],
    queryFn: async () => {
      const res = await farmerService.getPlot(plotId, unit)
      if (!res.success) throw new Error(res.error || 'Failed to fetch plot details.')
      return res.data ?? null
    },
    enabled: Boolean(plotId),
    staleTime: 30_000,
  })

  // 2. Fetch Plot Crop History
  const {
    data: cropHistory = [],
    isLoading: historyLoading,
  } = useQuery<PlotCropHistoryRow[]>({
    queryKey: ['plot', plotId, 'cropHistory'],
    queryFn: async () => {
      const res = await farmerService.getCropHistory(plotId)
      if (!res.success) throw new Error(res.error || 'Failed to fetch crop history.')
      return res.data ?? []
    },
    enabled: Boolean(plotId),
    staleTime: 30_000,
  })

  // 3. Upsert Crop History Mutation
  const historyMutation = useMutation({
    mutationFn: async ({
      seasonYear,
      input,
    }: {
      seasonYear: number
      input: PlotCropHistoryInput
    }) => {
      const parsed = plotCropHistorySchema.safeParse(input)
      if (!parsed.success) {
        throw new Error('Please ensure fallow matches crop selection.')
      }
      const res = await farmerService.upsertCropHistory(plotId, seasonYear, parsed.data)
      if (!res.success) throw new Error(res.error || 'Failed to save crop history.')
      return res.data
    },
    onSuccess: () => {
      toast.success('Crop history record updated.')
      setHistoryDrawerOpen(false)
      queryClient.invalidateQueries({ queryKey: ['plot', plotId, 'cropHistory'] })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  // 4. Agro-Zone Override Mutation (DA/Officer)
  const overrideMutation = useMutation({
    mutationFn: async (input: AgroZoneOverrideInput) => {
      const parsed = agroZoneOverrideSchema.safeParse(input)
      if (!parsed.success) {
        throw new Error('Reason must be at least 5 characters long.')
      }
      const res = await farmerService.overrideAgroZone(plotId, parsed.data)
      if (!res.success) throw new Error(res.error || 'Failed to override agro-zone.')
      return res.data
    },
    onSuccess: () => {
      toast.success('Agro-climatic zone override recorded in audit log.')
      setOverrideModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['plot', plotId] })
      queryClient.invalidateQueries({ queryKey: ['plots'] })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return {
    plot,
    plotLoading,
    plotError,
    cropHistory,
    historyLoading,
    unit,
    setUnit,
    overrideModalOpen,
    setOverrideModalOpen,
    historyDrawerOpen,
    setHistoryDrawerOpen,
    selectedSeason,
    setSelectedSeason,
    handleSaveCropHistory: (seasonYear: number, input: PlotCropHistoryInput) =>
      historyMutation.mutate({ seasonYear, input }),
    isSavingHistory: historyMutation.isPending,
    handleOverrideZone: (input: AgroZoneOverrideInput) => overrideMutation.mutate(input),
    isOverridingZone: overrideMutation.isPending,
  }
}
