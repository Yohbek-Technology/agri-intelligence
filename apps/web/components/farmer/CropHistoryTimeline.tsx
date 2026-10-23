'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Plus, History, Sprout, Wind, Check } from 'lucide-react'
import type { PlotCropHistoryRow, CropRow, PlotCropHistoryInput } from '@repo/shared'

interface CropHistoryTimelineProps {
  history: PlotCropHistoryRow[]
  crops: CropRow[]
  onSaveHistory: (seasonYear: number, input: PlotCropHistoryInput) => void
  isLoading: boolean
}

export function CropHistoryTimeline({
  history,
  crops,
  onSaveHistory,
  isLoading,
}: CropHistoryTimelineProps) {
  const tPlots = useTranslations('Phase2.plots')
  const [modalOpen, setModalOpen] = useState(false)
  const [seasonYear, setSeasonYear] = useState<number>(new Date().getFullYear() - 1)
  const [isFallow, setIsFallow] = useState(false)
  const [selectedCropId, setSelectedCropId] = useState<string>('')

  const handleOpenAdd = () => {
    setIsFallow(false)
    setSelectedCropId(crops[0]?.id ?? '')
    setModalOpen(true)
  }

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSaveHistory(seasonYear, {
      seasonYear,
      fallow: isFallow,
      cropId: isFallow ? null : selectedCropId || null,
    })
    setModalOpen(false)
  }

  const sortedHistory = [...history].sort((a, b) => b.seasonYear - a.seasonYear)

  return (
    <div
      className="p-5 sm:p-6 rounded-2xl bg-surface"
      style={{ border: '2px solid var(--color-border-ui)' }}
    >
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-border-ui">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-surface-subtle border border-border-ui text-primary">
            <History size={16} />
          </span>
          <div>
            <h3 className="text-sm font-bold font-mono uppercase text-text-primary">
              {tPlots('crop_history_title')}
            </h3>
            <p className="text-[11px] text-text-muted">
              {tPlots('crop_history_desc')}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface-subtle hover:bg-primary hover:text-white border border-border-ui text-xs font-mono font-bold uppercase transition-all cursor-pointer"
        >
          <Plus size={13} />
          {tPlots('add_season')}
        </button>
      </div>

      {sortedHistory.length === 0 ? (
        <div className="py-6 text-center text-xs text-text-faint font-mono">
          {tPlots('no_history')}
        </div>
      ) : (
        <div className="space-y-3">
          {sortedHistory.map((item, idx) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3.5 rounded-xl bg-surface-subtle border border-border-ui"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold font-mono px-2 py-1 rounded-md bg-white border border-border-ui text-primary">
                  {item.seasonYear}
                </span>

                <div className="flex items-center gap-2">
                  {item.fallow ? (
                    <>
                      <Wind size={15} className="text-accent" />
                      <span className="text-xs font-semibold text-text-muted">
                        {tPlots('fallow_label')}
                      </span>
                    </>
                  ) : (
                    <>
                      <Sprout size={15} className="text-primary" />
                      <span className="text-xs font-bold text-text-primary">
                        {item.cropName ?? tPlots('planted_crop_select')}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <span className="text-[11px] font-mono text-text-faint">
                {item.fallow ? tPlots('nutrient_recovery') : tPlots('rotation_sequence')}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Season History Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className="w-full max-w-sm p-5 rounded-2xl bg-surface shadow-2xl space-y-4"
            style={{ border: '2px solid var(--color-border-ui)' }}
          >
            <h4 className="text-sm font-bold font-mono uppercase text-text-primary">
              {tPlots('record_season_history')}
            </h4>

            <form onSubmit={handleModalSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-text-muted mb-1">
                  {tPlots('season_year')}
                </label>
                <input
                  type="number"
                  min="2000"
                  max="2100"
                  required
                  value={seasonYear}
                  onChange={(e) => setSeasonYear(parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-border-ui font-mono"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-subtle border border-border-ui cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFallow}
                    onChange={(e) => setIsFallow(e.target.checked)}
                    className="rounded-sm text-primary w-4 h-4"
                  />
                  <span className="text-xs font-medium text-text-primary">
                    {tPlots('fallow_checkbox')}
                  </span>
                </label>
              </div>

              {!isFallow && (
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-text-muted mb-1">
                    {tPlots('planted_crop_select')}
                  </label>
                  <select
                    required
                    value={selectedCropId}
                    onChange={(e) => setSelectedCropId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-border-ui"
                  >
                    <option value="">{tPlots('select_crop_placeholder')}</option>
                    {crops.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameEn} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-border-ui text-xs font-mono text-text-muted cursor-pointer"
                >
                  {tPlots('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-1.5 rounded-xl bg-primary text-white text-xs font-mono uppercase font-bold cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? tPlots('saving_season') : tPlots('save_season')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
