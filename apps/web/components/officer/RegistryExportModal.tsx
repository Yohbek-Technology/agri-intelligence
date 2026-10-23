'use client'

import React, { useState } from 'react'
import { Download, FileSpreadsheet } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { ExportRegistryInput, RegistryFilterInput } from '@repo/shared'

interface RegistryExportModalProps {
  open: boolean
  onClose: () => void
  onExport: (data: ExportRegistryInput) => void
  isLoading: boolean
  currentFilters: RegistryFilterInput
}

export function RegistryExportModal({
  open,
  onClose,
  onExport,
  isLoading,
  currentFilters,
}: RegistryExportModalProps) {
  const t = useTranslations('Phase2.registry')
  const tPlots = useTranslations('Phase2.plots')
  const [format, setFormat] = useState<'csv' | 'xlsx'>('csv')

  if (!open) return null

  const handleExportSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onExport({
      ...currentFilters,
      format,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-md p-5 sm:p-6 rounded-2xl bg-surface shadow-2xl space-y-4"
        style={{ border: '2px solid var(--color-border-ui)' }}
      >
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-primary text-white">
            <Download size={20} />
          </span>
          <div>
            <h3 className="text-base font-bold font-mono uppercase tracking-tight text-text-primary">
              {t('export_modal_title')}
            </h3>
            <p className="text-xs text-text-muted">
              {t('export_modal_desc')}
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-subtle border border-border-ui text-xs font-mono text-text-muted space-y-1">
          <p className="font-bold text-text-primary uppercase">{t('active_filters')}</p>
          <p>• {t('col_area', { unit: currentFilters.unit ?? 'hectare' })}</p>
          {currentFilters.q && <p>• "{currentFilters.q}"</p>}
          <p>• {t('col_verification')}: {currentFilters.isVerified ?? 'all'}</p>
        </div>

        <form onSubmit={handleExportSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-text-muted mb-1.5">
              {t('export_format')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['csv', 'xlsx'] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setFormat(fmt)}
                  className={`py-2 px-3 text-center rounded-xl border-2 text-xs font-mono font-bold uppercase cursor-pointer transition-all ${
                    format === fmt
                      ? 'border-primary bg-primary text-white shadow-xs'
                      : 'border-border-ui bg-white text-text-muted hover:border-text-faint'
                  }`}
                >
                  <FileSpreadsheet size={14} className="inline mr-1 -mt-0.5" />
                  {fmt.toUpperCase()}
                </button>
              ))}
            </div>
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
              disabled={isLoading}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-mono uppercase font-bold tracking-wider transition-colors cursor-pointer disabled:opacity-50 shadow-md"
            >
              {isLoading ? t('generating_export') : t('download_export')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
