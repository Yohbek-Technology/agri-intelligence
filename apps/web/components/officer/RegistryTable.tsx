'use client'

import React from 'react'
import {
  Search,
  Download,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  UserCheck,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import type {
  RegistryFarmerItem,
  RegistrySummaryMetrics,
  RegistryFilterInput,
  KebeleRow,
  StaffRow,
  CropRow,
} from '@repo/shared'

interface RegistryTableProps {
  farmers: RegistryFarmerItem[]
  total: number
  page: number
  limit: number
  totalPages: number
  summary?: RegistrySummaryMetrics
  filters: RegistryFilterInput
  onFilterChange: <K extends keyof RegistryFilterInput>(
    field: K,
    value: RegistryFilterInput[K]
  ) => void
  kebeles: KebeleRow[]
  daStaff: StaffRow[]
  crops: CropRow[]
  selectedFarmerIds: string[]
  onToggleSelect: (id: string) => void
  onSelectAll: (select: boolean) => void
  onInspectFarmer: (farmer: RegistryFarmerItem) => void
  onOpenReassign: (farmerId?: string) => void
  onOpenExport: () => void
  isLoading: boolean
}

export function RegistryTable({
  farmers,
  total,
  page,
  limit,
  totalPages,
  summary,
  filters,
  onFilterChange,
  kebeles,
  daStaff,
  crops,
  selectedFarmerIds,
  onToggleSelect,
  onSelectAll,
  onInspectFarmer,
  onOpenReassign,
  onOpenExport,
  isLoading,
}: RegistryTableProps) {
  const t = useTranslations('Phase2.registry')
  const tDa = useTranslations('Phase2.da')
  const tCommon = useTranslations('Common')

  const allSelected = farmers.length > 0 && selectedFarmerIds.length === farmers.length

  return (
    <div className="space-y-5">
      {/* City-Wide Summary Metrics Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div
            className="p-4 rounded-2xl bg-surface"
            style={{ border: '2px solid var(--color-border-ui)' }}
          >
            <p className="text-[10px] font-mono uppercase text-text-muted">{t('total_farmers')}</p>
            <p className="text-2xl font-bold font-mono text-text-primary mt-1">
              {summary.totalFarmers}
            </p>
            <p className="text-[11px] text-text-faint font-mono mt-0.5">
              {t('self_registered_suffix', { count: summary.selfRegisteredFarmers })}
            </p>
          </div>

          <div
            className="p-4 rounded-2xl bg-surface"
            style={{ border: '2px solid var(--color-border-ui)' }}
          >
            <p className="text-[10px] font-mono uppercase text-text-muted">{t('verified_field_status')}</p>
            <p className="text-2xl font-bold font-mono text-success mt-1">
              {summary.verifiedFarmers}
            </p>
            <p className="text-[11px] text-text-faint font-mono mt-0.5">
              {t('compliance_suffix', {
                pct: summary.totalFarmers ? Math.round((summary.verifiedFarmers / summary.totalFarmers) * 100) : 0,
              })}
            </p>
          </div>

          <div
            className="p-4 rounded-2xl bg-surface"
            style={{ border: '2px solid var(--color-border-ui)' }}
          >
            <p className="text-[10px] font-mono uppercase text-text-muted">{t('registered_parcels')}</p>
            <p className="text-2xl font-bold font-mono text-text-primary mt-1">
              {summary.totalPlots}
            </p>
            <p className="text-[11px] text-text-faint font-mono mt-0.5">{t('georeferenced_plots')}</p>
          </div>

          <div
            className="p-4 rounded-2xl bg-surface"
            style={{ border: '2px solid var(--color-border-ui)' }}
          >
            <p className="text-[10px] font-mono uppercase text-text-muted">{t('total_cultivated_area')}</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold font-mono text-primary">
                {summary.totalCultivatedDisplay}
              </span>
              <span className="text-xs font-mono font-bold uppercase text-primary">
                {summary.displayUnit}
              </span>
            </div>
            <p className="text-[11px] text-text-faint font-mono mt-0.5">
              {t('hectares_approx', { ha: summary.totalCultivatedHectares })}
            </p>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div
        className="p-4 rounded-2xl bg-surface space-y-3"
        style={{ border: '2px solid var(--color-border-ui)' }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Query */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-3 text-text-faint" />
            <input
              type="text"
              value={filters.q ?? ''}
              onChange={(e) => onFilterChange('q', e.target.value)}
              placeholder={t('search_placeholder')}
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-surface-subtle border-2 border-border-ui rounded-xl outline-hidden focus:border-primary font-sans"
            />
          </div>

          {/* Unit Switcher & Export */}
          <div className="flex items-center gap-2.5">
            {/* Customary Unit Switcher */}
            <div className="flex rounded-xl p-1 bg-surface-subtle border-2 border-border-ui">
              {(['hectare', 'timad', 'kert'] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => onFilterChange('unit', u)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                    (filters.unit ?? 'hectare') === u
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onOpenExport}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-subtle hover:bg-surface border-2 border-border-ui text-xs font-mono font-bold uppercase transition-colors cursor-pointer"
            >
              <Download size={14} />
              {t('export_btn')}
            </button>
          </div>
        </div>

        {/* Multi-parameter Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border-ui">
          {/* Kebele Filter */}
          <select
            value={filters.kebeleId ?? ''}
            onChange={(e) => onFilterChange('kebeleId', e.target.value || undefined)}
            className="px-2.5 py-1.5 text-xs bg-surface-subtle border border-border-ui rounded-lg outline-hidden text-text-primary"
          >
            <option value="">{t('all_kebeles')}</option>
            {kebeles.map((k) => (
              <option key={k.id} value={k.id}>
                {k.name}
              </option>
            ))}
          </select>

          {/* DA Staff Filter */}
          <select
            value={filters.assignedDaUserId ?? ''}
            onChange={(e) => onFilterChange('assignedDaUserId', e.target.value || undefined)}
            className="px-2.5 py-1.5 text-xs bg-surface-subtle border border-border-ui rounded-lg outline-hidden text-text-primary"
          >
            <option value="">{t('all_das')}</option>
            {daStaff.map((da) => (
              <option key={da.id} value={da.id}>
                {da.name}
              </option>
            ))}
          </select>

          {/* Crop Filter */}
          <select
            value={filters.cropId ?? ''}
            onChange={(e) => onFilterChange('cropId', e.target.value || undefined)}
            className="px-2.5 py-1.5 text-xs bg-surface-subtle border border-border-ui rounded-lg outline-hidden text-text-primary"
          >
            <option value="">{t('all_crops')}</option>
            {crops.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameEn}
              </option>
            ))}
          </select>

          {/* Verification Status */}
          <select
            value={filters.isVerified ?? 'all'}
            onChange={(e) => onFilterChange('isVerified', e.target.value as any)}
            className="px-2.5 py-1.5 text-xs bg-surface-subtle border border-border-ui rounded-lg outline-hidden text-text-primary"
          >
            <option value="all">{t('all_verification')}</option>
            <option value="true">{t('verified_only')}</option>
            <option value="false">{t('unverified_only')}</option>
          </select>
        </div>
      </div>

      {/* Bulk Action Bar (When rows selected) */}
      {selectedFarmerIds.length > 0 && (
        <div className="p-3 rounded-xl bg-primary-light border-2 border-primary/40 flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-primary">
            {t('selected_count', { count: selectedFarmerIds.length })}
          </span>
          <button
            type="button"
            onClick={() => onOpenReassign()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-mono font-bold uppercase cursor-pointer shadow-xs hover:bg-primary-hover transition-colors"
          >
            <UserCheck size={14} />
            {t('bulk_reassign')}
          </button>
        </div>
      )}

      {/* Table Data */}
      <div
        className="rounded-2xl bg-surface overflow-hidden shadow-xs"
        style={{ border: '2px solid var(--color-border-ui)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-subtle border-b-2 border-border-ui font-mono uppercase text-text-muted">
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => onSelectAll(e.target.checked)}
                    className="rounded-sm text-primary w-4 h-4 cursor-pointer"
                  />
                </th>
                <th className="p-3.5 font-bold">{t('col_farmer')}</th>
                <th className="p-3.5 font-bold">{t('col_kebele')}</th>
                <th className="p-3.5 font-bold">{t('col_da')}</th>
                <th className="p-3.5 font-bold">{t('col_verification')}</th>
                <th className="p-3.5 font-bold text-right">{t('col_parcels')}</th>
                <th className="p-3.5 font-bold text-right">
                  {t('col_area', { unit: filters.unit ?? 'hectare' })}
                </th>
                <th className="p-3.5 font-bold">{t('col_crops')}</th>
                <th className="p-3.5 font-bold text-right">{t('col_actions')}</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border-ui">
              {farmers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-text-faint font-mono">
                    {isLoading ? t('loading_registry') : tCommon('noRecords')}
                  </td>
                </tr>
              ) : (
                farmers.map((farmer) => {
                  const isChecked = selectedFarmerIds.includes(farmer.id)
                  return (
                    <tr
                      key={farmer.id}
                      className={`hover:bg-surface-subtle/50 transition-colors ${
                        isChecked ? 'bg-primary-light/20' : ''
                      }`}
                    >
                      <td className="p-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => onToggleSelect(farmer.id)}
                          className="rounded-sm text-primary w-4 h-4 cursor-pointer"
                        />
                      </td>

                      <td className="p-3.5">
                        <p className="font-bold text-text-primary text-sm font-sans">{farmer.fullName}</p>
                        <p className="text-[11px] font-mono text-text-muted mt-0.5">
                          {farmer.localIdNumber} {farmer.phoneNumber ? `• ${farmer.phoneNumber}` : `• ${tDa('has_no_phone')}`}
                        </p>
                      </td>

                      <td className="p-3.5 font-mono text-text-muted">
                        {farmer.kebeleName}
                      </td>

                      <td className="p-3.5 font-mono text-text-muted">
                        {farmer.assignedDaName ? (
                          <span className="text-text-primary">{farmer.assignedDaName}</span>
                        ) : (
                          <span className="text-text-faint italic">{t('unassigned')}</span>
                        )}
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md border ${
                            farmer.isVerified
                              ? 'bg-success-light text-success border-success/30'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                        >
                          {farmer.isVerified ? (
                            <>
                              <CheckCircle2 size={11} /> {tDa('verified')}
                            </>
                          ) : (
                            <>
                              <Clock size={11} /> {tDa('pending')}
                            </>
                          )}
                        </span>
                      </td>

                      <td className="p-3.5 text-right font-mono font-bold text-text-primary">
                        {farmer.plotsCount}
                      </td>

                      <td className="p-3.5 text-right font-mono font-bold text-primary">
                        {farmer.totalAreaDisplay}
                      </td>

                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {farmer.activeCrops.length > 0 ? (
                            farmer.activeCrops.map((crop, i) => (
                              <span
                                key={i}
                                className="px-1.5 py-0.5 rounded-sm bg-surface-subtle border border-border-ui text-[10px] font-mono text-text-muted"
                              >
                                {crop}
                              </span>
                            ))
                          ) : (
                            <span className="text-text-faint text-[11px] italic">—</span>
                          )}
                        </div>
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenReassign(farmer.id)}
                            className="px-2 py-1 rounded-md text-[11px] font-mono text-text-muted hover:text-text-primary hover:bg-surface-subtle border border-border-ui cursor-pointer"
                          >
                            {t('assign_da_btn')}
                          </button>
                          <button
                            type="button"
                            onClick={() => onInspectFarmer(farmer)}
                            className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold text-primary bg-primary-light hover:bg-primary hover:text-white border border-primary/30 transition-colors cursor-pointer"
                          >
                            {t('inspect_btn')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3.5 bg-surface-subtle border-t-2 border-border-ui flex items-center justify-between text-xs font-mono text-text-muted">
          <span>
            {t('showing_pagination', { page, totalPages: totalPages || 1, total })}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onFilterChange('page', page - 1)}
              className="p-1.5 rounded-lg border border-border-ui bg-white hover:bg-surface-subtle disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onFilterChange('page', page + 1)}
              className="p-1.5 rounded-lg border border-border-ui bg-white hover:bg-surface-subtle disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
