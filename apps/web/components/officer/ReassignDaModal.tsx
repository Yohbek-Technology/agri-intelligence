'use client'

import React, { useState } from 'react'
import { UserCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { StaffRow } from '@repo/shared'

interface ReassignDaModalProps {
  open: boolean
  onClose: () => void
  daStaff: StaffRow[]
  onConfirm: (assignedDaUserId: string) => void
  isLoading: boolean
  targetCount: number
}

export function ReassignDaModal({
  open,
  onClose,
  daStaff,
  onConfirm,
  isLoading,
  targetCount,
}: ReassignDaModalProps) {
  const t = useTranslations('Phase2.registry')
  const tPlots = useTranslations('Phase2.plots')
  const tDa = useTranslations('Phase2.da')
  const [selectedDaId, setSelectedDaId] = useState('')

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDaId) return
    onConfirm(selectedDaId)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-md p-5 sm:p-6 rounded-2xl bg-surface shadow-2xl space-y-4"
        style={{ border: '2px solid var(--color-border-ui)' }}
      >
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-primary-light text-primary border border-primary/30">
            <UserCheck size={20} />
          </span>
          <div>
            <h3 className="text-base font-bold font-mono uppercase tracking-tight text-text-primary">
              {t('reassign_modal_title')}
            </h3>
            <p className="text-xs text-text-muted">
              {t('reassign_modal_desc', { count: targetCount })}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-text-muted mb-1.5">
              {t('select_active_da')}
            </label>
            <select
              required
              value={selectedDaId}
              onChange={(e) => setSelectedDaId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-white rounded-xl border-2 border-border-ui focus:border-primary outline-hidden"
            >
              <option value="">{t('select_active_da')}</option>
              {daStaff.map((da) => (
                <option key={da.id} value={da.id}>
                  {da.name} ({da.phoneNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border-2 border-border-ui text-xs font-mono uppercase font-bold text-text-muted hover:bg-surface-subtle transition-colors cursor-pointer"
            >
              {tPlots('cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading || !selectedDaId}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-mono uppercase font-bold tracking-wider transition-colors cursor-pointer disabled:opacity-50 shadow-md"
            >
              {isLoading ? tDa('recording') : t('confirm_assignment')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
