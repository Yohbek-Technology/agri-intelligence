'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { useRoleGuard } from '@/hooks/useAuth'
import { useDaFieldHub } from '@/hooks/useDaFieldHub'
import { usePlots } from '@/hooks/usePlots'
import { DaContextSwitcher } from '@/components/da/DaContextSwitcher'
import { PlotDrawer } from '@/components/farmer/PlotDrawer'
import { PlotCard } from '@/components/farmer/PlotCard'
import { ProxyRegisterDrawer } from '@/components/da/ProxyRegisterDrawer'
import { Plus } from 'lucide-react'

export default function DaPlotsPage() {
  const t = useTranslations('Phase2.da')
  const tFarmer = useTranslations('Phase2.farmer')
  const { isAuthorized, isLoading: authLoading } = useRoleGuard(['da', 'system_admin'])

  const {
    farmers,
    activeFarmerId,
    activeFarmer,
    setActiveFarmerId,
    kebeles,
    proxyDrawerOpen,
    setProxyDrawerOpen,
    handleCreateProxyFarmer,
    isCreatingProxy,
    handleVerifyFarmer,
    isVerifying,
    formErrors: proxyErrors,
  } = useDaFieldHub()

  const {
    plots,
    plotsLoading,
    crops,
    displayUnit,
    setDisplayUnit,
    statusFilter,
    setStatusFilter,
    drawerOpen: plotDrawerOpen,
    setDrawerOpen: setPlotDrawerOpen,
    formErrors: plotErrors,
    geoResolution,
    gpsLoading,
    acquireGps,
    resolveCoordinates,
    handleCreatePlot,
    isCreatingPlot,
    handleArchivePlot,
    handleRestorePlot,
  } = usePlots({ farmerId: activeFarmerId ?? undefined })

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="text-xs font-mono uppercase tracking-widest text-text-faint animate-pulse">
          {t('loading_plots_repo')}
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
          {t('parcels_mgmt_title')}
        </h1>
        <p className="text-xs sm:text-sm text-text-muted mt-1">
          {t('parcels_mgmt_subtitle')}
        </p>
      </div>

      {/* Persistent Active-Farmer Context Switcher */}
      <DaContextSwitcher
        activeFarmer={activeFarmer ?? null}
        farmers={farmers}
        onSelectFarmer={setActiveFarmerId}
        onOpenProxyRegister={() => setProxyDrawerOpen(true)}
        onVerifyFarmer={handleVerifyFarmer}
        isVerifying={isVerifying}
      />

      {/* Control Bar: Tabs & Unit Switcher */}
      <div
        className="p-3 sm:p-4 rounded-2xl bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        style={{ border: '2px solid var(--color-border-ui)' }}
      >
        <div className="flex rounded-xl p-1 bg-surface-subtle border-2 border-border-ui">
          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-primary text-white shadow-xs'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {tFarmer('active_tab')}
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('archived')}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
              statusFilter === 'archived'
                ? 'bg-text-muted text-white shadow-xs'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {tFarmer('archived_tab')}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold uppercase text-text-muted">{tFarmer('display_unit_label')}</span>
          <div className="flex rounded-xl p-1 bg-surface-subtle border-2 border-border-ui">
            {(['timad', 'kert', 'hectare'] as const).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setDisplayUnit(u)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                  displayUnit === u
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {u}
              </button>
            ))}
          </div>

          {activeFarmer && (
            <button
              type="button"
              onClick={() => setPlotDrawerOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-xs ml-2"
            >
              <Plus size={14} />
              {tFarmer('register_parcel')}
            </button>
          )}
        </div>
      </div>

      {/* Parcels Grid */}
      {!activeFarmer ? (
        <div
          className="p-10 text-center rounded-2xl bg-surface-subtle space-y-3"
          style={{ border: '2px dashed var(--color-border-ui)' }}
        >
          <p className="text-sm font-mono font-bold uppercase text-text-primary">
            {t('no_active_farmer')}
          </p>
          <p className="text-xs text-text-muted max-w-md mx-auto">
            {t('no_active_farmer_desc')}
          </p>
        </div>
      ) : plotsLoading ? (
        <div className="py-12 text-center text-xs font-mono text-text-faint">
          {tFarmer('loading_plots')}
        </div>
      ) : plots.length === 0 ? (
        <div
          className="p-10 text-center rounded-2xl bg-surface-subtle space-y-3"
          style={{ border: '2px dashed var(--color-border-ui)' }}
        >
          <p className="text-sm font-mono font-bold uppercase text-text-primary">
            {tFarmer('no_status_parcels', { status: statusFilter })}
          </p>
          <button
            type="button"
            onClick={() => setPlotDrawerOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-mono font-bold uppercase tracking-wider cursor-pointer shadow-md"
          >
            <Plus size={15} />
            {tFarmer('register_parcel')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {plots.map((plot) => (
            <PlotCard
              key={plot.id}
              plot={plot}
              displayUnit={displayUnit}
              onArchive={handleArchivePlot}
              onRestore={handleRestorePlot}
              detailHref={`/da/plots/${plot.id}`}
            />
          ))}
        </div>
      )}

      {/* Drawers */}
      <ProxyRegisterDrawer
        open={proxyDrawerOpen}
        onClose={() => setProxyDrawerOpen(false)}
        onSubmit={handleCreateProxyFarmer}
        kebeles={kebeles}
        isLoading={isCreatingProxy}
        errors={proxyErrors}
      />

      {activeFarmer && (
        <PlotDrawer
          open={plotDrawerOpen}
          onClose={() => setPlotDrawerOpen(false)}
          onSubmit={handleCreatePlot}
          crops={crops}
          isLoading={isCreatingPlot}
          gpsLoading={gpsLoading}
          onAcquireGps={acquireGps}
          onResolveCoords={resolveCoordinates}
          geoResolution={geoResolution}
          errors={plotErrors}
          farmerName={activeFarmer.fullName}
        />
      )}
    </div>
  )
}
