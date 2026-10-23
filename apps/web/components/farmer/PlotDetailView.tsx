'use client'

import React from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ArrowLeft, MapPin, Mountain, CloudSun, ShieldAlert, Sparkles } from 'lucide-react'
import { SoilStratumCanvas } from '@/components/soil/SoilStratumCanvas'
import { CropHistoryTimeline } from '@/components/farmer/CropHistoryTimeline'
import type {
  PlotRow,
  PlotCropHistoryRow,
  CropRow,
  PlotCropHistoryInput,
  AreaUnit,
} from '@repo/shared'

interface PlotDetailViewProps {
  plot: PlotRow
  cropHistory: PlotCropHistoryRow[]
  crops: CropRow[]
  displayUnit: AreaUnit
  onUnitChange: (unit: AreaUnit) => void
  onSaveCropHistory: (seasonYear: number, input: PlotCropHistoryInput) => void
  onOpenZoneOverride?: () => void
  canOverrideZone?: boolean
  isSavingHistory: boolean
  backHref?: string
}

export function PlotDetailView({
  plot,
  cropHistory,
  crops,
  displayUnit,
  onUnitChange,
  onSaveCropHistory,
  onOpenZoneOverride,
  canOverrideZone = false,
  isSavingHistory,
  backHref = '/farmer/plots',
}: PlotDetailViewProps) {
  const tFarmer = useTranslations('Phase2.farmer')
  const tPlots = useTranslations('Phase2.plots')
  const tSoil = useTranslations('Phase2.soil')
  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={backHref}
            className="p-2 rounded-xl bg-surface hover:bg-surface-subtle border-2 border-border-ui text-text-muted transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold font-mono uppercase text-text-primary">
                {plot.name}
              </h1>
              <span
                className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md border ${
                  plot.status === 'active'
                    ? 'bg-primary-light text-primary border-primary/40'
                    : 'bg-text-faint/10 text-text-muted border-border-ui'
                }`}
              >
                {plot.status}
              </span>
            </div>
            <p className="text-xs text-text-muted font-mono mt-0.5">
              {plot.kebeleName ?? tFarmer('kebele_territory')} • ID: {plot.id.slice(0, 8)}…
            </p>
          </div>
        </div>

        {/* Customary Unit Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold uppercase text-text-muted">{tFarmer('display_unit_label')}</span>
          <div className="flex rounded-xl p-1 bg-surface border-2 border-border-ui">
            {(['timad', 'kert', 'hectare'] as const).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => onUnitChange(u)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                  displayUnit === u
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

      {/* Main Grid: 3D Soil Canvas & Parcel Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 3D Three.js Stratum Block */}
        <div className="lg:col-span-7">
          <SoilStratumCanvas
            parcelName={plot.name}
            soilClass={plot.soilClass ?? 'loam'}
            drainage={plot.drainage ?? 'moderate'}
            agroZone={plot.agroZone}
            elevationMeters={plot.elevationMeters}
          />
        </div>

        {/* Right: Spatial & Agronomic Coordinates Card */}
        <div className="lg:col-span-5 space-y-4">
          <div
            className="p-5 sm:p-6 rounded-2xl bg-surface space-y-4"
            style={{ border: '2px solid var(--color-border-ui)' }}
          >
            <h2 className="text-sm font-bold font-mono uppercase text-text-primary border-b border-border-ui pb-2">
              {tPlots('spatial_specs')}
            </h2>

            {/* Display Area Metric */}
            <div className="p-3.5 rounded-xl bg-surface-subtle border border-border-ui flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-bold font-mono text-text-primary">
                  {plot.displayArea ?? plot.areaValue}
                </span>
                <span className="ml-1 text-sm font-mono font-bold uppercase text-primary">
                  {displayUnit}
                </span>
              </div>
              <span className="text-xs font-mono text-text-muted">
                = {plot.areaHectares} Ha
              </span>
            </div>

            {/* Centroid Coordinates & PostGIS Cache Grid */}
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between p-2 rounded-lg bg-surface-subtle">
                <span className="text-text-muted flex items-center gap-1.5">
                  <MapPin size={13} className="text-primary" />
                  {tPlots('centroid_gps')}
                </span>
                <span className="font-bold text-text-primary">
                  {plot.centroidLatitude.toFixed(5)}, {plot.centroidLongitude.toFixed(5)}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-surface-subtle">
                <span className="text-text-muted flex items-center gap-1.5">
                  <CloudSun size={13} className="text-accent" />
                  {tPlots('weather_grid')}
                </span>
                <span className="font-bold text-text-primary">
                  {plot.weatherGridLatitude.toFixed(2)}, {plot.weatherGridLongitude.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-surface-subtle">
                <span className="text-text-muted flex items-center gap-1.5">
                  <Mountain size={13} className="text-text-faint" />
                  {tPlots('elevation')}
                </span>
                <span className="font-bold text-text-primary">{plot.elevationMeters}m ASL</span>
              </div>
            </div>

            {/* Agro-Climatic Zone & Override Action */}
            <div className="pt-2 border-t border-border-ui flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono uppercase text-text-muted">{tPlots('agro_zone')}</p>
                <p className="text-xs font-mono font-bold text-text-primary uppercase mt-0.5">
                  {plot.agroZone === 'dega'
                    ? tSoil('dega_label')
                    : plot.agroZone === 'weyna_dega'
                    ? tSoil('weyna_dega_label')
                    : tSoil('kolla_label')}
                  {plot.agroZone !== plot.agroZoneDerived && (
                    <span className="ml-1.5 text-[10px] text-accent font-semibold">
                      {tPlots('manual_override')}
                    </span>
                  )}
                </p>
                {plot.agroZoneOverrideReason && (
                  <p className="text-[10px] text-text-faint mt-0.5 italic">
                    "{plot.agroZoneOverrideReason}"
                  </p>
                )}
              </div>

              {canOverrideZone && onOpenZoneOverride && (
                <button
                  type="button"
                  onClick={onOpenZoneOverride}
                  className="px-2.5 py-1.5 rounded-lg bg-surface-subtle hover:bg-accent hover:text-white border border-border-ui text-[11px] font-mono font-bold uppercase transition-all cursor-pointer"
                >
                  {tPlots('override_zone_btn')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Crop Rotation Timeline */}
      <CropHistoryTimeline
        history={cropHistory}
        crops={crops}
        onSaveHistory={onSaveCropHistory}
        isLoading={isSavingHistory}
      />
    </div>
  )
}
