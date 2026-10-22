'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { officerService } from '@/services/officerService'
import type {
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
    mutationFn: (body: CreateCropInput) => officerService.createCrop(body),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['catalog', 'crops'] }),
  })
}

export function useUpdateCrop() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateCropInput }) =>
      officerService.updateCrop(id, body),
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
    mutationFn: (body: CreateVarietyInput) => officerService.createVariety(body),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['catalog', 'varieties'] }),
  })
}

export function useUpdateVariety() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateVarietyInput }) =>
      officerService.updateVariety(id, body),
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
    mutationFn: (body: UpsertFertilizerRateInput) => officerService.upsertFertilizerRate(body),
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
    mutationFn: (body: CreatePestInput) => officerService.createPest(body),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['catalog', 'pests'] }),
  })
}

export function useUpdatePest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdatePestInput }) =>
      officerService.updatePest(id, body),
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
    mutationFn: (body: CreateChemicalInput) => officerService.createChemical(body),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['catalog', 'chemicals'] }),
  })
}

export function useUpdateChemical() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateChemicalInput }) =>
      officerService.updateChemical(id, body),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['catalog', 'chemicals'] }),
  })
}

export function useRetireChemical() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => officerService.retireChemical(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['catalog', 'chemicals'] }),
  })
}
