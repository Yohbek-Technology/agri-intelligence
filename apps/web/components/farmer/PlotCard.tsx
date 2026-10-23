'use client'

import React from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { MapPin, Sprout, Mountain, Droplets, Archive, RotateCcw, ChevronRight } from 'lucide-react'
import type { PlotRow, AreaUnit, SoilClass } from '@repo/shared'

interface PlotCardProps {
  plot: PlotRow
  displayUnit: AreaUnit
  onArchive?: (id: string) => void
  onRestore?: (id: string) => void
  detailHref?: string
}

const SOIL_COLORS: Record<SoilClass, string> = {
  koticha_vertisol: '#1F1E1D',
  beda_nitisol: '#8A3C23',
  sandy: '#C2A374',
  clay: '#5C4033',
  loam: '#3B2D21',
}

export function PlotCard({
  plot,
  displayUnit,
  onArchive,
  onRestore,
  detailHref,
}: PlotCardProps) {
  const tFarmer = useTranslations('Phase2.farmer')
  const tPlots = useTranslations('Phase2.plots')
  const tSoil = useTranslations('Phase2.soil')

  const soilColor = plot.soilClass ? SOIL_COLORS[plot.soilClass] : undefined
  const soilLabel = plot.soilClass
    ? plot.soilClass === 'koticha_vertisol'
      ? tSoil('koticha_label')
      : plot.soilClass === 'beda_nitisol'
      ? tSoil('beda_label')
      : plot.soilClass === 'sandy'
      ? tSoil('sandy_label')
      : plot.soilClass === 'clay'
      ? tSoil('clay_label')
      : tSoil('loam_label')
    : null

  const href = detailHref ?? `/farmer/plots/${plot.id}`
  const isArchived = plot.status === 'archived'

  return (
    <div
      className={`group relative flex flex-col justify-between p-5 rounded-2xl bg-surface transition-all hover:shadow-md ${
        isArchived ? 'opacity-65 bg-surface-subtle/60' : ''
      }`}
      style={{ border: '2px solid var(--color-border-ui)' }}
    >
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="text-base font-bold text-text-primary tracking-tight font-mono uppercase group-hover:text-primary transition-colors">
              {plot.name}
            </h3>
            <p className="text-xs text-text-muted font-mono flex items-center gap-1 mt-0.5">
              <MapPin size={12} className="text-text-faint" />
              {plot.kebeleName ?? tFarmer('kebele_territory')} • {plot.elevationMeters}m ASL
            </p>
          </div>

          <span
            className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md border ${
              isArchived
                ? 'bg-text-faint/10 text-text-muted border-border-ui'
                : 'bg-primary-light text-primary border-primary/30'
            }`}
          >
            {plot.status}
          </span>
        </div>

        {/* Land Size Metric */}
        <div className="p-3 mb-4 rounded-xl bg-surface-subtle border border-border-ui flex items-baseline justify-between">
          <div>
            <span className="text-2xl font-bold font-mono text-text-primary">
              {plot.displayArea ?? plot.areaValue}
            </span>
            <span className="ml-1 text-xs font-mono font-bold uppercase text-primary">
              {displayUnit}
            </span>
          </div>
          <span className="text-[11px] font-mono text-text-muted">
            ≈ {plot.areaHectares} Ha
          </span>
        </div>

        {/* Agronomic Profile Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4 text-[11px]">
          {soilLabel && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-border-ui font-mono text-text-primary shadow-2xs">
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: soilColor }}
              />
              {soilLabel}
            </span>
          )}

          {plot.drainage && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-border-ui font-mono text-text-muted shadow-2xs">
              <Droplets size={11} className="text-blue-600" />
              {plot.drainage === 'waterlogs'
                ? tSoil('waterlogs_badge')
                : plot.drainage === 'moderate'
                ? tSoil('moderate_badge')
                : tSoil('free_draining_badge')}
            </span>
          )}

          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-border-ui font-mono text-text-muted shadow-2xs">
            <Mountain size={11} className="text-amber-700" />
            {plot.agroZone === 'dega'
              ? tSoil('dega_label')
              : plot.agroZone === 'weyna_dega'
              ? tSoil('weyna_dega_label')
              : tSoil('kolla_label')}
          </span>
        </div>

        {/* Planned Crop */}
        <div className="text-xs mb-4 flex items-center gap-1.5 text-text-muted">
          <Sprout size={13} className="text-primary" />
          <span>{tFarmer('planned_crop')}</span>
          <span className="font-semibold text-text-primary">
            {plot.plannedCropName ?? tFarmer('unassigned_season')}
          </span>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-border-ui flex items-center justify-between">
        {isArchived ? (
          onRestore && (
            <button
              type="button"
              onClick={() => onRestore(plot.id)}
              className="flex items-center gap-1 text-xs font-mono text-primary hover:underline cursor-pointer"
            >
              <RotateCcw size={12} />
              {tPlots('restore')}
            </button>
          )
        ) : (
          onArchive && (
            <button
              type="button"
              onClick={() => onArchive(plot.id)}
              className="flex items-center gap-1 text-xs font-mono text-text-faint hover:text-danger cursor-pointer transition-colors"
            >
              <Archive size={12} />
              {tPlots('archive')}
            </button>
          )
        )}

        <Link
          href={href}
          className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider bg-surface-subtle hover:bg-primary hover:text-white border border-border-ui transition-all cursor-pointer"
        >
          {tFarmer('inspect_3d')}
          <ChevronRight size={13} />
        </Link>
      </div>
    </div>
  )
}
