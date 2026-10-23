'use client'

import React, { useState } from 'react'
import { Mountain, AlertTriangle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { AgroZone, AgroZoneOverrideInput } from '@repo/shared'

interface ZoneOverrideModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: AgroZoneOverrideInput) => void
  currentZone: AgroZone
  currentDerivedZone: AgroZone
  isLoading: boolean
}

export function ZoneOverrideModal({
  open,
  onClose,
  onSubmit,
  currentZone,
  currentDerivedZone,
  isLoading,
}: ZoneOverrideModalProps) {
  const t = useTranslations('Phase2.da')
  const tSoil = useTranslations('Phase2.soil')
  const tPlots = useTranslations('Phase2.plots')

  const [agroZone, setAgroZone] = useState<AgroZone>(currentZone)
  const [reason, setReason] = useState('')

  if (!open) return null

  const zoneLabels: Record<AgroZone, string> = {
    dega: tSoil('dega_label'),
    weyna_dega: tSoil('weyna_dega_label'),
    kolla: tSoil('kolla_label'),
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      agroZone,
      reason,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-md p-5 sm:p-6 rounded-2xl bg-surface shadow-2xl space-y-4"
        style={{ border: '2px solid var(--color-border-ui)' }}
      >
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-accent-light text-accent border border-accent/30">
            <Mountain size={20} />
          </span>
          <div>
            <h3 className="text-base font-bold font-mono uppercase tracking-tight text-text-primary">
              {t('zone_override_title')}
            </h3>
            <p className="text-xs text-text-muted">
              {t('auto_derived_label', { zone: zoneLabels[currentDerivedZone] || currentDerivedZone })}
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
          <AlertTriangle size={15} className="shrink-0 mt-0.5 text-amber-600" />
          <span>
            {t('zone_override_warning')}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-text-muted mb-1.5">
              {t('select_zone')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['dega', 'weyna_dega', 'kolla'] as const).map((z) => (
                <button
                  key={z}
                  type="button"
                  onClick={() => setAgroZone(z)}
                  className={`py-2 px-1 text-center rounded-xl border-2 text-xs font-mono font-bold uppercase cursor-pointer transition-all ${
                    agroZone === z
                      ? 'border-primary bg-primary text-white shadow-xs'
                      : 'border-border-ui bg-white text-text-muted hover:border-text-faint'
                  }`}
                >
                  {zoneLabels[z]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase text-text-muted mb-1.5">
              {t('override_reason')}
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Micro-climate frost pocket sheltered by escarpment ridge..."
              className="w-full px-3.5 py-2 text-xs bg-white rounded-xl border-2 border-border-ui focus:border-primary outline-hidden font-sans"
            />
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
              disabled={isLoading || reason.trim().length < 5}
              className="px-5 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-mono uppercase font-bold tracking-wider transition-colors cursor-pointer disabled:opacity-50 shadow-md"
            >
              {isLoading ? t('recording') : t('confirm_override')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
