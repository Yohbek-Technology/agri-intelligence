'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { useRoleGuard } from '@/hooks/useAuth'
import { useMunicipalRegistry } from '@/hooks/useMunicipalRegistry'
import { RegistryTable } from '@/components/officer/RegistryTable'
import { FarmerDetailDrawer } from '@/components/officer/FarmerDetailDrawer'
import { ReassignDaModal } from '@/components/officer/ReassignDaModal'
import { RegistryExportModal } from '@/components/officer/RegistryExportModal'

export default function OfficerFarmersRegistryPage() {
  const t = useTranslations('Phase2.registry')
  const { isAuthorized, isLoading: authLoading } = useRoleGuard(['officer', 'system_admin'])

  const {
    farmers,
    total,
    page,
    limit,
    totalPages,
    summary,
    registryLoading,
    filters,
    setFilterField,
    kebeles,
    daStaff,
    crops,
    selectedFarmerIds,
    handleToggleSelectFarmer,
    handleSelectAll,
    detailFarmer,
    setDetailFarmer,
    exportModalOpen,
    setExportModalOpen,
    reassignModalOpen,
    setReassignModalOpen,
    setReassignTargetFarmerId,
    handleExport,
    isExporting,
    handleReassign,
    isReassigning,
  } = useMunicipalRegistry()

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="text-xs font-mono uppercase tracking-widest text-text-faint animate-pulse">
          {t('loading_registry')}
        </span>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="m-8 p-5 text-sm text-danger bg-danger-light border-2 border-danger rounded-xl">
        {t('access_denied')}
      </div>
    )
  }

  return (
    <div className="w-full px-2.5 py-3 sm:p-6 lg:p-8 space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-mono uppercase tracking-tight text-text-primary">
          {t('title')}
        </h1>
        <p className="text-xs sm:text-sm text-text-muted mt-1">
          {t('subtitle')}
        </p>
      </div>

      {/* Master Data Table */}
      <RegistryTable
        farmers={farmers}
        total={total}
        page={page}
        limit={limit}
        totalPages={totalPages}
        summary={summary}
        filters={filters}
        onFilterChange={setFilterField}
        kebeles={kebeles}
        daStaff={daStaff}
        crops={crops}
        selectedFarmerIds={selectedFarmerIds}
        onToggleSelect={handleToggleSelectFarmer}
        onSelectAll={handleSelectAll}
        onInspectFarmer={(f) => setDetailFarmer(f)}
        onOpenReassign={(id) => {
          setReassignTargetFarmerId(id ?? null)
          setReassignModalOpen(true)
        }}
        onOpenExport={() => setExportModalOpen(true)}
        isLoading={registryLoading}
      />

      {/* Slide-Over Farmer Details Drawer */}
      <FarmerDetailDrawer
        farmer={detailFarmer}
        onClose={() => setDetailFarmer(null)}
        onReassignDa={(farmerId) => {
          setReassignTargetFarmerId(farmerId)
          setReassignModalOpen(true)
        }}
      />

      {/* Reassign DA Modal */}
      <ReassignDaModal
        open={reassignModalOpen}
        onClose={() => {
          setReassignModalOpen(false)
          setReassignTargetFarmerId(null)
        }}
        daStaff={daStaff}
        onConfirm={handleReassign}
        isLoading={isReassigning}
        targetCount={selectedFarmerIds.length || 1}
      />

      {/* Export Registry Modal */}
      <RegistryExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        onExport={handleExport}
        isLoading={isExporting}
        currentFilters={filters}
      />
    </div>
  )
}
