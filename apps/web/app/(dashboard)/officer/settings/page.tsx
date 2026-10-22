'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useOfficeSummary, useOfficeParamsForm } from '@/hooks/useOfficeSettings'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Notice } from '@/components/ui/notice'
import { CardSkeleton } from '@/components/ui/skeleton'
import { showSuccessToast, showErrorToast } from '@/components/ui/toast'
import type { OfficeParametersUpdate } from '@repo/shared'

const UI_BORDER = '1.5px solid var(--color-border-ui)'

// ─── Sub-components ──────────────────────────────────────────────────────────

interface ParameterSectionProps {
  title: string
  children: React.ReactNode
  index?: number
}

function ParameterSection({ title, children, index = 0 }: ParameterSectionProps) {
  return (
    <motion.section
      className="bg-surface rounded-2xl p-6 space-y-4"
      style={{ border: UI_BORDER }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: 0.06 + index * 0.05 }}
    >
      <h2 className="text-xs font-semibold text-text-primary uppercase tracking-wider font-mono whitespace-nowrap">
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {children}
      </div>
    </motion.section>
  )
}

interface ParamFieldProps {
  label: string
  value: number | undefined
  onChange: (v: number | undefined) => void
  unit?: string
  min?: number
  max?: number
  step?: number
  readOnly?: boolean
  error?: string
  hint?: string
}

