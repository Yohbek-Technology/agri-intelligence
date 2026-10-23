'use client'

import React from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useAuthSession, useRoleGuard } from '@/hooks/useAuth'
import { useDaFieldHub } from '@/hooks/useDaFieldHub'
import { usePlots } from '@/hooks/usePlots'
import { DaContextSwitcher } from '@/components/da/DaContextSwitcher'
import { ProxyRegisterDrawer } from '@/components/da/ProxyRegisterDrawer'
import { PlotDrawer } from '@/components/farmer/PlotDrawer'
import { PlotCard } from '@/components/farmer/PlotCard'
import { Plus } from 'lucide-react'

export default function DaOverviewPage() {
  const t = useTranslations('Phase2.da')
  const tFarmer = useTranslations('Phase2.farmer')
  const { user } = useAuthSession()
  const { isAuthorized, isLoading: authLoading } = useRoleGuard(['da', 'system_admin'])

  const {
    farmers,
    totalFarmers,
    farmersLoading,
    activeFarmerId,
    activeFarmer,
    setActiveFarmerId,
    kebeles,
    proxyDrawerOpen,
    setProxyDrawerOpen,
    formErrors: proxyErrors,
    handleCreateProxyFarmer,
    isCreatingProxy,
    handleVerifyFarmer,
    isVerifying,
  } = useDaFieldHub()

  const {
    plots,
    plotsLoading,
    crops,
    displayUnit,
    setDisplayUnit,
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
          {t('loading_hub')}
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

  const verifiedCount = farmers.filter((f) => f.isVerified).length
  const pendingCount = farmers.filter((f) => !f.isVerified).length

  return (
    <div className="w-full px-2.5 py-3 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-mono uppercase tracking-tight text-text-primary">
          {t('field_hub_title')}
        </h1>
        <p className="text-xs sm:text-sm text-text-muted mt-1">
          {t('field_hub_subtitle')}
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div
          className="p-4 rounded-2xl bg-surface"
          style={{ border: '2px solid var(--color-border-ui)' }}
        >
          <p className="text-[10px] font-mono uppercase text-text-muted">{t('assigned_farmers')}</p>
          <p className="text-2xl font-bold font-mono text-text-primary mt-1">{totalFarmers}</p>
          <p className="text-[11px] text-text-faint font-mono mt-0.5">{t('assigned_farmers_desc')}</p>
        </div>

        <div
          className="p-4 rounded-2xl bg-surface"
          style={{ border: '2px solid var(--color-border-ui)' }}
        >
          <p className="text-[10px] font-mono uppercase text-text-muted">{t('field_verified')}</p>
          <p className="text-2xl font-bold font-mono text-success mt-1">{verifiedCount}</p>
          <p className="text-[11px] text-text-faint font-mono mt-0.5">{t('field_verified_desc')}</p>
        </div>

        <div
          className="p-4 rounded-2xl bg-surface"
          style={{ border: '2px solid var(--color-border-ui)' }}
        >
          <p className="text-[10px] font-mono uppercase text-text-muted">{t('pending_verification')}</p>
          <p className="text-2xl font-bold font-mono text-amber-700 mt-1">{pendingCount}</p>
          <p className="text-[11px] text-text-faint font-mono mt-0.5">{t('pending_verification_desc')}</p>
        </div>

        <div
          className="p-4 rounded-2xl bg-surface"
          style={{ border: '2px solid var(--color-border-ui)' }}
        >
          <p className="text-[10px] font-mono uppercase text-text-muted">{t('active_farmer_parcels')}</p>
          <p className="text-2xl font-bold font-mono text-primary mt-1">
            {activeFarmer ? plots.length : '—'}
          </p>
          <p className="text-[11px] text-text-faint font-mono mt-0.5">
            {activeFarmer ? activeFarmer.fullName : t('select_farmer_hint')}
          </p>
        </div>
      </div>

      {/* Active Farmer Parcels Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b-2 border-border-ui">
          <div>
            <h2 className="text-base sm:text-lg font-bold font-mono uppercase text-text-primary tracking-tight">
              {activeFarmer ? `${activeFarmer.fullName} • ${tFarmer('my_parcels')}` : tFarmer('my_parcels')}
            </h2>
            <p className="text-xs text-text-muted">
              {activeFarmer
                ? `${tFarmer('my_parcels_subtitle')} (${activeFarmer.fullName})`
                : t('select_farmer_hint')}
            </p>
          </div>

          {activeFarmer && (
            <button
              type="button"
              onClick={() => setPlotDrawerOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
            >
              <Plus size={15} />
              {tFarmer('register_parcel')}
            </button>
          )}
        </div>

        {!activeFarmer ? (
          <div
            className="p-8 text-center rounded-2xl bg-surface-subtle space-y-3"
            style={{ border: '2px dashed var(--color-border-ui)' }}
          >
            <p className="text-sm font-mono font-bold uppercase text-text-primary">
              {t('no_active_farmer')}
            </p>
            <p className="text-xs text-text-muted max-w-md mx-auto">
              {t('no_active_farmer_desc')}
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Link
                href="/da/farmers"
                className="px-4 py-2 rounded-xl border-2 border-border-ui text-xs font-mono font-bold uppercase text-text-primary hover:bg-white transition-colors cursor-pointer"
              >
                {t('browse_directory')}
              </Link>
              <button
                type="button"
                onClick={() => setProxyDrawerOpen(true)}
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-mono font-bold uppercase tracking-wider hover:bg-primary-hover transition-colors cursor-pointer shadow-sm"
              >
                {t('proxy_register_farmer')}
              </button>
            </div>
          </div>
        ) : plots.length === 0 ? (
          <div
            className="p-8 text-center rounded-2xl bg-surface-subtle space-y-3"
            style={{ border: '2px dashed var(--color-border-ui)' }}
          >
            <p className="text-sm font-mono font-bold uppercase text-text-primary">
              {t('no_parcels_for_farmer', { name: activeFarmer.fullName })}
            </p>
            <p className="text-xs text-text-muted max-w-md mx-auto">
              {t('no_parcels_for_farmer_desc')}
            </p>
            <button
              type="button"
              onClick={() => setPlotDrawerOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-mono font-bold uppercase tracking-wider cursor-pointer shadow-md"
            >
              <Plus size={15} />
              {t('register_first_parcel')}
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
      </div>

      {/* Proxy Onboarding Drawer */}
      <ProxyRegisterDrawer
        open={proxyDrawerOpen}
        onClose={() => setProxyDrawerOpen(false)}
        onSubmit={handleCreateProxyFarmer}
        kebeles={kebeles}
        isLoading={isCreatingProxy}
        errors={proxyErrors}
      />

      {/* Plot Registration Drawer on behalf of Active Farmer */}
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
