'use client'

import { useState } from 'react'
import {
  useKebeles, useCreateKebele, useUpdateKebele, useDeleteKebele,
  useStaff, useCreateStaff, useUpdateStaff, useDeactivateStaff,
} from '@/hooks/useKebeles'
import { KebeleList }  from '@/components/officer/kebeles/KebeleList'
import { KebeleDrawer } from '@/components/officer/kebeles/KebeleDrawer'
import { StaffList }   from '@/components/officer/kebeles/StaffList'
import { StaffDrawer } from '@/components/officer/kebeles/StaffDrawer'
import type { KebeleRow, StaffRow } from '@repo/shared'

type DrawerMode = 'create' | 'edit'

export default function KebelesPage() {
  const kebeles      = useKebeles()
  const staff        = useStaff()
  const createKebele = useCreateKebele()
  const updateKebele = useUpdateKebele()
  const deleteKebele = useDeleteKebele()
  const createStaff  = useCreateStaff()
  const updateStaff  = useUpdateStaff()
  const deactivate   = useDeactivateStaff()

  const [kebeleDrawer, setKebeleDrawer] = useState<{ open: boolean; mode: DrawerMode; row?: KebeleRow }>({ open: false, mode: 'create' })
  const [staffDrawer, setStaffDrawer]   = useState<{ open: boolean; mode: DrawerMode; row?: StaffRow }>({ open: false, mode: 'create' })

  const kebeleList = (kebeles.data ?? []) as KebeleRow[]
  const staffList  = (staff.data ?? []) as StaffRow[]

  async function handleKebeleSubmit(data: Record<string, unknown>) {
    if (kebeleDrawer.mode === 'edit' && kebeleDrawer.row) {
      await updateKebele.mutateAsync({ id: kebeleDrawer.row.id, body: data as any })
    } else {
      await createKebele.mutateAsync(data as any)
    }
    setKebeleDrawer({ open: false, mode: 'create' })
  }

  async function handleStaffSubmit(data: Record<string, unknown>) {
    if (staffDrawer.mode === 'edit' && staffDrawer.row) {
      await updateStaff.mutateAsync({ id: staffDrawer.row.id, body: data as any })
    } else {
      await createStaff.mutateAsync(data as any)
    }
    setStaffDrawer({ open: false, mode: 'create' })
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Territory &amp; Staff</h1>
        <p className="text-sm text-text-muted mt-1">Manage kebele boundaries and extension staff assignments.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kebeles panel */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-base font-semibold text-text-primary">Kebeles</h2>
            <button
              type="button"
              onClick={() => setKebeleDrawer({ open: true, mode: 'create' })}
              className="text-xs font-medium text-primary hover:text-primary-hover cursor-pointer"
            >
              + Add Kebele
            </button>
          </div>
          <div className="p-4">
            <KebeleList
              kebeles={kebeleList}
              onEdit={(row) => setKebeleDrawer({ open: true, mode: 'edit', row })}
              onDelete={(row) => deleteKebele.mutate(row.id)}
              isDeleting={deleteKebele.isPending}
            />
          </div>
        </div>

        {/* Staff panel */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-base font-semibold text-text-primary">Extension Staff</h2>
            <button
              type="button"
              onClick={() => setStaffDrawer({ open: true, mode: 'create' })}
              className="text-xs font-medium text-primary hover:text-primary-hover cursor-pointer"
            >
              + Add Staff
            </button>
          </div>
          <div className="p-4">
            <StaffList
              staff={staffList}
              onEdit={(row) => setStaffDrawer({ open: true, mode: 'edit', row })}
              onDeactivate={(row) => deactivate.mutate(row.id)}
              isDeactivating={deactivate.isPending}
            />
          </div>
        </div>
      </div>

      {/* Drawers */}
      {kebeleDrawer.open && (
        <KebeleDrawer
          mode={kebeleDrawer.mode}
          initial={kebeleDrawer.row ?? null}
          onClose={() => setKebeleDrawer({ open: false, mode: 'create' })}
          onSubmit={handleKebeleSubmit}
          isSubmitting={createKebele.isPending || updateKebele.isPending}
          error={createKebele.error?.message ?? updateKebele.error?.message}
        />
      )}

      {staffDrawer.open && (
        <StaffDrawer
          mode={staffDrawer.mode}
          initial={staffDrawer.row ?? null}
          kebeles={kebeleList}
          onClose={() => setStaffDrawer({ open: false, mode: 'create' })}
          onSubmit={handleStaffSubmit}
          isSubmitting={createStaff.isPending || updateStaff.isPending}
          error={createStaff.error?.message ?? updateStaff.error?.message}
        />
      )}
    </div>
  )
}
