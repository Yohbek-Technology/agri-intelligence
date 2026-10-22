'use client'

import { useAuditLog } from '@/hooks/useAuditLog'
import type { AuditLogRow } from '@/services/officerService'

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
]

function ActionBadge({ action }: { action: string }) {
  const color =
    action.includes('deactivate') || action.includes('retire') ? 'bg-danger-light text-danger' :
    action.includes('create') || action.includes('verify')     ? 'bg-success-light text-success' :
    action.includes('update') || action.includes('correct')    ? 'bg-accent-light text-accent' :
                                                                  'bg-surface-subtle text-text-muted'
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-mono font-medium ${color}`}>
      {action}
    </span>
  )
}

function JsonDiff({ value }: { value: unknown }) {
  if (!value) return <span className="text-text-faint text-xs">—</span>
  try {
    return (
      <pre className="text-[10px] font-mono text-text-muted bg-surface-subtle rounded-lg p-2 max-w-xs overflow-x-auto whitespace-pre-wrap">
        {JSON.stringify(value, null, 2)}
      </pre>
    )
  } catch {
    return <span className="text-text-faint text-xs">—</span>
  }
}

export default function AuditPage() {
  const {
    logs,
    isLoading,
    error,
    actionFilter,
    setActionFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    page,
    setPage,
  } = useAuditLog()

  const typedLogs = logs as AuditLogRow[]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Office Audit Trail</h1>
        <p className="text-sm text-text-muted mt-1">
          Immutable log of all administrative actions — parameter updates, staff changes, and catalog revisions.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4 p-4 bg-surface border border-border rounded-xl">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Action</label>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-sm border border-border rounded-lg px-3 py-2 bg-surface text-text-primary min-w-[200px]"
          >
            {ACTION_OPTIONS.map((a) => (
              <option key={a} value={a}>{a || 'All actions'}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="text-sm border border-border rounded-lg px-3 py-2 bg-surface text-text-primary"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="text-sm border border-border rounded-lg px-3 py-2 bg-surface text-text-primary"
          />
        </div>
        {(actionFilter || dateFrom || dateTo) && (
          <button
            type="button"
            onClick={() => { setActionFilter(''); setDateFrom(''); setDateTo('') }}
            className="text-sm text-text-muted hover:text-text-primary cursor-pointer pb-2"
          >
            Clear filters
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-danger-light border border-danger rounded-xl text-sm text-danger">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-subtle">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Actor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Action</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Entity</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Changes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-text-faint">
                    Loading audit log…
                  </td>
                </tr>
              ) : typedLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-text-faint">
                    No audit records found.
                  </td>
                </tr>
              ) : (
                typedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-subtle align-top">
                    <td className="px-4 py-3 font-mono text-xs text-text-muted whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-text-primary text-xs">
                      {log.actorName ?? <span className="text-text-faint">System</span>}
                    </td>
                    <td className="px-4 py-3">
                      <ActionBadge action={log.action} />
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {log.entityType && (
                        <span className="text-text-muted">
                          {log.entityType}
                          {log.entityId && (
                            <span className="font-mono text-text-faint"> #{log.entityId.slice(0, 8)}</span>
                          )}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <JsonDiff value={log.changesJson} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border-subtle">
          <span className="text-xs text-text-faint">Page {page}</span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 text-xs font-medium border border-border rounded-lg cursor-pointer disabled:opacity-40 hover:bg-surface-subtle"
            >
              ← Previous
            </button>
            <button
              type="button"
              disabled={typedLogs.length < 50}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 text-xs font-medium border border-border rounded-lg cursor-pointer disabled:opacity-40 hover:bg-surface-subtle"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
