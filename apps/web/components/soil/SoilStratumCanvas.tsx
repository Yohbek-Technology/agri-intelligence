'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { useSoilStratumScene } from '@/hooks/useSoilStratumScene'
import type { SoilClass, DrainageClass, AgroZone } from '@repo/shared'
import { Mountain, Layers, Droplets, Compass } from 'lucide-react'

interface SoilStratumCanvasProps {
  soilClass: SoilClass
  drainage: DrainageClass
  agroZone: AgroZone
  elevationMeters?: number
  parcelName?: string
  className?: string
}

const SOIL_COLORS: Record<SoilClass, string> = {
  koticha_vertisol: '#1F1E1D',
  beda_nitisol: '#8A3C23',
  sandy: '#C2A374',
  clay: '#5C4033',
  loam: '#3B2D21',
}

const DRAINAGE_CLASSES: Record<DrainageClass, string> = {
  waterlogs: 'bg-danger-light text-danger border-danger/40',
  moderate: 'bg-primary-light text-primary border-primary/40',
  free_draining: 'bg-accent-light text-accent border-accent/40',
}

const AGRO_ZONE_ALTRANGES: Record<AgroZone, string> = {
  dega: '> 2,300m ASL',
  weyna_dega: '1,500m – 2,300m ASL',
  kolla: '< 1,500m ASL',
}

export function SoilStratumCanvas({
  soilClass,
  drainage,
  agroZone,
  elevationMeters,
  parcelName,
  className = '',
}: SoilStratumCanvasProps) {
  const t = useTranslations('Phase2.soil')
  const { containerRef } = useSoilStratumScene({
    soilClass,
    drainage,
    agroZone,
    elevationMeters,
  })

  const soilColor = SOIL_COLORS[soilClass] ?? SOIL_COLORS.loam
  const soilLabel =
    soilClass === 'koticha_vertisol'
      ? t('koticha_label')
      : soilClass === 'beda_nitisol'
      ? t('beda_label')
      : soilClass === 'sandy'
      ? t('sandy_label')
      : soilClass === 'clay'
      ? t('clay_label')
      : t('loam_label')

  const soilDesc =
    soilClass === 'koticha_vertisol'
      ? t('koticha_desc')
      : soilClass === 'beda_nitisol'
      ? t('beda_desc')
      : soilClass === 'sandy'
      ? t('sandy_desc')
      : soilClass === 'clay'
      ? t('clay_desc')
      : t('loam_desc')

  const drainageLabel =
    drainage === 'waterlogs'
      ? t('waterlogs_label')
      : drainage === 'moderate'
      ? t('moderate_label')
      : t('free_draining_label')

  const zoneLabel =
    agroZone === 'dega'
      ? t('dega_label')
      : agroZone === 'weyna_dega'
      ? t('weyna_dega_label')
      : t('kolla_label')

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden bg-surface-subtle transition-all ${className}`}
      style={{ border: '2px solid var(--color-border-ui)' }}
    >
      {/* Top Header Overlay */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div
            className="w-3.5 h-3.5 rounded-full border border-white/60 shadow-xs"
            style={{ backgroundColor: soilColor }}
          />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-border-ui shadow-xs">
            {parcelName ? `${parcelName} — ` : ''}
            {soilLabel}
          </span>
        </div>

        <div className="flex items-center gap-1.5 pointer-events-auto">
          <span
            className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md border shadow-xs ${DRAINAGE_CLASSES[drainage]}`}
          >
            <Droplets size={12} className="inline mr-1 -mt-0.5" />
            {drainageLabel}
          </span>
          <span className="text-[11px] font-mono font-semibold bg-white/90 backdrop-blur-md text-text-muted px-2 py-0.5 rounded-md border border-border-ui shadow-xs">
            <Mountain size={12} className="inline mr-1 -mt-0.5" />
            {zoneLabel} {elevationMeters ? `(${elevationMeters}m)` : ''}
          </span>
        </div>
      </div>

      {/* 3D Canvas Mount */}
      <div
        ref={containerRef}
        className="w-full h-[320px] sm:h-[380px] cursor-grab active:cursor-grabbing select-none"
      />

      {/* Interaction Hint Overlay */}
      <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
        <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-text-muted bg-white/80 backdrop-blur-sm px-2 py-1 rounded-md border border-border-ui shadow-xs">
          <Compass size={12} className="text-primary animate-spin" style={{ animationDuration: '8s' }} />
          <span>{t('drag_hint')}</span>
        </div>
      </div>

      {/* Stratum Layer Horizons Legend */}
      <div className="p-3.5 sm:p-4 bg-white/95 border-t-2 border-border-ui">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="flex items-start gap-2 p-1.5 rounded-lg bg-surface-subtle">
            <div className="w-2.5 h-full rounded-sm" style={{ backgroundColor: soilColor }} />
            <div>
              <p className="font-mono font-bold text-text-primary text-[11px] uppercase">{t('horizon_a')}</p>
              <p className="text-[10px] text-text-muted line-clamp-1">{soilDesc}</p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-1.5 rounded-lg bg-surface-subtle">
            <div className="w-2.5 h-full rounded-sm bg-[#5C3B24]" />
            <div>
              <p className="font-mono font-bold text-text-primary text-[11px] uppercase">{t('horizon_b')}</p>
              <p className="text-[10px] text-text-muted line-clamp-1">{t('horizon_b_desc')}</p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-1.5 rounded-lg bg-surface-subtle">
            <div className="w-2.5 h-full rounded-sm bg-[#615C54]" />
            <div>
              <p className="font-mono font-bold text-text-primary text-[11px] uppercase">{t('horizon_c')}</p>
              <p className="text-[10px] text-text-muted line-clamp-1">{t('horizon_c_desc')}</p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-1.5 rounded-lg bg-surface-subtle">
            <div className="w-2.5 h-full rounded-sm bg-[#2E2F33]" />
            <div>
              <p className="font-mono font-bold text-text-primary text-[11px] uppercase">{t('horizon_r')}</p>
              <p className="text-[10px] text-text-muted line-clamp-1">{t('horizon_r_desc')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
