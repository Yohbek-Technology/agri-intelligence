'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useAuditLog } from '@/hooks/useAuditLog'
import { TableSkeleton } from '@/components/ui/skeleton'
import type { AuditLogRow } from '@/services/officerService'

const UI_BORDER = '2px solid var(--color-border-ui)'
const SHADOW    = '0 1px 2px rgba(0,0,0,0.03)'

// Human-readable labels for dotted office parameter keys
const PARAM_LABELS: Record<string, string> = {
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

function labelFor(key: string): string {
  return PARAM_LABELS[key] ?? key.replace(/_/g, ' ').replace(/\./g, ' › ')
}

// Render changesJson in a human-readable way
function ChangesCell({ value }: { value: unknown }) {
  if (value === null || value === undefined) {
    return <span className="text-text-faint text-xs">—</span>
  }

  // Office parameter update: { before: {...}, after: {...} }
  if (
    typeof value === 'object' &&
    !Array.isArray(value) &&
    ('before' in (value as object) || 'after' in (value as object))
  ) {
    const obj = value as { before?: Record<string, unknown>; after?: Record<string, unknown> }
    const after  = obj.after  ?? {}
    const before = obj.before ?? {}
    const keys   = Array.from(new Set([...Object.keys(before), ...Object.keys(after)]))

    if (keys.length === 0) return <span className="text-text-faint text-xs">—</span>

    return (
      <div className="space-y-1.5 max-w-sm">
        {keys.map((k) => {
          const prev = before[k]
          const next = after[k]
          const changed = JSON.stringify(prev) !== JSON.stringify(next)
          return (
            <div key={k} className="text-xs">
              <span className="text-text-faint font-mono">{labelFor(k)}</span>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                {prev !== undefined && (
                  <span className="font-mono text-danger bg-danger-light px-1.5 py-0.5 rounded text-[10px]">
                    {String(prev)}
                  </span>
                )}
                {changed && prev !== undefined && next !== undefined && (
                  <span className="text-text-faint text-[10px]">→</span>
                )}
                {next !== undefined && (
                  <span className="font-mono text-success bg-success-light px-1.5 py-0.5 rounded text-[10px]">
                    {String(next)}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Simple flat object (e.g. { banned: true })
  if (typeof value === 'object' && !Array.isArray(value)) {
    const entries = Object.entries(value as Record<string, unknown>)
    if (entries.length === 0) return <span className="text-text-faint text-xs">—</span>
    return (
      <div className="space-y-1 max-w-sm">
        {entries.map(([k, v]) => (
          <div key={k} className="flex items-center gap-2 text-xs">
            <span className="text-text-faint font-mono">{labelFor(k)}</span>
            <span className="font-mono font-medium text-text-primary">{String(v)}</span>
          </div>
        ))}
      </div>
    )
  }

  // Fallback for unexpected shapes
  return (
    <span className="font-mono text-xs text-text-muted">{String(value)}</span>
  )
}

function ActionBadge({ action }: { action: string }) {
  const color =
    action.includes('deactivate') || action.includes('retire')
      ? 'bg-danger-light text-danger'
      : action.includes('create') || action.includes('verify')
      ? 'bg-success-light text-success'
      : action.includes('update') || action.includes('correct') || action.includes('parameters')
      ? 'bg-accent-light text-accent'
      : 'bg-surface-subtle text-text-muted'
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono font-medium whitespace-nowrap ${color}`}>
      {action}
    </span>
  )
}

const ACTION_OPTIONS = [
  '',
  'office.parameters_update',
  'staff.created',
  'staff.updated',
  'staff.deactivated',
  'catalog.chemical_retired',
  'farmer.verify',
  'log.correct',
  'data_quality.flag',
  'data_quality.resolve',
] as const

type ActionOption = (typeof ACTION_OPTIONS)[number]

export default function AuditPage() {
  const t = useTranslations('OfficerPages')
  const {
    logs, isLoading, error,
    actionFilter, setActionFilter,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    page, setPage,
  } = useAuditLog()

  const typedLogs = logs as AuditLogRow[]

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full space-y-6">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
      >
        <h1 className="text-2xl font-bold text-text-primary">{t('audit_title')}</h1>
        <p className="text-sm text-text-muted mt-1">{t('audit_subtitle')}</p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, delay: 0.06 }}
        className="flex flex-wrap items-end gap-4 p-4 bg-surface rounded-xl"
        style={{ border: UI_BORDER, boxShadow: SHADOW }}
      >
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wider whitespace-nowrap">
            {t('audit_action')}
          </label>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value as ActionOption)}
            className="text-sm rounded-lg px-3 py-2 bg-surface text-text-primary min-w-[200px] focus:outline-none focus:ring-2 focus:ring-primary/15"
            style={{ border: UI_BORDER }}
          >
            {ACTION_OPTIONS.map((a) => (
              <option key={a} value={a}>{a || t('audit_all_actions')}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wider whitespace-nowrap">
            {t('audit_from')}
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="text-sm rounded-lg px-3 py-2 bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
            style={{ border: UI_BORDER }}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wider whitespace-nowrap">
            {t('audit_to')}
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="text-sm rounded-lg px-3 py-2 bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
            style={{ border: UI_BORDER }}
          />
        </div>

        <AnimatePresence>
          {(actionFilter || dateFrom || dateTo) && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              type="button"
              onClick={() => { setActionFilter(''); setDateFrom(''); setDateTo('') }}
              className="text-sm text-text-muted hover:text-text-primary cursor-pointer pb-2 whitespace-nowrap transition-colors"
            >
              {t('audit_clear_filters')}
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-4 bg-danger-light rounded-xl text-sm text-danger"
            style={{ border: UI_BORDER }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.1 }}
        className="bg-surface rounded-xl overflow-hidden"
        style={{ border: UI_BORDER, boxShadow: SHADOW }}
      >
        {isLoading ? (
          <TableSkeleton rows={8} cols={5} />
        ) : (
          <>
            {/* Scrollable table */}
            <div className="overflow-x-auto" style={{ scrollbarWidth: 'thin' }}>
              <table className="w-full text-sm" style={{ minWidth: 'max-content' }}>
                <thead className="bg-surface-subtle">
                  <tr style={{ borderBottom: UI_BORDER }}>
                    {['Time', 'Actor', 'Action', 'Entity', 'Changes'].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {typedLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-sm text-text-faint">
                        {t('audit_no_records')}
                      </td>
                    </tr>
                  ) : (
                    typedLogs.map((log, i) => (
                      <motion.tr
                        key={log.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="hover:bg-surface-subtle align-top"
                        style={i < typedLogs.length - 1 ? { borderBottom: UI_BORDER } : {}}
                      >
                        <td className="px-4 py-3 font-mono text-xs text-text-muted whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-xs whitespace-nowrap">
                          {log.actorName ?? <span className="text-text-faint">System</span>}
                        </td>
                        <td className="px-4 py-3">
                          <ActionBadge action={log.action} />
                        </td>
                        <td className="px-4 py-3 text-xs whitespace-nowrap">
                          {log.entityType ? (
                            <span className="text-text-muted">
                              {log.entityType}
                              {log.entityId && (
                                <span className="font-mono text-text-faint">
                                  {' '}#{log.entityId.slice(0, 8)}
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="text-text-faint">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <ChangesCell value={log.changesJson} />
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: UI_BORDER }}>
              <span className="text-xs text-text-faint">{t('audit_page')} {page}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer disabled:opacity-40 hover:bg-surface-subtle whitespace-nowrap transition-colors"
                  style={{ border: UI_BORDER }}
                >
                  {t('audit_previous')}
                </button>
                <button
                  type="button"
                  disabled={typedLogs.length < 50}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer disabled:opacity-40 hover:bg-surface-subtle whitespace-nowrap transition-colors"
                  style={{ border: UI_BORDER }}
                >
                  {t('audit_next')}
                </button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}
