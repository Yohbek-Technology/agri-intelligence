'use client'

import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { officerService } from '@/services/officerService'
import { showSuccessToast, showErrorToast } from '@/components/ui/toast'
import type {
  CropRow,
  VarietyRow,
  FertilizerRateRow,
  PestRow,
  ChemicalRow,
  CreateCropInput,
  UpdateCropInput,
  CreateVarietyInput,
  UpdateVarietyInput,
  UpsertFertilizerRateInput,
  CreatePestInput,
  UpdatePestInput,
  CreateChemicalInput,
  UpdateChemicalInput,
} from '@repo/shared'

export function useCrops() {
  return useQuery({
    queryKey: ['catalog', 'crops'],
    queryFn: async () => {
      const res = await officerService.listCrops()
      if (!res.success) throw new Error(res.error ?? 'Failed to load crops')
      return res.data!
    },
    staleTime: 60_000,
  })
}

export function useCreateCrop() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreateCropInput) => {
      const res = await officerService.createCrop(body)
      if (!res.success) throw new Error(res.error ?? 'Failed to create crop')
      return res.data!
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['catalog', 'crops'] }),
  })
}

export function useUpdateCrop() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: UpdateCropInput }) => {
      const res = await officerService.updateCrop(id, body)
      if (!res.success) throw new Error(res.error ?? 'Failed to update crop')
      return res.data!
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['catalog', 'crops'] }),
  })
}

export function useVarieties(cropId?: string) {
  return useQuery({
    queryKey: ['catalog', 'varieties', cropId ?? 'all'],
    queryFn: async () => {
      const res = await officerService.listVarieties(cropId)
      if (!res.success) throw new Error(res.error ?? 'Failed to load varieties')
      return res.data!
    },
    staleTime: 60_000,
  })
}

export function useCreateVariety() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreateVarietyInput) => {
      const res = await officerService.createVariety(body)
      if (!res.success) throw new Error(res.error ?? 'Failed to create variety')
      return res.data!
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['catalog', 'varieties'] }),
  })
}

export function useUpdateVariety() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: UpdateVarietyInput }) => {
      const res = await officerService.updateVariety(id, body)
      if (!res.success) throw new Error(res.error ?? 'Failed to update variety')
      return res.data!
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['catalog', 'varieties'] }),
  })
}

export function useFertilizerRates() {
  return useQuery({
    queryKey: ['catalog', 'fertilizer-rates'],
    queryFn: async () => {
      const res = await officerService.listFertilizerRates()
      if (!res.success) throw new Error(res.error ?? 'Failed to load fertilizer rates')
      return res.data!
    },
    staleTime: 60_000,
  })
}

export function useUpsertFertilizerRate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: UpsertFertilizerRateInput) => {
      const res = await officerService.upsertFertilizerRate(body)
      if (!res.success) throw new Error(res.error ?? 'Failed to save fertilizer rate')
      return res.data!
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['catalog', 'fertilizer-rates'] }),
  })
}

export function usePests() {
  return useQuery({
    queryKey: ['catalog', 'pests'],
    queryFn: async () => {
      const res = await officerService.listPests()
      if (!res.success) throw new Error(res.error ?? 'Failed to load pests')
      return res.data!
    },
    staleTime: 60_000,
  })
}

export function useCreatePest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreatePestInput) => {
      const res = await officerService.createPest(body)
      if (!res.success) throw new Error(res.error ?? 'Failed to create pest')
      return res.data!
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['catalog', 'pests'] }),
  })
}

export function useUpdatePest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: UpdatePestInput }) => {
      const res = await officerService.updatePest(id, body)
      if (!res.success) throw new Error(res.error ?? 'Failed to update pest')
      return res.data!
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['catalog', 'pests'] }),
  })
}

export function useChemicals() {
  return useQuery({
    queryKey: ['catalog', 'chemicals'],
    queryFn: async () => {
      const res = await officerService.listChemicals()
      if (!res.success) throw new Error(res.error ?? 'Failed to load chemicals')
      return res.data!
    },
    staleTime: 60_000,
  })
}

export function useCreateChemical() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreateChemicalInput) => {
      const res = await officerService.createChemical(body)
      if (!res.success) throw new Error(res.error ?? 'Failed to create chemical')
      return res.data!
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['catalog', 'chemicals'] }),
  })
}

export function useUpdateChemical() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: UpdateChemicalInput }) => {
      const res = await officerService.updateChemical(id, body)
      if (!res.success) throw new Error(res.error ?? 'Failed to update chemical')
      return res.data!
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['catalog', 'chemicals'] }),
  })
}

