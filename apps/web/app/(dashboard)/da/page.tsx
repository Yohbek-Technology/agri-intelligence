'use client'

import React, { useState, useMemo } from 'react'
import { useRoleGuard } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Notice } from '@/components/ui/notice'

interface SmallholderRecord {
  id: string
  name: string
  phoneNumber: string
  kebele: string
  plotCount: number
  totalAreaHa: number
  primaryCrop: string
  cropStage: string
  healthStatus: 'optimal' | 'warning' | 'critical'
  lastVisited: string
  notes: string
}

interface VisitSchedule {
  id: string
  farmerName: string
  kebele: string
  scheduledTime: string
  purpose: string
  urgency: 'routine' | 'high' | 'urgent'
}

const INITIAL_FARMERS: SmallholderRecord[] = [
  {
    id: 'ETH-AD-01',
    name: 'Abebe Bikila Tadesse',
    phoneNumber: '+251911223344',
    kebele: 'Wonji Gefersa',
    plotCount: 2,
    totalAreaHa: 2.4,
    primaryCrop: 'Magna Teff (Quncho)',
    cropStage: 'Tillering (Day 42)',
    healthStatus: 'optimal',
    lastVisited: '2 days ago',
    notes: 'Vertisol moisture retention at 34%. Pre-emergence herbicide effective.',
  },
  {
    id: 'ETH-AD-02',
    name: 'Chaltu Gemechu Bekele',
    phoneNumber: '+251922334455',
    kebele: 'Boku Ridge 03',
    plotCount: 1,
    totalAreaHa: 1.8,
    primaryCrop: 'Kingbird Durum Wheat',
    cropStage: 'Stem Elongation',
    healthStatus: 'warning',
    lastVisited: 'Yesterday',
    notes: 'Early yellow rust pustules observed on lower foliage. Fungicide scheduled.',
  },
  {
    id: 'ETH-AD-03',
    name: 'Mulugeta Hailemariam',
    phoneNumber: '+251933445566',
    kebele: 'Wonji Gefersa',
    plotCount: 3,
    totalAreaHa: 3.5,
    primaryCrop: 'Highland Maize (BH-660)',
    cropStage: 'Vegetative V6',
    healthStatus: 'critical',
    lastVisited: '5 days ago',
    notes: 'Fall Armyworm whorl damage detected on 18% of plants. Immediate biopesticide needed.',
  },
  {
    id: 'ETH-AD-04',
    name: 'Fatuma Mohammed Kedir',
    phoneNumber: '+251944556677',
    kebele: 'Adama Rural 02',
    plotCount: 1,
    totalAreaHa: 1.2,
    primaryCrop: 'Haricot Bean (Awash-1)',
    cropStage: 'Pod Formation',
    healthStatus: 'optimal',
    lastVisited: '3 days ago',
    notes: 'Rhizobium nodulation robust. Good canopy cover.',
  },
  {
    id: 'ETH-AD-05',
    name: 'Tsegaye Wolde Tensay',
    phoneNumber: '+251955667788',
    kebele: 'Boku Ridge 03',
    plotCount: 2,
    totalAreaHa: 2.1,
    primaryCrop: 'Malt Barley (Traveler)',
    cropStage: 'Grain Filling',
    healthStatus: 'warning',
    lastVisited: '6 days ago',
    notes: 'Minor net blotch symptoms. Soil moisture slightly depleted.',
  },
]

const INITIAL_VISITS: VisitSchedule[] = [
  {
    id: 'VST-101',
    farmerName: 'Mulugeta Hailemariam',
    kebele: 'Wonji Gefersa',
    scheduledTime: 'Today, 09:30 AM',
    purpose: 'Fall Armyworm spray inspection and pheromone trap count',
    urgency: 'urgent',
  },
  {
    id: 'VST-102',
    farmerName: 'Chaltu Gemechu Bekele',
    kebele: 'Boku Ridge 03',
    scheduledTime: 'Today, 02:00 PM',
    purpose: 'Yellow rust fungicide calibration and leaf swab verification',
    urgency: 'high',
  },
  {
    id: 'VST-103',
    farmerName: 'Tsegaye Wolde Tensay',
    kebele: 'Boku Ridge 03',
    scheduledTime: 'Tomorrow, 10:00 AM',
    purpose: 'Soil moisture profile testing & grain fill evaluation',
    urgency: 'routine',
  },
]