function ParamField({
  label, value, onChange, unit,
  min, max, step = 1, readOnly = false,
  error, hint,
}: ParamFieldProps) {
  return (
    <Input
      label={unit ? `${label} (${unit})` : label}
      type="number"
      value={value ?? ''}
      onChange={(e) => {
        const v = e.target.value
        if (v === '') { onChange(undefined); return }
        const n = parseFloat(v)
        if (!isNaN(n)) onChange(n)
      }}
      min={min}
      max={max}
      step={step}
      readOnly={readOnly}
      disabled={readOnly}
      error={error}
      hint={hint}
    />
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const t = useTranslations('OfficerPages')
  const { data: office, isLoading } = useOfficeSummary()
  const {
    formValues, setField, isDirty, isSubmitting,
    generalError, fieldErrors, handleSubmit, handleReset,
  } = useOfficeParamsForm()

  const fe = fieldErrors as Partial<Record<keyof OfficeParametersUpdate, string>>

  async function handleSave() {
    try {
      await handleSubmit()
      showSuccessToast(t('toast_settings_saved'), {
        label: t('undo'),
        onUndo: () => {
          handleReset()
          showSuccessToast('Settings reverted to last saved values')
        },
      })
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : 'Failed to save settings')
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-3 sm:p-6 space-y-6">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-lg bg-surface-subtle animate-pulse" />
          <div className="h-4 w-64 rounded-lg bg-surface-subtle animate-pulse" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} rows={4} />)}
      </div>
    )
  }

  const sections: {
    titleKey: string
    fields: {
      key: keyof OfficeParametersUpdate
      labelKey: string
      unit?: string
      min?: number
      max?: number
      step?: number
      readOnly?: boolean
      hintKey?: string
    }[]
  }[] = [
    {
      titleKey: 'settings_land_units',
      fields: [
        { key: 'land_unit_timad_to_ha',  labelKey: 'settings_timad_ha', unit: 'ha', min: 0.01, max: 1, step: 0.01 },
        { key: 'land_unit_kert_to_ha',   labelKey: 'settings_kert_ha',  unit: 'ha', min: 0.01, max: 1, step: 0.01 },
      ],
    },
    {
      titleKey: 'settings_agro_zone',
      fields: [
        { key: 'agro_zone_kolla_max_m', labelKey: 'settings_kolla_max', unit: 'm', min: 100,  max: 2000 },
        { key: 'agro_zone_dega_min_m',  labelKey: 'settings_dega_min',  unit: 'm', min: 1500, max: 4000 },
      ],
    },
    {
      titleKey: 'settings_weather',
      fields: [
        { key: 'weather_spray_wind_max_kmh',        labelKey: 'settings_spray_wind',    unit: 'km/h',   min: 1,  max: 50  },
        { key: 'weather_spray_washoff_hours',        labelKey: 'settings_spray_washoff', unit: 'hrs',    min: 1,  max: 24  },
        { key: 'weather_harvest_rain_prob_max_pct',  labelKey: 'settings_harvest_rain',  unit: '%',      min: 0,  max: 100 },
        { key: 'weather_frost_min_c',                labelKey: 'settings_frost_min',     unit: '°C',     min: -10, max: 10, step: 0.5 },
        { key: 'weather_downpour_mm_per_day',        labelKey: 'settings_downpour',      unit: 'mm/day', min: 10, max: 200 },
        { key: 'weather_dry_spell_days',             labelKey: 'settings_dry_spell',     unit: 'days',   min: 3,  max: 30  },
        { key: 'rain_onset_accumulation_mm',         labelKey: 'settings_rain_onset_acc',unit: 'mm',     min: 5,  max: 50  },
        { key: 'rain_onset_window_days',             labelKey: 'settings_rain_onset_window', unit: 'days', min: 1, max: 14 },
      ],
    },
    {
      titleKey: 'settings_ai_voice',
      fields: [
        { key: 'voice_intent_confidence_threshold', labelKey: 'settings_voice_confidence', min: 0, max: 1, step: 0.05 },
        { key: 'ai_daily_call_quota',               labelKey: 'settings_ai_quota',         min: 1, max: 10000 },
      ],
    },
    {
      titleKey: 'settings_yield_diag',
      fields: [
        { key: 'yield_cohort_min_size',   labelKey: 'settings_cohort_min',       min: 3, max: 20  },
        { key: 'diagnosis_low_confidence',labelKey: 'settings_diag_confidence',  min: 0, max: 1, step: 0.05 },
      ],
    },
    {
      titleKey: 'settings_outbreak_triage',
      fields: [
        { key: 'outbreak_radius_km',   labelKey: 'settings_outbreak_radius',  unit: 'km',  min: 1,  max: 50  },
        { key: 'outbreak_window_days', labelKey: 'settings_outbreak_window',  unit: 'days',min: 1,  max: 30  },
        { key: 'outbreak_min_cases',   labelKey: 'settings_outbreak_cases',               min: 2,  max: 20  },
        { key: 'triage_overdue_hours', labelKey: 'settings_triage_overdue',   unit: 'hrs', min: 1,  max: 168 },
      ],
    },
    {
      titleKey: 'settings_demand_market',
      fields: [
        { key: 'demand_critical_gap_pct',        labelKey: 'settings_demand_gap',          unit: '%',    min: 0,  max: 100 },
        { key: 'demand_max_margin_pct',          labelKey: 'settings_demand_margin',        unit: '%',    min: 0,  max: 100 },
        { key: 'market_stale_days',              labelKey: 'settings_market_stale',         unit: 'days', min: 1,  max: 60  },
        { key: 'market_plausibility_band_pct',   labelKey: 'settings_market_plausibility',  unit: '%',    min: 0,  max: 100 },
      ],
    },
    {
      titleKey: 'settings_broadcast',
      fields: [
        { key: 'broadcast_sms_fallback_minutes', labelKey: 'settings_sms_fallback', unit: 'min', min: 1, max: 1440 },
      ],
    },
  ]

  return (
    <div className="max-w-4xl mx-auto pb-32 space-y-6 p-3 sm:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <h1 className="text-2xl font-bold text-text-primary">{t('settings_title')}</h1>
        {office && <p className="text-sm text-text-muted mt-1">{office.name}</p>}
      </motion.div>

      {/* Sections */}
      {sections.map((section, idx) => (
        <ParameterSection key={section.titleKey} title={t(section.titleKey as Parameters<typeof t>[0])} index={idx}>
          {section.fields.map((f) => (
            <ParamField
              key={f.key}
              label={t(f.labelKey as Parameters<typeof t>[0])}
              unit={f.unit}
              value={formValues[f.key] as number | undefined}
              onChange={(v) => setField(f.key, v)}
              min={f.min}
              max={f.max}
              step={f.step}
              readOnly={f.readOnly}
              error={fe[f.key]}
            />
          ))}
        </ParameterSection>
      ))}

      {/* Save bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-10 bg-surface px-6 py-4 space-y-2"
        style={{ borderTop: UI_BORDER }}
      >
        {generalError && <Notice type="error" message={generalError} />}
        <div className="flex items-center justify-between gap-4 max-w-4xl mx-auto">
          <motion.p
            key={isDirty ? 'dirty' : 'clean'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-xs font-mono font-medium whitespace-nowrap ${isDirty ? 'text-accent' : 'text-text-faint'}`}
          >
            {isDirty ? t('settings_unsaved') : t('settings_saved')}
          </motion.p>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={!isDirty || isSubmitting}
            >
              {t('settings_reset')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={!isDirty}
              isLoading={isSubmitting}
            >
              {t('settings_save_changes')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