export function useRetireChemical() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await officerService.retireChemical(id)
      if (!res.success) throw new Error(res.error ?? 'Failed to retire chemical')
      return res.data
    },
    // Optimistic: mark retired immediately in cache
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['catalog', 'chemicals'] })
      const prev = qc.getQueryData<ChemicalRow[]>(['catalog', 'chemicals'])
      qc.setQueryData<ChemicalRow[]>(['catalog', 'chemicals'], (old) =>
        old?.map((c) => (c.id === id ? { ...c, status: 'retired' as const } : c)) ?? [],
      )
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['catalog', 'chemicals'], ctx.prev)
    },
    onSettled: () => void qc.invalidateQueries({ queryKey: ['catalog', 'chemicals'] }),
  })
}

/** Unretire / restore a retired chemical (undo retire) */
export function useUnretireChemical() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await officerService.unretireChemical(id)
      if (!res.success) throw new Error(res.error ?? 'Failed to unretire chemical')
      return res.data!
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['catalog', 'chemicals'] })
      const prev = qc.getQueryData<ChemicalRow[]>(['catalog', 'chemicals'])
      qc.setQueryData<ChemicalRow[]>(['catalog', 'chemicals'], (old) =>
        old?.map((c) => (c.id === id ? { ...c, status: 'active' as const, effectiveTo: null } : c)) ?? [],
      )
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['catalog', 'chemicals'], ctx.prev)
    },
    onSettled: () => void qc.invalidateQueries({ queryKey: ['catalog', 'chemicals'] }),
  })
}

// ─── Catalog Page Orchestration Hook ─────────────────────────────────────────

export type CatalogTab = 'crops' | 'varieties' | 'fertilizer' | 'pests' | 'chemicals'

export function useCatalogPage() {
  const t = useTranslations('OfficerPages')
  const qc = useQueryClient()

  const [activeTab, setActiveTab] = useState<CatalogTab>('crops')
  const [selectedCropId, setSelectedCropId] = useState('')
  const [retireTarget, setRetireTarget] = useState<string | null>(null)

  const cropsQ = useCrops()
  const varietiesQ = useVarieties(selectedCropId || undefined)
  const ratesQ = useFertilizerRates()
  const pestsQ = usePests()
  const chemicalsQ = useChemicals()
  const retireMut = useRetireChemical()
  const unretireMut = useUnretireChemical()

  const cropList = (cropsQ.data ?? []) as CropRow[]
  const varietyList = (varietiesQ.data ?? []) as VarietyRow[]
  const rateList = (ratesQ.data ?? []) as FertilizerRateRow[]
  const pestList = (pestsQ.data ?? []) as PestRow[]
  const chemicalList = (chemicalsQ.data ?? []) as ChemicalRow[]

  const handleRetire = useCallback(
    (id: string) => {
      const snapshot = qc.getQueryData<ChemicalRow[]>(['catalog', 'chemicals'])
      let undid = false

      retireMut.mutate(id, {
        onSuccess: () => {
          if (!undid) {
            showSuccessToast(t('toast_chemical_retired'), {
              label: t('undo'),
              onUndo: () => {
                undid = true
                if (snapshot) qc.setQueryData(['catalog', 'chemicals'], snapshot)
                unretireMut.mutate(id, {
                  onSuccess: () => showSuccessToast('Chemical restored'),
                  onError: (err) => {
                    void qc.invalidateQueries({ queryKey: ['catalog', 'chemicals'] })
                    showErrorToast(err instanceof Error ? err.message : 'Could not restore chemical')
                  },
                })
              },
            })
          }
        },
        onError: (err) =>
          showErrorToast(err instanceof Error ? err.message : 'Failed to retire chemical'),
      })
      setRetireTarget(null)
    },
    [qc, retireMut, unretireMut, t]
  )

  const isLoading = {
    crops: cropsQ.isLoading,
    varieties: varietiesQ.isLoading,
    fertilizer: ratesQ.isLoading,
    pests: pestsQ.isLoading,
    chemicals: chemicalsQ.isLoading,
  }[activeTab]

  return {
    activeTab,
    setActiveTab,
    selectedCropId,
    setSelectedCropId,
    retireTarget,
    setRetireTarget,
    cropList,
    varietyList,
    rateList,
    pestList,
    chemicalList,
    handleRetire,
    isLoading,
    isRetiring: retireMut.isPending,
  }
}
