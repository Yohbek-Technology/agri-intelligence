'use client'

import React, { useState } from 'react'
import { useRoleGuard } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Notice } from '@/components/ui/notice'

interface KebeleMetric {
  kebele: string
  farmersCount: number
  totalHa: number
  dominantCrop: string
  pestStatus: 'nominal' | 'alert' | 'critical'
  fertilizerDispatchedPct: number
}

interface DepotItem {
  id: string
  item: string
  category: 'Fertilizer' | 'Certified Seed' | 'Crop Protection'
  stockQuintals: number
  dispatchedQuintals: number
  depotLocation: string
  status: 'optimal' | 'low' | 'depleted'
}

const KEBELE_DATA: KebeleMetric[] = [
  {
    kebele: 'Wonji Gefersa 01',
    farmersCount: 640,
    totalHa: 2450,
    dominantCrop: 'Magna Teff (Quncho)',
    pestStatus: 'alert',
    fertilizerDispatchedPct: 88,
  },
  {
    kebele: 'Boku Ridge 03',
    farmersCount: 512,
    totalHa: 1980,
    dominantCrop: 'Kingbird Durum Wheat',
    pestStatus: 'alert',
    fertilizerDispatchedPct: 92,
  },
  {
    kebele: 'Adama Rural 02',
    farmersCount: 420,
    totalHa: 1640,
    dominantCrop: 'Haricot Bean & Chickpea',
    pestStatus: 'nominal',
    fertilizerDispatchedPct: 79,
  },
  {
    kebele: 'Melka Hida 04',
    farmersCount: 780,
    totalHa: 3120,
    dominantCrop: 'Highland Maize (BH-660)',
    pestStatus: 'critical',
    fertilizerDispatchedPct: 85,
  },
  {
    kebele: 'Daka Hora 05',
    farmersCount: 390,
    totalHa: 1450,
    dominantCrop: 'Malt Barley (Traveler)',
    pestStatus: 'nominal',
    fertilizerDispatchedPct: 94,
  },
]

const DEPOT_INVENTORY: DepotItem[] = [
  {
    id: 'DPT-01',
    item: 'NPSB Complex Compound Fertilizer',
    category: 'Fertilizer',
    stockQuintals: 1400,
    dispatchedQuintals: 1180,
    depotLocation: 'Adama Central Strategic Depot (Boku)',
    status: 'optimal',
  },
  {
    id: 'DPT-02',
    item: 'Granular Urea 46% Nitrogen',
    category: 'Fertilizer',
    stockQuintals: 2200,
    dispatchedQuintals: 1920,
    depotLocation: 'Adama Central Strategic Depot (Boku)',
    status: 'low',
  },
  {
    id: 'DPT-03',
    item: 'Quncho DZ-Cr-37 Certified Teff Seed',
    category: 'Certified Seed',
    stockQuintals: 450,
    dispatchedQuintals: 410,
    depotLocation: 'Wonji Cooperative Union Warehouse',
    status: 'low',
  },
  {
    id: 'DPT-04',
    item: 'Tilt 250 EC (Propiconazole Fungicide)',
    category: 'Crop Protection',
    stockQuintals: 120,
    dispatchedQuintals: 65,
    depotLocation: 'Oromia Regional Quarantine Depot',
    status: 'optimal',
  },
]