export default function DaPage() {
  const { isAuthorized, isLoading, user } = useRoleGuard(['da', 'system_admin'])

  const [activeTab, setActiveTab] = useState<'roster' | 'diagnostic' | 'itinerary'>('roster')
  const [searchQuery, setSearchQuery] = useState('')
  const [kebeleFilter, setKebeleFilter] = useState<string>('all')
  const [healthFilter, setHealthFilter] = useState<string>('all')
  const [farmers, setFarmers] = useState<SmallholderRecord[]>(INITIAL_FARMERS)
  const [visits, setVisits] = useState<VisitSchedule[]>(INITIAL_VISITS)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success'>('idle')

  const [selectedFarmerId, setSelectedFarmerId] = useState<string>(INITIAL_FARMERS[0]?.id || '')
  const [obsCropStage, setObsCropStage] = useState('Tillering')
  const [obsSeverity, setObsSeverity] = useState<'low' | 'moderate' | 'high' | 'severe'>('moderate')
  const [obsSymptoms, setObsSymptoms] = useState('')
  const [obsActionNotice, setObsActionNotice] = useState<string | null>(null)

  const filteredFarmers = useMemo(() => {
    return farmers.filter((farmer) => {
      const matchesSearch =
        farmer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        farmer.phoneNumber.includes(searchQuery) ||
        farmer.primaryCrop.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesKebele = kebeleFilter === 'all' || farmer.kebele === kebeleFilter
      const matchesHealth = healthFilter === 'all' || farmer.healthStatus === healthFilter
      return matchesSearch && matchesKebele && matchesHealth
    })
  }, [farmers, searchQuery, kebeleFilter, healthFilter])

  const handleForceSync = () => {
    setIsSyncing(true)
    setSyncStatus('idle')
    setTimeout(() => {
      setIsSyncing(false)
      setSyncStatus('success')
      setTimeout(() => setSyncStatus('idle'), 4000)
    }, 1200)
  }

  const handleLogObservation = (e: React.FormEvent) => {
    e.preventDefault()
    if (!obsSymptoms.trim()) return

    const targetFarmer = farmers.find((f) => f.id === selectedFarmerId)
    const farmerName = targetFarmer ? targetFarmer.name : 'Farmer'

    setObsActionNotice(
      `Observation filed for ${farmerName}. SMS advisory and prescription queued to ${targetFarmer?.phoneNumber}. Telemetry pushed to Adama Central Repository.`
    )
    setObsSymptoms('')

    setFarmers((prev) =>
      prev.map((f) =>
        f.id === selectedFarmerId
          ? {
              ...f,
              lastVisited: 'Just now',
              notes: `[DA Update] Severity: ${obsSeverity}. ${obsSymptoms.slice(0, 80)}...`,
            }
          : f
      )
    )

    setTimeout(() => setObsActionNotice(null), 6000)
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 rounded-2xl bg-danger-light border border-danger text-danger text-sm font-mono">
        Access Denied: Your account role does not hold clearance for the Development Agent Field Hub.
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-6 px-4 sm:px-6">
      <div className="bg-gradient-to-r from-accent to-[#d97706] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded-full bg-white/20 text-white font-semibold">
                DA Extension Hub
              </span>
              <span className="text-xs font-mono text-white/90">
                Woreda: Adama Special Zone • Kebeles: Wonji Gefersa / Boku Ridge
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-mono">
              Welcome, {user?.name || 'Development Agent'}
            </h1>
            <p className="text-sm text-white/90 mt-1 max-w-2xl">
              Field Extension SIM: {user?.phoneNumber || 'Local Line'}. Monitoring 428 registered smallholders across Highland Vertisol and Loam sectors.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-white/80 font-semibold">
                  Local Offline Cache
                </div>
                <div className="text-xs font-mono font-bold text-white">
                  {syncStatus === 'success' ? 'All 428 Records Synced' : 'Ready (0 Pending)'}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleForceSync}
              isLoading={isSyncing}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm text-xs font-mono"
            >
              Force Field Sync
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card variant="glass" className="p-4 rounded-2xl bg-white shadow-sm border border-border">
          <div className="text-xs font-mono text-text-muted uppercase">Assigned Smallholders</div>
          <div className="text-2xl font-mono font-bold text-text-primary mt-1">428</div>
          <div className="text-[11px] font-mono text-success mt-0.5">Across 4 Kebeles</div>
        </Card>
        <Card variant="glass" className="p-4 rounded-2xl bg-white shadow-sm border border-border">
          <div className="text-xs font-mono text-text-muted uppercase">Visits Today</div>
          <div className="text-2xl font-mono font-bold text-text-primary mt-1">{visits.length}</div>
          <div className="text-[11px] font-mono text-accent mt-0.5">1 Urgent Priority</div>
        </Card>
        <Card variant="glass" className="p-4 rounded-2xl bg-white shadow-sm border border-border">
          <div className="text-xs font-mono text-text-muted uppercase">Pest Flags</div>
          <div className="text-2xl font-mono font-bold text-danger mt-1">2</div>
          <div className="text-[11px] font-mono text-danger mt-0.5">Armyworm & Rust</div>
        </Card>
        <Card variant="glass" className="p-4 rounded-2xl bg-white shadow-sm border border-border">
          <div className="text-xs font-mono text-text-muted uppercase">Mean Soil Nitrogen</div>
          <div className="text-2xl font-mono font-bold text-text-primary mt-1">38.4</div>
          <div className="text-[11px] font-mono text-success mt-0.5">mg/kg (Optimal Range)</div>
        </Card>
      </div>

      <div className="flex border-b border-border space-x-2 sm:space-x-4">
        <button
          onClick={() => setActiveTab('roster')}
          className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-mono font-semibold transition-colors border-b-2 ${
            activeTab === 'roster'
              ? 'border-accent text-accent'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          Farmer Roster & Fields ({filteredFarmers.length})
        </button>
        <button
          onClick={() => setActiveTab('diagnostic')}
          className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-mono font-semibold transition-colors border-b-2 ${
            activeTab === 'diagnostic'
              ? 'border-accent text-accent'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          Field Diagnostic & Advisory Tool
        </button>
        <button
          onClick={() => setActiveTab('itinerary')}
          className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-mono font-semibold transition-colors border-b-2 ${
            activeTab === 'itinerary'
              ? 'border-accent text-accent'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          Scheduled Visits ({visits.length})
        </button>
      </div>

      {activeTab === 'roster' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              id="search-farmers"
              placeholder="Search by farmer name, crop, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
            <div className="flex gap-2">
              <select
                aria-label="Filter by Kebele"
                value={kebeleFilter}
                onChange={(e) => setKebeleFilter(e.target.value)}
                className="w-full h-11 px-3 text-xs font-mono rounded-xl border border-border bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="all">All Kebeles</option>
                <option value="Wonji Gefersa">Wonji Gefersa</option>
                <option value="Boku Ridge 03">Boku Ridge 03</option>
                <option value="Adama Rural 02">Adama Rural 02</option>
              </select>
            </div>
            <div className="flex gap-2">
              <select
                aria-label="Filter by Health Condition"
                value={healthFilter}
                onChange={(e) => setHealthFilter(e.target.value)}
                className="w-full h-11 px-3 text-xs font-mono rounded-xl border border-border bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="all">All Health Conditions</option>
                <option value="optimal">Optimal Condition</option>
                <option value="warning">Watchlist / Treatment Due</option>
                <option value="critical">Critical Incursion</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFarmers.map((farmer) => (
              <Card
                key={farmer.id}
                variant="elevated"
                className="p-5 rounded-2xl bg-white border border-border shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-bold text-text-primary text-base font-mono">{farmer.name}</h3>
                      <div className="text-xs text-text-muted font-mono">{farmer.phoneNumber}</div>
                    </div>
                    <Badge
                      variant={
                        farmer.healthStatus === 'optimal'
                          ? 'success'
                          : farmer.healthStatus === 'warning'
                          ? 'warning'
                          : 'danger'
                      }
                      size="sm"
                    >
                      {farmer.healthStatus.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="bg-surface p-3 rounded-xl space-y-1.5 text-xs font-mono mb-4 border border-border/50">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Kebele:</span>
                      <span className="font-semibold text-text-primary">{farmer.kebele}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Plots / Area:</span>
                      <span className="font-semibold text-text-primary">
                        {farmer.plotCount} plots ({farmer.totalAreaHa} Ha)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Crop / Stage:</span>
                      <span className="font-semibold text-accent">{farmer.primaryCrop}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Last Visited:</span>
                      <span className="text-text-primary">{farmer.lastVisited}</span>
                    </div>
                  </div>

                  <div className="text-xs text-text-muted bg-surface/50 p-2.5 rounded-lg border border-border/40 mb-4 line-clamp-2">
                    <span className="font-semibold text-text-primary">Observation:</span> {farmer.notes}
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-border/50">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs font-mono"
                    onClick={() => {
                      setSelectedFarmerId(farmer.id)
                      setActiveTab('diagnostic')
                    }}
                  >
                    Examine
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1 text-xs font-mono"
                    onClick={() => {
                      alert(`Direct call initiated to ${farmer.name} (${farmer.phoneNumber}) via Telebirr voice bridge.`)
                    }}
                  >
                    Call Farmer
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'diagnostic' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 rounded-2xl bg-white border border-border shadow-sm">
              <CardHeader
                title="Log Field Agronomic Observation & Issue Prescription"
                subtitle="Telemetry and advisory notes are instantaneously broadcast to smallholder via SMS gateway in Afaan Oromoo / Amharic"
              />

              {obsActionNotice && (
                <div className="mb-4">
                  <Notice type="success" message={obsActionNotice} />
                </div>
              )}

              <form onSubmit={handleLogObservation} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="diag-farmer" className="block text-xs font-mono uppercase text-text-muted font-semibold mb-1">
                      Target Smallholder
                    </label>
                    <select
                      id="diag-farmer"
                      value={selectedFarmerId}
                      onChange={(e) => setSelectedFarmerId(e.target.value)}
                      className="w-full h-11 px-3 text-xs font-mono rounded-xl border border-border bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      {farmers.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name} — {f.primaryCrop} ({f.kebele})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="diag-stage" className="block text-xs font-mono uppercase text-text-muted font-semibold mb-1">
                      Phenological Stage
                    </label>
                    <select
                      id="diag-stage"
                      value={obsCropStage}
                      onChange={(e) => setObsCropStage(e.target.value)}
                      className="w-full h-11 px-3 text-xs font-mono rounded-xl border border-border bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      <option value="Emergence">Emergence & Seedling</option>
                      <option value="Tillering">Tillering / Early Vegetative</option>
                      <option value="Stem Elongation">Stem Elongation & Jointing</option>
                      <option value="Booting">Booting & Heading</option>
                      <option value="Flowering">Anthesis & Flowering</option>
                      <option value="Grain Filling">Grain Filling & Milk Stage</option>
                      <option value="Maturity">Physiological Maturity / Harvest</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="diag-severity" className="block text-xs font-mono uppercase text-text-muted font-semibold mb-1">
                    Pathogen / Incursion Severity
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['low', 'moderate', 'high', 'severe'] as const).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setObsSeverity(level)}
                        className={`h-10 rounded-xl text-xs font-mono uppercase font-semibold border transition-all ${
                          obsSeverity === level
                            ? level === 'severe'
                              ? 'bg-danger text-white border-danger shadow-md'
                              : level === 'high'
                              ? 'bg-amber-600 text-white border-amber-600 shadow-md'
                              : level === 'moderate'
                              ? 'bg-accent text-white border-accent shadow-md'
                              : 'bg-primary text-white border-primary shadow-md'
                            : 'bg-surface text-text-muted border-border hover:bg-white'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="diag-symptoms" className="block text-xs font-mono uppercase text-text-muted font-semibold mb-1">
                    Agronomic Symptoms, Pest Identification & Treatment Prescription
                  </label>
                  <textarea
                    id="diag-symptoms"
                    rows={4}
                    value={obsSymptoms}
                    onChange={(e) => setObsSymptoms(e.target.value)}
                    placeholder="E.g., Puccinia striiformis (Yellow rust) spotted on flag leaf. Prescribed Tilt 250 EC (Propiconazole) at 0.5 L/ha spray volume with 200L water..."
                    className="w-full p-3 text-xs font-mono rounded-xl border border-border bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    className="bg-accent hover:bg-accent-hover text-white font-mono text-xs px-6"
                  >
                    Commit Observation & Dispatch SMS
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="p-5 rounded-2xl bg-white border border-border shadow-sm">
              <h3 className="font-mono font-bold text-sm text-text-primary mb-3">
                Adama Agro-Ecological Advisories
              </h3>
              <div className="space-y-3 text-xs font-mono text-text-muted">
                <div className="p-3 rounded-xl bg-surface border border-border/60">
                  <div className="font-bold text-accent mb-1">Vertisol Water Management</div>
                  Broad bed and furrow (BBF) systems recommended to drain waterlogging caused by heavy Kiremt precipitation.
                </div>
                <div className="p-3 rounded-xl bg-surface border border-border/60">
                  <div className="font-bold text-success mb-1">Urea Split Application</div>
                  Apply second dose of Urea (50 kg/ha) exactly 40 days after Teff emergence under moist soil condition.
                </div>
                <div className="p-3 rounded-xl bg-surface border border-border/60">
                  <div className="font-bold text-danger mb-1">Yellow Rust Hotspot Alert</div>
                  Winds originating from Arsi Highlands elevating fungal spore pressure in eastern Adama kebeles.
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'itinerary' && (
        <Card className="p-6 rounded-2xl bg-white border border-border shadow-sm">
          <CardHeader
            title="Scheduled Field Visits & GPS Waypoints"
            subtitle="Prioritized route optimized for minimal travel time across Adama kebele rural corridors"
          />

          <div className="divide-y divide-border/60">
            {visits.map((visit) => (
              <div key={visit.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-text-primary text-sm">{visit.farmerName}</span>
                    <Badge
                      variant={
                        visit.urgency === 'urgent'
                          ? 'danger'
                          : visit.urgency === 'high'
                          ? 'warning'
                          : 'default'
                      }
                      size="sm"
                    >
                      {visit.urgency.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-xs font-mono text-text-muted">
                    Kebele: <span className="font-semibold text-text-primary">{visit.kebele}</span> • Scheduled:{' '}
                    <span className="font-semibold text-accent">{visit.scheduledTime}</span>
                  </div>
                  <p className="text-xs text-text-primary mt-1">{visit.purpose}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs font-mono"
                    onClick={() => {
                      alert(`GPS navigation launched for ${visit.farmerName} plot in ${visit.kebele}.`)
                    }}
                  >
                    Open Waypoint
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="text-xs font-mono bg-accent hover:bg-accent-hover"
                    onClick={() => {
                      setVisits((prev) => prev.filter((v) => v.id !== visit.id))
                    }}
                  >
                    Mark Completed
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
