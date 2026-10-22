'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { officerService } from '@/services/officerService'
import type {
  KebeleRow,
  StaffRow,
  CreateKebeleInput,
  UpdateKebeleInput,
  CreateStaffInput,
  UpdateStaffInput,
} from '@repo/shared'

// ─── Kebeles ────────────────────────────────────────────────────────────────

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
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateKebeleInput) => officerService.createKebele(body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['kebeles'] }),
  })
}

export function useUpdateKebele() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateKebeleInput }) =>
      officerService.updateKebele(id, body),
    onMutate: async ({ id, body }) => {
      await qc.cancelQueries({ queryKey: ['kebeles'] })
      const prev = qc.getQueryData<KebeleRow[]>(['kebeles'])
      qc.setQueryData<KebeleRow[]>(['kebeles'], (old): KebeleRow[] =>
        (old ?? []).map((k): KebeleRow => (k.id === id ? { ...k, ...(body as Partial<KebeleRow>) } : k)),
      )
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['kebeles'], ctx.prev)
    },
    onSettled: () => void qc.invalidateQueries({ queryKey: ['kebeles'] }),
  })
}

export function useDeleteKebele() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => officerService.deleteKebele(id),
    // Optimistic: remove from cache immediately so UI is instant
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['kebeles'] })
      const prev = qc.getQueryData<KebeleRow[]>(['kebeles'])
      qc.setQueryData<KebeleRow[]>(['kebeles'], (old) => old?.filter((k) => k.id !== id) ?? [])
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['kebeles'], ctx.prev)
    },
    onSettled: () => void qc.invalidateQueries({ queryKey: ['kebeles'] }),
  })
}

// ─── Staff ───────────────────────────────────────────────────────────────────

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
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateStaffInput) => officerService.createStaff(body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['staff'] }),
  })
}

export function useUpdateStaff() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateStaffInput }) =>
      officerService.updateStaff(id, body),
    onMutate: async ({ id, body }) => {
      await qc.cancelQueries({ queryKey: ['staff'] })
      const prev = qc.getQueryData<StaffRow[]>(['staff'])
      qc.setQueryData<StaffRow[]>(['staff'], (old) =>
        old?.map((s) => (s.id === id ? { ...s, ...body } : s)) ?? [],
      )
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['staff'], ctx.prev)
    },
    onSettled: () => void qc.invalidateQueries({ queryKey: ['staff'] }),
  })
}

export function useDeactivateStaff() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => officerService.deactivateStaff(id),
    // Optimistic: mark as banned immediately
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['staff'] })
      const prev = qc.getQueryData<StaffRow[]>(['staff'])
      qc.setQueryData<StaffRow[]>(['staff'], (old) =>
        old?.map((s) => (s.id === id ? { ...s, banned: true } : s)) ?? [],
      )
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['staff'], ctx.prev)
    },
    onSettled: () => void qc.invalidateQueries({ queryKey: ['staff'] }),
  })
}

/** Reactivate a banned staff member (undo deactivate) */
export function useReactivateStaff() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => officerService.reactivateStaff(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['staff'] })
      const prev = qc.getQueryData<StaffRow[]>(['staff'])
      qc.setQueryData<StaffRow[]>(['staff'], (old) =>
        old?.map((s) => (s.id === id ? { ...s, banned: false } : s)) ?? [],
      )
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['staff'], ctx.prev)
    },
    onSettled: () => void qc.invalidateQueries({ queryKey: ['staff'] }),
  })
}