export default function OfficerPage() {
  const { isAuthorized, isLoading, user } = useRoleGuard(['officer', 'system_admin'])

  const [activeTab, setActiveTab] = useState<'overview' | 'depot' | 'broadcast'>('overview')
  const [broadcastKebele, setBroadcastKebele] = useState('ALL')
  const [broadcastLanguage, setBroadcastLanguage] = useState<'or' | 'am' | 'en'>('or')
  const [broadcastMessage, setBroadcastMessage] = useState('')
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false)
  const [broadcastResult, setBroadcastResult] = useState<string | null>(null)

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault()
    if (!broadcastMessage.trim()) return

    setIsSendingBroadcast(true)
    setTimeout(() => {
      setIsSendingBroadcast(false)
      const recipientCount = broadcastKebele === 'ALL' ? '4,812 Smallholders' : '640 Smallholders'
      setBroadcastResult(
        `Emergency SMS transmission authorized: Dispatched to ${recipientCount} across ${broadcastKebele} via Africa's Talking Gateway.`
      )
      setBroadcastMessage('')
      setTimeout(() => setBroadcastResult(null), 8000)
    }, 1500)
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-4 border-success border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 rounded-2xl bg-danger-light border border-danger text-danger text-sm font-mono">
        Access Denied: Your account role does not hold clearance for the City Agriculture Office Governance Desk.
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-6 px-4 sm:px-6">
      <div className="bg-gradient-to-r from-success-dark via-primary to-success text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded-full bg-white/20 text-white font-semibold">
                Municipal Governance Command
              </span>
              <span className="text-xs font-mono text-white/90">
                Adama City Administration • Bureau of Agriculture & Natural Resources
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-mono">
              Welcome, {user?.name || 'Chief Agricultural Officer'}
            </h1>
            <p className="text-sm text-white/90 mt-1 max-w-2xl">
              Command SIM: {user?.phoneNumber || 'Admin Console'}. Overseeing 14 Kebeles, 4,812 Smallholders, and Strategic Input Reserves.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('broadcast')}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm text-xs font-mono"
            >
              Dispatch Emergency SMS
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => alert('Generating Comprehensive Adama Municipal Yield & Input Distribution Audit Report (PDF)...')}
              className="bg-white text-primary hover:bg-white/90 font-mono text-xs shadow-md"
            >
              Export Season Audit
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card variant="glass" className="p-4 rounded-2xl bg-white shadow-sm border border-border">
          <div className="text-xs font-mono text-text-muted uppercase">Monitored Farmland</div>
          <div className="text-2xl font-mono font-bold text-text-primary mt-1">18,420 Ha</div>
          <div className="text-[11px] font-mono text-success mt-0.5">14 Woreda Kebeles</div>
        </Card>
        <Card variant="glass" className="p-4 rounded-2xl bg-white shadow-sm border border-border">
          <div className="text-xs font-mono text-text-muted uppercase">Active Smallholders</div>
          <div className="text-2xl font-mono font-bold text-text-primary mt-1">4,812</div>
          <div className="text-[11px] font-mono text-success mt-0.5">100% SIM-Registered</div>
        </Card>
        <Card variant="glass" className="p-4 rounded-2xl bg-white shadow-sm border border-border">
          <div className="text-xs font-mono text-text-muted uppercase">Fertilizer Dispatched</div>
          <div className="text-2xl font-mono font-bold text-primary mt-1">87.6%</div>
          <div className="text-[11px] font-mono text-text-muted mt-0.5">3,100 / 3,600 Qtl</div>
        </Card>
        <Card variant="glass" className="p-4 rounded-2xl bg-white shadow-sm border border-border">
          <div className="text-xs font-mono text-text-muted uppercase">Quarantine Incursions</div>
          <div className="text-2xl font-mono font-bold text-danger mt-1">1 Zone</div>
          <div className="text-[11px] font-mono text-danger mt-0.5">Melka Hida Armyworm</div>
        </Card>
      </div>

      <div className="flex border-b border-border space-x-2 sm:space-x-4">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-mono font-semibold transition-colors border-b-2 ${
            activeTab === 'overview'
              ? 'border-success text-success-dark'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          Kebele Agricultural Aggregates
        </button>
        <button
          onClick={() => setActiveTab('depot')}
          className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-mono font-semibold transition-colors border-b-2 ${
            activeTab === 'depot'
              ? 'border-success text-success-dark'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          Depot Fertilizer & Seed Logistics
        </button>
        <button
          onClick={() => setActiveTab('broadcast')}
          className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-mono font-semibold transition-colors border-b-2 ${
            activeTab === 'broadcast'
              ? 'border-success text-success-dark'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          Emergency SMS Broadcast Desk
        </button>
      </div>

      {activeTab === 'overview' && (
        <Card className="p-6 rounded-2xl bg-white border border-border shadow-sm">
          <CardHeader
            title="Kebele-Level Production & Pest Surveillance Matrix"
            subtitle="Real-time crop stage aggregation and quarantine status across the Adama agricultural belt"
          />

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-border text-text-muted uppercase">
                  <th className="pb-3 font-semibold">Kebele Sector</th>
                  <th className="pb-3 font-semibold">Smallholders</th>
                  <th className="pb-3 font-semibold">Total Area</th>
                  <th className="pb-3 font-semibold">Dominant Cultivar</th>
                  <th className="pb-3 font-semibold">Pest Status</th>
                  <th className="pb-3 font-semibold">Input Allocation</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {KEBELE_DATA.map((k) => (
                  <tr key={k.kebele} className="hover:bg-surface/50 transition-colors">
                    <td className="py-3.5 font-bold text-text-primary">{k.kebele}</td>
                    <td className="py-3.5 text-text-primary">{k.farmersCount}</td>
                    <td className="py-3.5 text-text-primary">{k.totalHa} Ha</td>
                    <td className="py-3.5 text-primary font-medium">{k.dominantCrop}</td>
                    <td className="py-3.5">
                      <Badge
                        variant={
                          k.pestStatus === 'nominal'
                            ? 'success'
                            : k.pestStatus === 'alert'
                            ? 'warning'
                            : 'danger'
                        }
                        size="sm"
                      >
                        {k.pestStatus.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-surface rounded-full h-2 overflow-hidden border border-border/60">
                          <div
                            className="bg-success h-full rounded-full"
                            style={{ width: `${k.fertilizerDispatchedPct}%` }}
                          />
                        </div>
                        <span className="text-text-muted">{k.fertilizerDispatchedPct}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[11px] font-mono h-7 px-2.5"
                        onClick={() => {
                          setBroadcastKebele(k.kebele)
                          setActiveTab('broadcast')
                        }}
                      >
                        Target Alert
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'depot' && (
        <Card className="p-6 rounded-2xl bg-white border border-border shadow-sm">
          <CardHeader
            title="Strategic Fertilizer & Certified Seed Reserves"
            subtitle="Adama Agricultural Union storage ledger tracking seasonal quota distribution"
          />

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-border text-text-muted uppercase">
                  <th className="pb-3 font-semibold">Agricultural Input</th>
                  <th className="pb-3 font-semibold">Classification</th>
                  <th className="pb-3 font-semibold">Total Stock</th>
                  <th className="pb-3 font-semibold">Dispatched</th>
                  <th className="pb-3 font-semibold">Available</th>
                  <th className="pb-3 font-semibold">Storage Hub</th>
                  <th className="pb-3 font-semibold text-right">Reserve State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {DEPOT_INVENTORY.map((d) => {
                  const available = d.stockQuintals - d.dispatchedQuintals
                  return (
                    <tr key={d.id} className="hover:bg-surface/50 transition-colors">
                      <td className="py-3.5 font-bold text-text-primary">{d.item}</td>
                      <td className="py-3.5 text-text-muted">{d.category}</td>
                      <td className="py-3.5 text-text-primary">{d.stockQuintals} Qtl</td>
                      <td className="py-3.5 text-text-primary">{d.dispatchedQuintals} Qtl</td>
                      <td className="py-3.5 font-bold text-primary">{available} Qtl</td>
                      <td className="py-3.5 text-text-muted">{d.depotLocation}</td>
                      <td className="py-3.5 text-right">
                        <Badge
                          variant={d.status === 'optimal' ? 'success' : 'warning'}
                          size="sm"
                        >
                          {d.status === 'optimal' ? 'ADEQUATE' : 'REORDER POINT'}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'broadcast' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6 rounded-2xl bg-white border border-border shadow-sm">
              <CardHeader
                title="Emergency Agro-Climatic & Biosecurity SMS Gateway"
                subtitle="High-priority alerts delivered directly to feature phones via Africa's Talking SMS infrastructure"
              />

              {broadcastResult && (
                <div className="mb-4">
                  <Notice type="success" message={broadcastResult} />
                </div>
              )}

              <form onSubmit={handleSendBroadcast} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="broadcast-kebele-select" className="block text-xs font-mono uppercase text-text-muted font-semibold mb-1">
                      Target Sector
                    </label>
                    <select
                      id="broadcast-kebele-select"
                      value={broadcastKebele}
                      onChange={(e) => setBroadcastKebele(e.target.value)}
                      className="w-full h-11 px-3 text-xs font-mono rounded-xl border border-border bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-success"
                    >
                      <option value="ALL">Entire Adama Woreda (All 14 Kebeles - 4,812 Smallholders)</option>
                      <option value="Wonji Gefersa 01">Wonji Gefersa 01 (640 Farmers)</option>
                      <option value="Boku Ridge 03">Boku Ridge 03 (512 Farmers)</option>
                      <option value="Melka Hida 04">Melka Hida 04 (780 Farmers)</option>
                      <option value="Adama Rural 02">Adama Rural 02 (420 Farmers)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="broadcast-lang-select" className="block text-xs font-mono uppercase text-text-muted font-semibold mb-1">
                      Broadcast Language
                    </label>
                    <select
                      id="broadcast-lang-select"
                      value={broadcastLanguage}
                      onChange={(e) => setBroadcastLanguage(e.target.value as 'or' | 'am' | 'en')}
                      className="w-full h-11 px-3 text-xs font-mono rounded-xl border border-border bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-success"
                    >
                      <option value="or">Afaan Oromoo (Primary Highland Regional)</option>
                      <option value="am">Amharic (Federal Working Language)</option>
                      <option value="en">English (Official Archival)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="broadcast-text" className="text-xs font-mono uppercase text-text-muted font-semibold">
                      Advisory Transmission Message
                    </label>
                    <span className="text-[11px] font-mono text-text-muted">
                      {broadcastMessage.length} / 160 Characters (1 SMS Segment)
                    </span>
                  </div>
                  <textarea
                    id="broadcast-text"
                    rows={4}
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    placeholder="E.g., Hubachiisa: Rooba cimaan sa'aatii 48 keessatti waan eegamuuf bo'oo dhangala'aa bishaanii vertisol irratti qopheessaa. Qorichi biifamuu hin qabu."
                    className="w-full p-3 text-xs font-mono rounded-xl border border-border bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-success resize-none"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSendingBroadcast}
                    className="bg-success-dark hover:bg-success text-white font-mono text-xs px-6"
                  >
                    Authorize & Dispatch Emergency Broadcast
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="p-5 rounded-2xl bg-white border border-border shadow-sm">
              <h3 className="font-mono font-bold text-sm text-text-primary mb-3">
                Pre-Approved Emergency Templates
              </h3>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() =>
                    setBroadcastMessage(
                      'Rooba cimaa fi dambalii bishaanii waan eegamuuf qotiyyootti fayyadamuun bo\'oo dhangala\'aa qopheessaa.'
                    )
                  }
                  className="w-full text-left p-3 rounded-xl bg-surface hover:bg-surface-hover border border-border/60 text-xs font-mono transition-colors"
                >
                  <div className="font-bold text-accent mb-0.5">Heavy Rain & Waterlogging (OR)</div>
                  <div className="text-text-muted line-clamp-1">
                    Rooba cimaa fi dambalii bishaanii waan eegamuuf...
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setBroadcastMessage(
                      'Akeekkachiisa Dhibee: Waagii keelloo (Yellow Rust) bakka tokko tokkotti waan mul\'ateef biifama Tilt 250 EC hatattamaan raawwadhaa.'
                    )
                  }
                  className="w-full text-left p-3 rounded-xl bg-surface hover:bg-surface-hover border border-border/60 text-xs font-mono transition-colors"
                >
                  <div className="font-bold text-danger mb-0.5">Yellow Rust Outbreak (OR)</div>
                  <div className="text-text-muted line-clamp-1">
                    Akeekkachiisa Dhibee: Waagii keelloo hatattamaan...
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setBroadcastMessage(
                      'ማሳሰቢያ፡ ሁለተኛው የዩሪያ ማዳበሪያ ድልድል በአዳማ ማዕከላዊ መጋዘን በመሰራጨት ላይ ስለሆነ በህብረት ስራ ማህበራችሁ በኩል ውሰዱ።'
                    )
                  }
                  className="w-full text-left p-3 rounded-xl bg-surface hover:bg-surface-hover border border-border/60 text-xs font-mono transition-colors"
                >
                  <div className="font-bold text-success mb-0.5">Urea Distribution Batch 2 (AM)</div>
                  <div className="text-text-muted line-clamp-1">
                    ሁለተኛው የዩሪያ ማዳበሪያ ድልድል በመሰራጨት ላይ ስለሆነ...
                  </div>
                </button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
