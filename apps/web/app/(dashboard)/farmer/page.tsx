'use client'

import React, { useState } from 'react'
import { useRoleGuard } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function FarmerPage() {
  const { isAuthorized, isLoading, user } = useRoleGuard(['farmer', 'system_admin'])
  const [activeTab, setActiveTab] = useState<'plots' | 'diagnostics' | 'weather'>('plots')

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 rounded-3xl bg-danger-light border border-danger text-danger text-sm font-mono">
        Access Denied: Your account role does not hold clearance for the Smallholder Farmer Workspace.
      </div>
    )
  }

  const plots = [
    {
      id: 'PLT-01',
      crop: 'Magna Teff (Quncho)',
      area: '1.2 Hectares',
      kebele: 'Adama Kebele 03 (Boku Ridge)',
      soilType: 'Heavy Highland Vertisol',
      moisture: '34% (Optimal)',
      stage: 'Tillering (Day 42)',
      status: 'Optimal Health',
      statusColor: 'success' as const,
    },
    {
      id: 'PLT-02',
      crop: 'Kingbird Durum Wheat',
      area: '0.8 Hectares',
      kebele: 'Adama Kebele 03',
      soilType: 'Clay Loam Silt',
      moisture: '28% (Adequate)',
      stage: 'Vegetative Top-Dressing',
      status: 'Action Due: Urea Top-Dress',
      statusColor: 'accent' as const,
    },
  ]

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-6 px-4 sm:px-6">
      <div className="bg-gradient-to-r from-primary to-primary-hover text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded-full bg-white/20 text-white font-semibold">
                Station Active
              </span>
              <span className="text-xs font-mono text-white/80">
                Woreda: Adama Special Zone
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-mono">
              Welcome, {user?.name || 'Smallholder Farmer'}
            </h1>
            <p className="text-sm text-white/80 mt-1 max-w-xl">
              Connected SIM: {user?.phoneNumber || 'Local Line'}. All plot telemetry synchronized with Adama Extension Hub.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center text-white text-2xl font-bold shadow-md">
              ☀
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-white/80 font-semibold">
                7-Day Decision
              </div>
              <div className="text-lg font-mono font-bold text-white">
                FARM RECOMMENDED
              </div>
              <div className="text-xs text-white/90">
                Optimal Spray Window: Next 48 Hours
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card variant="glass" className="p-4 rounded-2xl bg-white shadow-sm border border-border">
          <div className="text-xs font-mono text-text-muted uppercase">Registered Land</div>
          <div className="text-2xl font-mono font-bold text-text-primary mt-1">2.0 Ha</div>
          <div className="text-[11px] font-mono text-success mt-0.5">2 Active Plots</div>
        </Card>
        <Card variant="glass" className="p-4 rounded-2xl bg-white shadow-sm border border-border">
          <div className="text-xs font-mono text-text-muted uppercase">Soil Moisture</div>
          <div className="text-2xl font-mono font-bold text-text-primary mt-1">31.2%</div>
          <div className="text-[11px] font-mono text-primary mt-0.5">Highland Vertisol</div>
        </Card>
        <Card variant="glass" className="p-4 rounded-2xl bg-white shadow-sm border border-border">
          <div className="text-xs font-mono text-text-muted uppercase">Fertilizer Logged</div>
          <div className="text-2xl font-mono font-bold text-text-primary mt-1">100 kg</div>
          <div className="text-[11px] font-mono text-accent mt-0.5">NPS-Boron Applied</div>
        </Card>
        <Card variant="glass" className="p-4 rounded-2xl bg-white shadow-sm border border-border">
          <div className="text-xs font-mono text-text-muted uppercase">Extension Visit</div>
          <div className="text-2xl font-mono font-bold text-text-primary mt-1">3 Days</div>
          <div className="text-[11px] font-mono text-text-muted mt-0.5">DA Tsegaye Scheduled</div>
        </Card>
      </div>

      <div className="flex gap-2 border-b border-border-subtle pb-2">
        <button
          onClick={() => setActiveTab('plots')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-semibold transition-all cursor-pointer ${
            activeTab === 'plots' ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:bg-surface-subtle'
          }`}
        >
          Active Plots ({plots.length})
        </button>
        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-semibold transition-all cursor-pointer ${
            activeTab === 'diagnostics' ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:bg-surface-subtle'
          }`}
        >
          AI Camera Diagnostics
        </button>
        <button
          onClick={() => setActiveTab('weather')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-semibold transition-all cursor-pointer ${
            activeTab === 'weather' ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:bg-surface-subtle'
          }`}
        >
          Weather & Spray Windows
        </button>
      </div>

      {activeTab === 'plots' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {plots.map((plot) => (
            <Card key={plot.id} variant="elevated" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-primary">{plot.id}</span>
                  <h3 className="text-lg font-bold text-text-primary mt-0.5">{plot.crop}</h3>
                </div>
                <Badge variant={plot.statusColor}>{plot.status}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-surface-subtle p-3.5 rounded-xl border border-border/50">
                <div>
                  <span className="text-text-muted block">Area:</span>
                  <span className="font-semibold text-text-primary">{plot.area}</span>
                </div>
                <div>
                  <span className="text-text-muted block">Soil:</span>
                  <span className="font-semibold text-text-primary">{plot.soilType}</span>
                </div>
                <div>
                  <span className="text-text-muted block">Moisture:</span>
                  <span className="font-semibold text-text-primary">{plot.moisture}</span>
                </div>
                <div>
                  <span className="text-text-muted block">Stage:</span>
                  <span className="font-semibold text-text-primary">{plot.stage}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button variant="outline" size="sm" fullWidth>
                  Log Input / Fertilizer
                </Button>
                <Button variant="primary" size="sm" fullWidth>
                  Field Camera Scan
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'diagnostics' && (
        <Card variant="elevated" className="text-center py-12 px-6">
          <div className="w-16 h-16 rounded-2xl bg-primary-light text-primary flex items-center justify-center text-3xl mx-auto mb-4">
            📷
          </div>
          <h3 className="text-lg font-bold font-mono text-text-primary uppercase">
            Multimodal Crop Leaf Scanner
          </h3>
          <p className="text-xs sm:text-sm text-text-muted max-w-md mx-auto mt-2">
            Capture or upload leaf photography to detect Rust, Blast, Stem Borer, or Nutrient Deficiencies calibrated for Ethiopian highland varieties.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="primary" size="md">
              Launch Mobile Camera
            </Button>
            <Button variant="outline" size="md">
              Upload Sample File
            </Button>
          </div>
        </Card>
      )}

      {activeTab === 'weather' && (
        <Card variant="elevated" className="space-y-4">
          <CardHeader
            title="Adama Micro-Climate Agro-Forecast"
            subtitle="Satellite precipitation, wind shear and solar irradiance"
            badge="METEOROLOGY"
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-surface-subtle border border-border">
              <span className="text-xs font-mono text-text-muted">Today</span>
              <div className="text-xl font-bold font-mono text-text-primary mt-1">26°C / 14°C</div>
              <span className="text-xs font-mono text-success">Low Rain Risk (10%)</span>
            </div>
            <div className="p-4 rounded-xl bg-surface-subtle border border-border">
              <span className="text-xs font-mono text-text-muted">Tomorrow</span>
              <div className="text-xl font-bold font-mono text-text-primary mt-1">25°C / 13°C</div>
              <span className="text-xs font-mono text-success">Spray Feasible</span>
            </div>
            <div className="p-4 rounded-xl bg-surface-subtle border border-border">
              <span className="text-xs font-mono text-text-muted">Day 3</span>
              <div className="text-xl font-bold font-mono text-text-primary mt-1">23°C / 12°C</div>
              <span className="text-xs font-mono text-accent">Scattered Showers (45%)</span>
            </div>
            <div className="p-4 rounded-xl bg-surface-subtle border border-border">
              <span className="text-xs font-mono text-text-muted">Day 4</span>
              <div className="text-xl font-bold font-mono text-text-primary mt-1">22°C / 11°C</div>
              <span className="text-xs font-mono text-danger">Heavy Downpour Alert</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
