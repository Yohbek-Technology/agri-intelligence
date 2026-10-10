import React from 'react'

export function SystemStatusBanner() {
  return (
    <footer className="bg-surface border-t-[1.5px] border-border-strong py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-xs font-mono">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <div className="font-bold text-text-primary uppercase tracking-tight">
              Adama City Agriculture Office // Extension Technology Branch
            </div>
            <p className="text-text-muted text-[11px] mt-0.5">
              Autonomous Agricultural Intelligence & Extension System v1.2
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-surface-subtle border border-border rounded-[2px] text-[10px]">
              <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
              <span>ETHIO-TELECOM SMS: ACTIVE</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-surface-subtle border border-border rounded-[2px] text-[10px]">
              <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
              <span>NEON PG: SYNCHRONIZED</span>
            </span>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-text-faint">
          <div>[SEC-POLICY: 10-CHAR COMPLEXITY + 15M LOCKOUT GUARD]</div>
          <div>Authorized Field & Municipal Operators Only</div>
        </div>
      </div>
    </footer>
  )
}
