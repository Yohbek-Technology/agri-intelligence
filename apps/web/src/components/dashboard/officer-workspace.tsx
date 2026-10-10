import React from 'react'
import { Card, CardHeader } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'

export interface OfficerWorkspaceProps {
  userName?: string | null
  phoneNumber?: string | null
}

export function OfficerWorkspace({ userName, phoneNumber }: OfficerWorkspaceProps) {
  const depotInventory = [
    { depot: 'Adama Central Depot 01', item: 'Urea (46% N)', stock: '3,450 Quintals', quota: '4,000 Q', status: 'Adequate' },
    { depot: 'Adama Central Depot 01', item: 'NPS Boron Compound', stock: '1,820 Quintals', quota: '2,500 Q', status: 'Attention' },
    { depot: 'Wonji Satellite Hub', item: 'Magna Teff Certified Seed', stock: '640 Quintals', quota: '600 Q', status: 'Surplus' },
    { depot: 'Boku Extension Store', item: 'Kingbird Durum Seed', stock: '120 Quintals', quota: '500 Q', status: 'Critical Gap' },
  ]

  const lowYieldAudits = [
    { plotId: 'PL-8821', kebele: 'Kebele 02', farmer: 'Bekele Desta', crop: 'Teff', variance: '-26% Yield Deficit', reason: 'Delayed NPS Application' },
    { plotId: 'PL-9402', kebele: 'Kebele 04', farmer: 'Genet Tola', crop: 'Wheat', variance: '-22% Yield Deficit', reason: 'Stem Rust Outbreak' },
    { plotId: 'PL-7119', kebele: 'Kebele 01', farmer: 'Tadesse Lemma', crop: 'Maize', variance: '-29% Yield Deficit', reason: 'Drainage Waterlogging' },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-surface p-4 sm:p-5 border-[1.5px] border-border-strong rounded-[2px] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="primary">[GOVERNANCE-DESK]</Badge>
            <h1 className="text-lg sm:text-xl font-bold uppercase font-mono tracking-tight text-text-primary">
              City Agriculture Office Governance Terminal
            </h1>
          </div>
          <p className="text-xs text-text-muted mt-1 font-mono">
            Command Officer: {userName || 'Agriculture Officer'} | Authority: Adama City Agriculture Office | Tel: {phoneNumber || '+251---------'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="accent">[CADASTRE: 12,480 HA]</Badge>
          <Badge variant="surface">[SMS-GATEWAY: ACTIVE]</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-surface border-[1.5px] border-border rounded-[2px] font-mono">
          <span className="text-[10px] text-text-faint uppercase block">[TOTAL REGISTERED FARMLAND]</span>
          <div className="text-2xl font-bold text-text-primary my-1">12,480 Ha</div>
          <span className="text-[11px] text-text-muted">Across 14 Kebeles (98.4% Cadastral Match)</span>
        </div>

        <div className="p-4 bg-surface border-[1.5px] border-border rounded-[2px] font-mono">
          <span className="text-[10px] text-text-faint uppercase block">[AGGREGATE FERTILIZER DEMAND]</span>
          <div className="text-2xl font-bold text-accent my-1">8,240 Quintals</div>
          <span className="text-[11px] text-text-muted">74% Fulfilled from Central Stores</span>
        </div>

        <div className="p-4 bg-surface border-[1.5px] border-border rounded-[2px] font-mono">
          <span className="text-[10px] text-text-faint uppercase block">[ACTIVE LOW-YIELD AUDITS]</span>
          <div className="text-2xl font-bold text-danger my-1">18 Plots</div>
          <span className="text-[11px] text-text-muted">&gt;20% Variance from Historical Baseline</span>
        </div>

        <div className="p-4 bg-surface border-[1.5px] border-border rounded-[2px] font-mono">
          <span className="text-[10px] text-text-faint uppercase block">[UNRESOLVED GRIEVANCES]</span>
          <div className="text-2xl font-bold text-text-primary my-1">4 Open Cases</div>
          <span className="text-[11px] text-text-muted">Average Resolution Time: 34h</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Depot Stock Movement Ledger"
            subtitle="Real-time Inventory Balance vs Agronomic Quotas"
            badge="[DEPOT-LEDGER]"
            action={
              <Button size="sm" variant="outline" className="font-mono text-xs">
                Export Stock Manifest
              </Button>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono text-left">
              <thead className="bg-surface-subtle text-text-muted uppercase text-[10px] border-b border-border">
                <tr>
                  <th className="py-2.5 px-3">Storage Depot</th>
                  <th className="py-2.5 px-3">Input Commodity</th>
                  <th className="py-2.5 px-3">Current Stock</th>
                  <th className="py-2.5 px-3">Target Quota</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {depotInventory.map((d, i) => (
                  <tr key={i} className="hover:bg-surface-subtle/50 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-text-primary">{d.depot}</td>
                    <td className="py-2.5 px-3">{d.item}</td>
                    <td className="py-2.5 px-3 font-bold">{d.stock}</td>
                    <td className="py-2.5 px-3 text-text-muted">{d.quota}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded-[2px] text-[10px] ${
                          d.status === 'Critical Gap'
                            ? 'bg-danger text-background'
                            : d.status === 'Attention'
                            ? 'bg-accent text-background'
                            : 'bg-primary text-background'
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Emergency SMS Broadcast Trigger"
            subtitle="Immediate Mass Farmer Transmission"
            badge="[EMERGENCY-SMS]"
          />
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-surface-subtle border border-danger/40 rounded-[2px]">
              <div className="flex items-center gap-1.5 text-danger font-bold text-[11px] mb-1">
                <span>[BROADCAST READY]</span>
                <span>Weather Frost Alert</span>
              </div>
              <p className="text-text-muted text-[11px] leading-relaxed">
                Nighttime valley temperatures expected below 3°C in Kolla basins. Recommends crop cover.
              </p>
              <div className="mt-2.5">
                <Button size="sm" variant="danger" fullWidth className="h-7 text-[11px] font-mono">
                  Dispatch to 3,400 Farmers →
                </Button>
              </div>
            </div>

            <div className="p-3 bg-surface-subtle border border-accent/40 rounded-[2px]">
              <div className="flex items-center gap-1.5 text-accent font-bold text-[11px] mb-1">
                <span>[PEST ADVISORY]</span>
                <span>Fall Armyworm Alert</span>
              </div>
              <p className="text-text-muted text-[11px] leading-relaxed">
                Confirmed cluster in Wonji kebele. Recommends immediate pheromone trap inspection.
              </p>
              <div className="mt-2.5">
                <Button size="sm" variant="accent" fullWidth className="h-7 text-[11px] font-mono">
                  Dispatch Kebele Advisory →
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader
            title="Low-Yield Audit Desk"
            subtitle="Automated Detection of Anomalous Cohort Gaps (&gt;20%)"
            badge="[YIELD-AUDIT]"
          />
          <div className="space-y-3 font-mono text-xs">
            {lowYieldAudits.map((a) => (
              <div key={a.plotId} className="p-3 bg-surface-subtle border-[1.5px] border-border rounded-[2px]">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-text-primary">
                    {a.plotId} • {a.farmer} ({a.kebele})
                  </span>
                  <span className="text-[10px] text-danger font-bold">{a.variance}</span>
                </div>
                <div className="text-text-muted text-[11px]">Primary Crop: {a.crop}</div>
                <div className="text-text-faint text-[10px] mt-0.5">Identified Root Cause: {a.reason}</div>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="outline" className="h-6 px-2 text-[10px] font-mono">
                    Dispatch Inspector
                  </Button>
                  <Button size="sm" variant="secondary" className="h-6 px-2 text-[10px] font-mono">
                    Review Satellite NDVI
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Grievance Triage Heatmap"
            subtitle="Farmer Input Appeals & Allocation Disputes"
            badge="[TRIAGE-MAP]"
          />
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-surface-subtle border-[1.5px] border-border rounded-[2px] flex justify-between items-center">
              <div>
                <div className="font-bold text-text-primary">Case #GR-402: Fertilizer Depot Ration Quota Appeal</div>
                <div className="text-text-muted text-[11px]">Kebele 03 Farmer Group • Claiming 15 Q shortfall</div>
              </div>
              <Badge variant="accent">PENDING REVIEW</Badge>
            </div>
            <div className="p-3 bg-surface-subtle border-[1.5px] border-border rounded-[2px] flex justify-between items-center">
              <div>
                <div className="font-bold text-text-primary">Case #GR-399: Plot Boundary Cadastral Overlap</div>
                <div className="text-text-muted text-[11px]">Wonji Woreda • 0.3 Ha dual-registration dispute</div>
              </div>
              <Badge variant="surface">ESCALATED</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
