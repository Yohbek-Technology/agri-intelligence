'use client'

import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { officerService } from '@/services/officerService'

export function useAuditLog() {
  const [actionFilter, setActionFilter] = useState('')
  const [dateFrom, setDateFrom]         = useState('')
  const [dateTo, setDateTo]             = useState('')
  const [page, setPage]                 = useState(1)
  const LIMIT = 50

  const params = {
    action: actionFilter || undefined,
    from:   dateFrom || undefined,
    to:     dateTo || undefined,
    page,
    limit:  LIMIT,
  }

  const query = useQuery({
    queryKey: ['audit', params],
    queryFn: async () => {
      const res = await officerService.listAuditLogs(params)
      if (!res.success) throw new Error(res.error ?? 'Failed to load audit logs')
      return res.data!
    },
    staleTime: 10_000,
  })

  const handleSetActionFilter = useCallback((v: string) => {
    setActionFilter(v)
    setPage(1)
  }, [])

  const handleSetDateFrom = useCallback((v: string) => {
    setDateFrom(v)
    setPage(1)
  }, [])

  const handleSetDateTo = useCallback((v: string) => {
    setDateTo(v)
    setPage(1)
  }, [])

  return {
    logs:            query.data ?? [],
    isLoading:       query.isLoading,
    error:           query.error?.message ?? null,
    actionFilter,
    setActionFilter: handleSetActionFilter,
    dateFrom,
    setDateFrom:     handleSetDateFrom,
    dateTo,
    setDateTo:       handleSetDateTo,
    page,
    setPage,
  }
}

// ─── Formatting & Presentation Utilities ─────────────────────────────────────

export const PARAM_LABELS: Record<string, string> = {
  'land_unit.timad_to_ha':             'Timad → Hectare',
  'land_unit.kert_to_ha':              'Kert → Hectare',
  'land_unit.hectare_to_ha':           'Hectare → Hectare',
  'agro_zone.kolla_max_m':             'Kolla Max Elevation (m)',
  'agro_zone.dega_min_m':              'Dega Min Elevation (m)',
  'voice.intent_confidence_threshold': 'Voice Confidence Threshold',
  'weather.spray_wind_max_kmh':        'Spray Wind Max (km/h)',
  'weather.spray_washoff_hours':       'Spray Washoff (hrs)',
  'weather.harvest_rain_prob_max_pct': 'Harvest Rain Prob Max (%)',
  'weather.frost_min_c':               'Frost Min (°C)',
  'weather.downpour_mm_per_day':       'Downpour Threshold (mm/day)',
  'weather.dry_spell_days':            'Dry Spell Days',
  'rain_onset.accumulation_mm':        'Rain Onset Accumulation (mm)',
  'rain_onset.window_days':            'Rain Onset Window (days)',
  'yield.cohort_min_size':             'Yield Cohort Min Size',
  'diagnosis.low_confidence':          'Diagnosis Low Confidence',
  'outbreak.radius_km':                'Outbreak Radius (km)',
  'outbreak.window_days':              'Outbreak Window (days)',
  'outbreak.min_cases':                'Outbreak Min Cases',
  'triage.overdue_hours':              'Triage Overdue (hrs)',
  'demand.critical_gap_pct':           'Demand Critical Gap (%)',
  'demand.max_margin_pct':             'Demand Max Margin (%)',
  'market.stale_days':                 'Market Stale Days',
  'market.plausibility_band_pct':      'Market Plausibility Band (%)',
  'broadcast.sms_fallback_minutes':    'SMS Fallback (min)',
  'ai.daily_call_quota':               'AI Daily Call Quota',
}

export function formatAuditLabel(key: string): string {
  return PARAM_LABELS[key] ?? key.replace(/_/g, ' ').replace(/\./g, ' › ')
}

export interface ParsedDiff {
  key: string
  label: string
  prev?: string
  next?: string
  changed: boolean
}

export interface ParsedAuditChanges {
  type: 'diff' | 'flat' | 'fallback' | 'empty'
  diffs?: ParsedDiff[]
  entries?: { label: string; value: string }[]
  fallback?: string
}

export function parseAuditChanges(value: unknown): ParsedAuditChanges {
  if (value === null || value === undefined) {
    return { type: 'empty' }
  }

  if (
    typeof value === 'object' &&
    !Array.isArray(value) &&
    ('before' in (value as object) || 'after' in (value as object))
  ) {
    const obj = value as { before?: Record<string, unknown>; after?: Record<string, unknown> }
    const after = obj.after ?? {}
    const before = obj.before ?? {}
    const keys = Array.from(new Set([...Object.keys(before), ...Object.keys(after)]))

    if (keys.length === 0) return { type: 'empty' }

    const diffs: ParsedDiff[] = keys.map((k) => {
      const prev = before[k]
      const next = after[k]
      const changed = JSON.stringify(prev) !== JSON.stringify(next)
      return {
        key: k,
        label: formatAuditLabel(k),
        prev: prev !== undefined ? String(prev) : undefined,
        next: next !== undefined ? String(next) : undefined,
        changed,
      }
    })

    return { type: 'diff', diffs }
  }

  if (typeof value === 'object' && !Array.isArray(value)) {
    const entries = Object.entries(value as Record<string, unknown>).map(([k, v]) => ({
      label: formatAuditLabel(k),
      value: String(v),
    }))
    if (entries.length === 0) return { type: 'empty' }
    return { type: 'flat', entries }
  }

  return { type: 'fallback', fallback: String(value) }
}

export function getActionBadgeColor(action: string): string {
  if (action.includes('deactivate') || action.includes('retire')) {
    return 'bg-danger-light text-danger'
  }
  if (action.includes('create') || action.includes('verify')) {
    return 'bg-success-light text-success'
  }
  if (action.includes('update') || action.includes('correct') || action.includes('parameters')) {
    return 'bg-accent-light text-accent'
  }
  return 'bg-surface-subtle text-text-muted'
}

