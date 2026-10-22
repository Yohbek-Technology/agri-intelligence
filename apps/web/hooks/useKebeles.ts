'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { officerService } from '@/services/officerService'
import type { CreateKebeleInput, UpdateKebeleInput, CreateStaffInput, UpdateStaffInput } from '@repo/shared'

export function useKebeles() {
  return useQuery({
    queryKey: ['kebeles'],
    queryFn: async () => {
      const res = await officerService.listKebeles()
      if (!res.success) throw new Error(res.error ?? 'Failed to load kebeles')
      return res.data!
    },
    staleTime: 30_000,
  })
}

export function useCreateKebele() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateKebeleInput) => officerService.createKebele(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['kebeles'] })
    },
  })
}

export function useUpdateKebele() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateKebeleInput }) =>
      officerService.updateKebele(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['kebeles'] })
    },
  })
}

export function useDeleteKebele() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => officerService.deleteKebele(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['kebeles'] })
    },
  })
}

export function useStaff() {
  return useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const res = await officerService.listStaff()
      if (!res.success) throw new Error(res.error ?? 'Failed to load staff')
      return res.data!
    },
    staleTime: 30_000,
  })
}

export function useCreateStaff() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateStaffInput) => officerService.createStaff(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['staff'] })
    },
  })
}

export function useUpdateStaff() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateStaffInput }) =>
      officerService.updateStaff(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['staff'] })
    },
  })
}

export function useDeactivateStaff() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => officerService.deactivateStaff(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['staff'] })
    },
  })
}
