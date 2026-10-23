'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import type { PlotRow, KebeleRow, CropRow } from '@repo/shared'
import type { OfficePlotFilterParams } from '@/hooks/useOfficePlots'

interface OfficePlotsTableProps {
  plots: PlotRow[]
  filters: OfficePlotFilterParams
  onFilterChange: <K extends keyof OfficePlotFilterParams>(
    field: K,
    value: OfficePlotFilterParams[K]
  ) => void
  kebeles: KebeleRow[]
  crops: CropRow[]
  isLoading: boolean
}

export function OfficePlotsTable({
  plots,
  filters,
  onFilterChange,
  kebeles,
  crops,
  isLoading,
}: OfficePlotsTableProps) {
  const t = useTranslations('Phase2.registry')
  const tSoil = useTranslations('Phase2.soil')
  const tFarmer = useTranslations('Phase2.farmer')
  const tCommon = useTranslations('Common')

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div
        className="p-4 rounded-2xl bg-surface flex flex-col md:flex-row md:items-center justify-between gap-3"
        style={{ border: '2px solid var(--color-border-ui)' }}
      >
        <div className="flex flex-wrap items-center gap-2">
          {/* Kebele */}
          <select
            value={filters.kebele_id ?? ''}
            onChange={(e) => onFilterChange('kebele_id', e.target.value || undefined)}
            className="px-3 py-1.5 text-xs bg-surface-subtle border border-border-ui rounded-xl outline-hidden text-text-primary"
          >
            <option value="">{t('all_kebeles')}</option>
            {kebeles.map((k) => (
              <option key={k.id} value={k.id}>
                {k.name}
              </option>
            ))}
          </select>

          {/* Crop */}
          <select
            value={filters.crop_id ?? ''}
            onChange={(e) => onFilterChange('crop_id', e.target.value || undefined)}
            className="px-3 py-1.5 text-xs bg-surface-subtle border border-border-ui rounded-xl outline-hidden text-text-primary"
          >
            <option value="">{t('all_crops')}</option>
            {crops.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameEn}
              </option>
            ))}
          </select>

          {/* Soil Class */}
          <select
            value={filters.soil_class ?? ''}
            onChange={(e) => onFilterChange('soil_class', e.target.value || undefined)}
            className="px-3 py-1.5 text-xs bg-surface-subtle border border-border-ui rounded-xl outline-hidden text-text-primary"
          >
            <option value="">{t('all_soil_types')}</option>
            <option value="koticha_vertisol">{tSoil('koticha_label')}</option>
            <option value="beda_nitisol">{tSoil('beda_label')}</option>
            <option value="sandy">{tSoil('sandy_label')}</option>
            <option value="clay">{tSoil('clay_label')}</option>
            <option value="loam">{tSoil('loam_label')}</option>
          </select>
        </div>

        {/* Customary Unit Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold uppercase text-text-muted">{tFarmer('display_unit_label')}</span>
          <div className="flex rounded-xl p-1 bg-surface-subtle border-2 border-border-ui">
            {(['hectare', 'timad', 'kert'] as const).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => onFilterChange('unit', u)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                  filters.unit === u
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Data */}
      <div
        className="rounded-2xl bg-surface overflow-hidden shadow-xs"
        style={{ border: '2px solid var(--color-border-ui)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-subtle border-b-2 border-border-ui font-mono uppercase text-text-muted">
                <th className="p-3.5 font-bold">{t('col_parcel_name')}</th>
                <th className="p-3.5 font-bold">{t('col_holder')}</th>
                <th className="p-3.5 font-bold">{t('col_kebele')}</th>
                <th className="p-3.5 font-bold text-right">
                  {t('col_area', { unit: filters.unit })}
                </th>
                <th className="p-3.5 font-bold">{t('col_soil_class')}</th>
                <th className="p-3.5 font-bold">{t('col_drainage')}</th>
                <th className="p-3.5 font-bold">{t('col_agro_zone')}</th>
                <th className="p-3.5 font-bold">{t('col_centroid')}</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border-ui">
              {plots.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-text-faint font-mono">
                    {isLoading ? t('loading_registry') : tCommon('noRecords')}
                  </td>
                </tr>
              ) : (
                plots.map((plot) => (
                  <tr key={plot.id} className="hover:bg-surface-subtle/50 transition-colors">
                    <td className="p-3.5">
                      <p className="font-bold text-text-primary font-mono">{plot.name}</p>
                      <p className="text-[11px] text-text-muted font-mono mt-0.5">
                        {tFarmer('planned_crop')} {plot.plannedCropName ?? '—'}
                      </p>
                    </td>

                    <td className="p-3.5 font-mono text-text-primary">
                      {(plot as any).farmerName ?? 'Assigned Farmer'}
                    </td>

                    <td className="p-3.5 font-mono text-text-muted">
                      {plot.kebeleName ?? 'Kebele Office'}
                    </td>

                    <td className="p-3.5 text-right font-mono font-bold text-primary">
                      {plot.displayArea ?? plot.areaValue}
                    </td>

                    <td className="p-3.5">
                      {plot.soilClass ? (
                        <span className="px-2 py-0.5 rounded-md bg-surface-subtle border border-border-ui font-mono text-[11px] text-text-primary">
                          {plot.soilClass.replace('_', ' ')}
                        </span>
                      ) : (
                        <span className="text-text-faint italic text-[11px]">Unclassified</span>
                      )}
                    </td>

                    <td className="p-3.5">
                      {plot.drainage ? (
                        <span className="px-2 py-0.5 rounded-md bg-surface-subtle border border-border-ui font-mono text-[11px] text-text-muted">
                          {plot.drainage.replace('_', ' ')}
                        </span>
                      ) : (
                        <span className="text-text-faint italic text-[11px]">Unclassified</span>
                      )}
                    </td>

                    <td className="p-3.5 font-mono text-[11px] text-text-muted">
                      {plot.agroZone.replace('_', ' ')} ({plot.elevationMeters}m)
                    </td>

                    <td className="p-3.5 font-mono text-text-faint text-[11px]">
                      {plot.centroidLatitude.toFixed(4)}, {plot.centroidLongitude.toFixed(4)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
