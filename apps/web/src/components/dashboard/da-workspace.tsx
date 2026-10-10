import React from 'react'
import { Card, CardHeader } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'

export interface DaWorkspaceProps {
  userName?: string | null
  phoneNumber?: string | null
}

export function DaWorkspace({ userName, phoneNumber }: DaWorkspaceProps) {
  const managedFarmers = [
    { id: 'F-101', name: 'Hailemariam Desalegn', kebele: 'Kebele 03', plots: 2, status: 'Logged', lastSeen: 'Today 09:15' },
    { id: 'F-102', name: 'Almaz Ayana', kebele: 'Kebele 03', plots: 1, status: 'Overdue', lastSeen: '4 days ago' },
    { id: 'F-103', name: 'Kenenisa Bekele', kebele: 'Kebele 04', plots: 3, status: 'Pending', lastSeen: 'Yesterday' },
    { id: 'F-104', name: 'Derartu Tulu', kebele: 'Kebele 03', plots: 2, status: 'Logged', lastSeen: 'Today 11:30' },
  ]

  const missingLogTasks = [
    { farmer: 'Almaz Ayana', item: 'Urea Top-Dressing Verification', plot: 'Plot 01 (0.8 Ha)', deadline: 'Overdue by 48h' },
    { farmer: 'Kenenisa Bekele', item: 'Post-Emergence Plant Stand Count', plot: 'Plot 03 (1.5 Ha)', deadline: 'Due Today' },
    { farmer: 'Tirunesh Dibaba', item: 'Rust Severity Foliage Inspection', plot: 'Plot 02 (1.1 Ha)', deadline: 'Due in 24h' },
  ]

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="bg-surface p-4 sm:p-5 border-[1.5px] border-border-strong rounded-[2px] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="primary">[FIELD-HUB-DA]</Badge>
            <h1 className="text-lg sm:text-xl font-bold uppercase font-mono tracking-tight text-text-primary">
              Development Agent Field Hub
            </h1>
          </div>
          <p className="text-xs text-text-muted mt-1 font-mono">
            Field Officer: {userName || 'Development Agent'} | Tel: {phoneNumber || '+251---------'} | Assigned Kebeles: [Kebele 03, Kebele 04]
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="accent">[LOCAL-CACHE: 42 FARMERS]</Badge>
          <Badge variant="surface">[SYNC: 3 PENDING]</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Multi-Farmer Profile Switcher"
            subtitle="Device Shared Proxy Terminal (Managing 30–50 Farmers Offline)"
            badge="[OFFLINE-PROXY]"
            action={
              <Button size="sm" variant="outline" className="font-mono text-xs">
                + Enroll Farmer
              </Button>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono text-left">
              <thead className="bg-surface-subtle text-text-muted uppercase text-[10px] border-b border-border">
                <tr>
                  <th className="py-2.5 px-3">Farmer ID</th>
                  <th className="py-2.5 px-3">Full Legal Name</th>
                  <th className="py-2.5 px-3">Zone / Kebele</th>
                  <th className="py-2.5 px-3">Plots</th>
                  <th className="py-2.5 px-3">Log Status</th>
                  <th className="py-2.5 px-3 text-right">Switch Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {managedFarmers.map((f) => (
                  <tr key={f.id} className="hover:bg-surface-subtle/50 transition-colors">
                    <td className="py-2.5 px-3 font-bold">{f.id}</td>
                    <td className="py-2.5 px-3 text-text-primary font-medium">{f.name}</td>
                    <td className="py-2.5 px-3 text-text-muted">{f.kebele}</td>
                    <td className="py-2.5 px-3">{f.plots}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded-[2px] text-[10px] ${
                          f.status === 'Logged'
                            ? 'bg-primary text-background'
                            : f.status === 'Overdue'
                            ? 'bg-danger text-background'
                            : 'bg-accent text-background'
                        }`}
                      >
                        {f.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <Button size="sm" variant="outline" className="h-7 px-2 text-[11px] font-mono">
                        Proxy Login →
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Missing Log Checklist"
            subtitle="Immediate Field Follow-ups"
            badge="[AUDIT-LIST]"
          />
          <div className="space-y-3 font-mono text-xs">
            {missingLogTasks.map((t, idx) => (
              <div key={idx} className="p-3 bg-surface-subtle border-[1.5px] border-border rounded-[2px]">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-text-primary">{t.farmer}</span>
                  <span className="text-[10px] text-danger font-bold">{t.deadline}</span>
                </div>
                <div className="text-text-muted text-[11px]">{t.item}</div>
                <div className="text-text-faint text-[10px] mt-1">{t.plot}</div>
                <div className="mt-2.5">
                  <Button size="sm" variant="secondary" fullWidth className="h-7 text-[11px] font-mono">
                    Record On-Site Log
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card>
          <CardHeader
            title="Assigned Kebele Visit Tasks"
            subtitle="Weekly Extension Route Scheduling"
            badge="[DISPATCH-SCHEDULE]"
          />
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-surface-subtle border-[1.5px] border-border rounded-[2px] flex justify-between items-center">
              <div>
                <div className="font-bold text-text-primary">Kebele 03: Wonji Upper Sector</div>
                <div className="text-text-muted text-[11px]">8 Sowing Confirmations & Fertilizer Inspections</div>
              </div>
              <Badge variant="primary">TODAY 14:00</Badge>
            </div>
            <div className="p-3 bg-surface-subtle border-[1.5px] border-border rounded-[2px] flex justify-between items-center">
              <div>
                <div className="font-bold text-text-primary">Kebele 04: Boku Vertisol Test Basin</div>
                <div className="text-text-muted text-[11px]">12 Rust Surveillance Trap Surveys</div>
              </div>
              <Badge variant="surface">TOMORROW</Badge>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Batch Offline Sync Queue"
            subtitle="Local SQLite to Central Server Bridge"
            badge="[SYNC-BRIDGE]"
          />
          <div className="p-4 bg-background border-[1.5px] border-border rounded-[2px] font-mono text-xs space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-text-muted">Unsynchronized Offline Logs:</span>
              <span className="font-bold text-text-primary">14 Entries Stored</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-muted">Cached Diagnostic Photos:</span>
              <span className="font-bold text-text-primary">6 High-Res Assets</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-muted">Network Status:</span>
              <span className="text-primary font-bold">ETHIO-TELECOM 4G (STABLE)</span>
            </div>
            <div className="pt-2">
              <Button variant="primary" fullWidth size="sm" className="font-mono text-xs">
                Transmit & Sync Stored Operations Now →
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
