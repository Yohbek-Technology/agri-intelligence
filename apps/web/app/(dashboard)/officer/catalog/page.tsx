'use client'

import { useState } from 'react'
import {
  useCrops, useCreateCrop, useUpdateCrop,
  useVarieties, useCreateVariety, useUpdateVariety,
  useFertilizerRates, useUpsertFertilizerRate,
  usePests, useCreatePest, useUpdatePest,
  useChemicals, useCreateChemical, useUpdateChemical, useRetireChemical,
} from '@/hooks/useCatalog'
import type { CropRow, VarietyRow, FertilizerRateRow, PestRow, ChemicalRow, AgroZone } from '@repo/shared'

type Tab = 'crops' | 'varieties' | 'fertilizer' | 'pests' | 'chemicals'

const TABS: { id: Tab; label: string }[] = [
  { id: 'crops',      label: 'Crops' },
  { id: 'varieties',  label: 'Varieties' },
  { id: 'fertilizer', label: 'Fertilizer Rates' },
  { id: 'pests',      label: 'Pests & Diseases' },
  { id: 'chemicals',  label: 'Chemicals' },
]

const ZONES: AgroZone[] = ['kolla', 'weyna_dega', 'dega']

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
      status === 'active'
        ? 'bg-success-light text-success'
        : 'bg-surface-subtle text-text-faint'
    }`}>
      {status}
    </span>
  )
}

function TableEmpty({ label }: { label: string }) {
  return (
    <tr>
      <td colSpan={99} className="px-4 py-8 text-center text-sm text-text-faint">
        No {label} found.
      </td>
    </tr>
  )
}

export default function CatalogPage() {
  const [activeTab, setActiveTab] = useState<Tab>('crops')
  const [selectedCropId, setSelectedCropId] = useState<string>('')
  const [retireTarget, setRetireTarget] = useState<string | null>(null)

  const crops          = useCrops()
  const createCrop     = useCreateCrop()
  const updateCrop     = useUpdateCrop()
  const varieties      = useVarieties(selectedCropId || undefined)
  const createVariety  = useCreateVariety()
  const updateVariety  = useUpdateVariety()
  const fertRates      = useFertilizerRates()
  const upsertRate     = useUpsertFertilizerRate()
  const pests          = usePests()
  const createPest     = useCreatePest()
  const updatePest     = useUpdatePest()
  const chemicals      = useChemicals()
  const createChemical = useCreateChemical()
  const updateChemical = useUpdateChemical()
  const retireChemical = useRetireChemical()

  const cropList     = (crops.data ?? []) as CropRow[]
  const varietyList  = (varieties.data ?? []) as VarietyRow[]
  const rateList     = (fertRates.data ?? []) as FertilizerRateRow[]
  const pestList     = (pests.data ?? []) as PestRow[]
  const chemicalList = (chemicals.data ?? []) as ChemicalRow[]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Agricultural Catalog</h1>
        <p className="text-sm text-text-muted mt-1">
          Manage approved crops, varieties, fertilizer rates, pests, and registered chemicals.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 cursor-pointer transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── CROPS ─────────────────────────────────────── */}
      {activeTab === 'crops' && (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-base font-semibold text-text-primary">Crops</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-subtle">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Name (EN)</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Max Yield (Qt/Ha)</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {crops.isLoading
                  ? <TableEmpty label="crops" />
                  : cropList.length === 0
                  ? <TableEmpty label="crops" />
                  : cropList.map((c) => (
                    <tr key={c.id} className="hover:bg-surface-subtle">
                      <td className="px-4 py-3 font-mono text-xs text-text-muted">{c.code}</td>
                      <td className="px-4 py-3 font-medium text-text-primary">{c.nameEn}</td>
                      <td className="px-4 py-3 text-text-muted">{c.maxPlausibleYieldQtPerHa}</td>
                      <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
          {createCrop.error && (
            <p className="px-5 py-3 text-sm text-danger">{createCrop.error.message}</p>
          )}
        </div>
      )}

      {/* ── VARIETIES ─────────────────────────────────── */}
      {activeTab === 'varieties' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-text-primary">Filter by crop:</label>
            <select
              value={selectedCropId}
              onChange={(e) => setSelectedCropId(e.target.value)}
              className="text-sm border border-border rounded-lg px-3 py-2 bg-surface text-text-primary"
            >
              <option value="">All crops</option>
              {cropList.map((c) => (
                <option key={c.id} value={c.id}>{c.nameEn}</option>
              ))}
            </select>
          </div>
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-subtle">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Certified</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Zones</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {varieties.isLoading
                    ? <TableEmpty label="varieties" />
                    : varietyList.length === 0
                    ? <TableEmpty label="varieties" />
                    : varietyList.map((v) => (
                      <tr key={v.id} className="hover:bg-surface-subtle">
                        <td className="px-4 py-3 font-medium text-text-primary">{v.name}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium ${v.isCertified ? 'text-success' : 'text-text-faint'}`}>
                            {v.isCertified ? 'Certified' : 'Local'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-text-muted text-xs">{v.permittedZones.join(', ')}</td>
                        <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── FERTILIZER RATES ──────────────────────────── */}
      {activeTab === 'fertilizer' && (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-subtle">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Crop</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Zone</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Urea (kg/ha)</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">NPS (kg/ha)</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Seed (kg/ha)</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Effective From</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Version</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {fertRates.isLoading
                  ? <TableEmpty label="fertilizer rates" />
                  : rateList.length === 0
                  ? <TableEmpty label="fertilizer rates" />
                  : rateList.map((r) => {
                    const cropName = cropList.find((c) => c.id === r.cropId)?.nameEn ?? r.cropId
                    return (
                      <tr key={r.id} className="hover:bg-surface-subtle">
                        <td className="px-4 py-3 text-text-primary">{cropName}</td>
                        <td className="px-4 py-3 text-text-muted capitalize">{r.agroZone.replace('_', ' ')}</td>
                        <td className="px-4 py-3 font-mono text-text-primary">{r.ureaKgPerHa}</td>
                        <td className="px-4 py-3 font-mono text-text-primary">{r.npsKgPerHa}</td>
                        <td className="px-4 py-3 font-mono text-text-primary">{r.seedKgPerHa}</td>
                        <td className="px-4 py-3 text-text-muted">{r.effectiveFrom}</td>
                        <td className="px-4 py-3 font-mono text-text-faint text-xs">v{r.ratesVersion}</td>
                      </tr>
                    )
                  })
                }
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── PESTS ─────────────────────────────────────── */}
      {activeTab === 'pests' && (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-subtle">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Name (EN)</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Kind</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Quarantine</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {pests.isLoading
                  ? <TableEmpty label="pests" />
                  : pestList.length === 0
                  ? <TableEmpty label="pests" />
                  : pestList.map((p) => (
                    <tr key={p.id} className="hover:bg-surface-subtle">
                      <td className="px-4 py-3 font-mono text-xs text-text-muted">{p.code}</td>
                      <td className="px-4 py-3 font-medium text-text-primary">
                        {typeof p.name === 'object' && p.name !== null
                          ? (p.name as Record<string, string>).en ?? ''
                          : String(p.name)}
                      </td>
                      <td className="px-4 py-3 capitalize text-text-muted">{p.kind}</td>
                      <td className="px-4 py-3">
                        {p.isQuarantinePest && (
                          <span className="text-xs font-medium text-danger">⚠ Quarantine</span>
                        )}
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── CHEMICALS ─────────────────────────────────── */}
      {activeTab === 'chemicals' && (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-subtle">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Brand</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Active Ingredient</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">PHI (days)</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {chemicals.isLoading
                  ? <TableEmpty label="chemicals" />
                  : chemicalList.length === 0
                  ? <TableEmpty label="chemicals" />
                  : chemicalList.map((ch) => (
                    <tr key={ch.id} className="hover:bg-surface-subtle">
                      <td className="px-4 py-3 font-medium text-text-primary">{ch.brandName}</td>
                      <td className="px-4 py-3 text-text-muted text-xs">{ch.activeIngredient}</td>
                      <td className="px-4 py-3 capitalize text-text-muted">{ch.category}</td>
                      <td className="px-4 py-3 font-mono text-text-muted">{ch.safetyIntervalDays}d</td>
                      <td className="px-4 py-3"><StatusBadge status={ch.status} /></td>
                      <td className="px-4 py-3">
                        {ch.status === 'active' && (
                          <button
                            type="button"
                            onClick={() => setRetireTarget(ch.id)}
                            className="text-xs font-medium text-danger hover:underline cursor-pointer"
                          >
                            Retire
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Retire confirmation */}
      {retireTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-text-primary">Retire Chemical?</h3>
            <p className="text-sm text-text-muted">
              This will immediately remove the chemical from the diagnosis safety filter. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setRetireTarget(null)}
                className="px-4 py-2 text-sm font-medium text-text-muted border border-border rounded-xl cursor-pointer hover:bg-surface-subtle"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={retireChemical.isPending}
                onClick={() => {
                  retireChemical.mutate(retireTarget, {
                    onSuccess: () => setRetireTarget(null),
                  })
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-danger rounded-xl cursor-pointer hover:bg-danger-subtle disabled:opacity-50"
              >
                {retireChemical.isPending ? 'Retiring…' : 'Retire'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
