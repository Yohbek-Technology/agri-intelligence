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
    mutationFn: async (body: CreateKebeleInput) => {
      const res = await officerService.createKebele(body)
      if (!res.success) throw new Error(res.error ?? 'Failed to create kebele')
      return res.data!
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['kebeles'] }),
  })
}

export function useUpdateKebele() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: UpdateKebeleInput }) => {
      const res = await officerService.updateKebele(id, body)
      if (!res.success) throw new Error(res.error ?? 'Failed to update kebele')
      return res.data!
    },
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
    mutationFn: async (id: string) => {
      const res = await officerService.deleteKebele(id)
      if (!res.success) throw new Error(res.error ?? 'Failed to delete kebele')
      return res.data
    },
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

/** Restore a soft-deleted kebele (undo delete) */
export function useRestoreKebele() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await officerService.restoreKebele(id)
      if (!res.success) throw new Error(res.error ?? 'Failed to restore kebele')
      return res.data!
    },
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ['kebeles'] })
    },
    onError: (_err, _vars, ctx) => {
      void qc.invalidateQueries({ queryKey: ['kebeles'] })
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
    mutationFn: async (body: CreateStaffInput) => {
      const res = await officerService.createStaff(body)
      if (!res.success) throw new Error(res.error ?? 'Failed to create staff member')
      return res.data!
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['staff'] }),
  })
}

export function useUpdateStaff() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: UpdateStaffInput }) => {
      const res = await officerService.updateStaff(id, body)
      if (!res.success) throw new Error(res.error ?? 'Failed to update staff member')
      return res.data!
    },
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
    mutationFn: async (id: string) => {
      const res = await officerService.deactivateStaff(id)
      if (!res.success) throw new Error(res.error ?? 'Failed to deactivate staff member')
      return res.data
    },
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
    mutationFn: async (id: string) => {
      const res = await officerService.reactivateStaff(id)
      if (!res.success) throw new Error(res.error ?? 'Failed to reactivate staff member')
      return res.data
    },
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
