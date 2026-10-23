'use client'

import React from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useAuthSession, useRoleGuard } from '@/hooks/useAuth'
import { useFarmerProfile } from '@/hooks/useFarmerProfile'
import { usePlots } from '@/hooks/usePlots'
import { FarmerOnboardingModal } from '@/components/farmer/FarmerOnboardingModal'
import { PlotDrawer } from '@/components/farmer/PlotDrawer'
import { PlotCard } from '@/components/farmer/PlotCard'
import {
  ShieldCheck,
  Plus,
  MapPin,
  Sprout,
  Compass,
  ArrowRight,
  Layers,
  Sparkles,
} from 'lucide-react'

export default function FarmerOverviewPage() {
  const t = useTranslations('Phase2.farmer')
  const { user } = useAuthSession()
  const { isAuthorized, isLoading: authLoading } = useRoleGuard(['farmer', 'system_admin'])

  const {
    profile,
    profileLoading,
    kebeles,
    needsOnboarding,
    onboardingOpen,
    setOnboardingOpen,
    claimOpen,
    setClaimOpen,
    formErrors: profileErrors,
    handleOnboard,
    handleClaim,
    isOnboarding,
    isClaiming,
  } = useFarmerProfile()

  const {
    plots,
    plotsLoading,
    crops,
    displayUnit,
    setDisplayUnit,
    drawerOpen,
    setDrawerOpen,
    formErrors: plotErrors,
    isResolvingGeo,
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
          {t('init_workspace')}
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

  const farmerName = profile?.fullName ?? user?.name ?? 'Farmer'

  return (
    <div className="w-full px-2.5 py-3 sm:p-6 lg:p-8 space-y-6">
      {/* Top Highland Ethiopian Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold font-mono uppercase tracking-tight text-text-primary">
              {t('greeting', { name: farmerName })}
            </h1>
            {profile?.isVerified ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-success-light text-success border border-success/40">
                <ShieldCheck size={13} /> {t('verified_member')}
              </span>
            ) : (
              <span className="text-[11px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-300">
                {t('self_registered')}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            {profile?.kebeleName ? `${t('kebele_label')}: ${profile.kebeleName}` : t('overview_subtitle')}
            {profile?.localIdNumber ? ` • ${profile.localIdNumber}` : ''}
          </p>
        </div>

        {/* Customary Unit Switcher */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-mono font-bold uppercase text-text-muted">{t('unit_label')}</span>
          <div className="flex rounded-xl p-1 bg-surface border-2 border-border-ui shadow-2xs">
            {(['timad', 'kert', 'hectare'] as const).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setDisplayUnit(u)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
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

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div
          className="p-4 rounded-2xl bg-surface"
          style={{ border: '2px solid var(--color-border-ui)' }}
        >
          <p className="text-[10px] font-mono uppercase text-text-muted">{t('active_parcels')}</p>
          <p className="text-2xl font-bold font-mono text-text-primary mt-1">{plots.length}</p>
          <p className="text-[11px] text-text-faint font-mono mt-0.5">{t('georeferenced_inventory')}</p>
        </div>

        <div
          className="p-4 rounded-2xl bg-surface"
          style={{ border: '2px solid var(--color-border-ui)' }}
        >
          <p className="text-[10px] font-mono uppercase text-text-muted">{t('total_cultivated_area')}</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold font-mono text-primary">
              {plots
                .reduce((acc, p) => acc + (p.displayArea ?? p.areaValue), 0)
                .toFixed(1)}
            </span>
            <span className="text-xs font-mono font-bold uppercase text-primary">
              {displayUnit}
            </span>
          </div>
          <p className="text-[11px] text-text-faint font-mono mt-0.5">
            ≈{' '}
            {plots
              .reduce((acc, p) => acc + (p.areaHectares || 0), 0)
              .toFixed(2)}{' '}
            Ha
          </p>
        </div>

        <div
          className="p-4 rounded-2xl bg-surface"
          style={{ border: '2px solid var(--color-border-ui)' }}
        >
          <p className="text-[10px] font-mono uppercase text-text-muted">{t('da_linkage')}</p>
          <p className="text-base font-bold font-mono text-text-primary mt-1 truncate">
            {profile?.assignedDaName ?? t('awaiting_assignment')}
          </p>
          <p className="text-[11px] text-text-faint font-mono mt-0.5">{t('extension_officer_desc')}</p>
        </div>

        <div
          className="p-4 rounded-2xl bg-surface"
          style={{ border: '2px solid var(--color-border-ui)' }}
        >
          <p className="text-[10px] font-mono uppercase text-text-muted">{t('soil_stratum_status')}</p>
          <p className="text-base font-bold font-mono text-accent mt-1 flex items-center gap-1.5">
            <Layers size={16} /> {t('stratum_ready')}
          </p>
          <p className="text-[11px] text-text-faint font-mono mt-0.5">{t('physical_cutaway_desc')}</p>
        </div>
      </div>

      {/* Parcels Inventory Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b-2 border-border-ui">
          <div>
            <h2 className="text-lg font-bold font-mono uppercase text-text-primary tracking-tight">
              {t('my_parcels')}
            </h2>
            <p className="text-xs text-text-muted">
              {t('my_parcels_subtitle')}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
          >
            <Plus size={15} />
            {t('register_parcel')}
          </button>
        </div>

        {plots.length === 0 ? (
          <div
            className="p-10 text-center rounded-2xl bg-surface-subtle space-y-3"
            style={{ border: '2px dashed var(--color-border-ui)' }}
          >
            <p className="text-sm font-mono font-bold uppercase text-text-primary">
              {t('no_parcels')}
            </p>
            <p className="text-xs text-text-muted max-w-md mx-auto">
              {t('no_parcels_desc')}
            </p>
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
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
              />
            ))}
          </div>
        )}
      </div>

      {/* Onboarding Modal Trigger (If farmer has no profile record yet) */}
      <FarmerOnboardingModal
        open={needsOnboarding || onboardingOpen}
        kebeles={kebeles}
        onSubmit={handleOnboard}
        onClaim={handleClaim}
        isLoading={isOnboarding}
        isClaiming={isClaiming}
        errors={profileErrors}
      />

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
