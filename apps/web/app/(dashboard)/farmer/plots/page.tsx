'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { useAuthSession, useRoleGuard } from '@/hooks/useAuth'
import { useFarmerProfile } from '@/hooks/useFarmerProfile'
import { usePlots } from '@/hooks/usePlots'
import { PlotCard } from '@/components/farmer/PlotCard'
import { PlotDrawer } from '@/components/farmer/PlotDrawer'
import { Plus, MapPin, Archive } from 'lucide-react'

export default function FarmerPlotsPage() {
  const tFarmer = useTranslations('Phase2.farmer')
  const tPlots = useTranslations('Phase2.plots')
  const { isAuthorized, isLoading: authLoading } = useRoleGuard(['farmer', 'system_admin'])
  const { profile, profileLoading } = useFarmerProfile()

  const {
    plots,
    plotsLoading,
    crops,
    displayUnit,
    setDisplayUnit,
    statusFilter,
    setStatusFilter,
    drawerOpen,
    setDrawerOpen,
    formErrors: plotErrors,
    geoResolution,
    gpsLoading,
    acquireGps,
    resolveCoordinates,
    handleCreatePlot,
    isCreatingPlot,
    handleArchivePlot,
    handleRestorePlot,
  } = usePlots({ farmerId: profile?.id })

  if (authLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="text-xs font-mono uppercase tracking-widest text-text-faint animate-pulse">
          {tFarmer('loading_plots')}
        </span>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="m-8 p-5 text-sm text-danger bg-danger-light border-2 border-danger rounded-xl">
        {tFarmer('access_denied')}
      </div>
    )
  }

  return (
    <div className="w-full px-2.5 py-3 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-mono uppercase tracking-tight text-text-primary">
            {tFarmer('plots_title')}
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            {tFarmer('plots_subtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <Plus size={15} />
          {tFarmer('register_parcel')}
        </button>
      </div>

      {/* Filter and Unit Control Bar */}
      <div
        className="p-3 sm:p-4 rounded-2xl bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        style={{ border: '2px solid var(--color-border-ui)' }}
      >
        {/* Status Tabs */}
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
            {tFarmer('active_tab')} ({statusFilter === 'active' ? plots.length : '•'})
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
            {tFarmer('archived_tab')} ({statusFilter === 'archived' ? plots.length : '•'})
          </button>
        </div>

        {/* Customary Unit Switcher */}
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
        </div>
      </div>

      {/* Plots Card Grid */}
      {plotsLoading ? (
        <div className="py-12 text-center text-xs font-mono text-text-faint">
          {tPlots('loading_plots')}
        </div>
      ) : plots.length === 0 ? (
        <div
          className="p-10 text-center rounded-2xl bg-surface-subtle space-y-3"
          style={{ border: '2px dashed var(--color-border-ui)' }}
        >
          <p className="text-sm font-mono font-bold uppercase text-text-primary">
            {tFarmer('no_status_parcels', { status: statusFilter })}
          </p>
          <p className="text-xs text-text-muted max-w-md mx-auto">
            {statusFilter === 'active'
              ? tFarmer('no_status_parcels_desc')
              : tFarmer('archived_parcels_desc')}
          </p>
          {statusFilter === 'active' && (
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-mono font-bold uppercase tracking-wider cursor-pointer shadow-md"
            >
              <Plus size={15} />
              {tFarmer('register_parcel')}
            </button>
          )}
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
            />
          ))}
        </div>
      )}

      {/* Register Parcel Slide-Over Drawer */}
      <PlotDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleCreatePlot}
        crops={crops}
        isLoading={isCreatingPlot}
        gpsLoading={gpsLoading}
        onAcquireGps={acquireGps}
        onResolveCoords={resolveCoordinates}
        geoResolution={geoResolution}
        errors={plotErrors}
      />
    </div>
  )
}
