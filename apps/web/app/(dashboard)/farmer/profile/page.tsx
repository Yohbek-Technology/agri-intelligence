'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { useRoleGuard } from '@/hooks/useAuth'
import { useFarmerProfile } from '@/hooks/useFarmerProfile'
import { FarmerOnboardingModal } from '@/components/farmer/FarmerOnboardingModal'
import { ShieldCheck, User, MapPin, Phone, Globe, Calendar, CheckCircle2 } from 'lucide-react'

export default function FarmerProfilePage() {
  const t = useTranslations('Phase2.farmer')
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
    formErrors,
    handleOnboard,
    handleClaim,
    handleUpdate,
    isOnboarding,
    isClaiming,
    isUpdating,
  } = useFarmerProfile()

  if (authLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="text-xs font-mono uppercase tracking-widest text-text-faint animate-pulse">
          {t('loading_profile')}
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
    <div className="w-full px-2.5 py-3 sm:p-6 lg:p-8 space-y-6 max-w-4xl">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-mono uppercase tracking-tight text-text-primary">
          {t('profile_title')}
        </h1>
        <p className="text-xs sm:text-sm text-text-muted mt-1">
          {t('profile_subtitle')}
        </p>
      </div>

      {profile ? (
        <div
          className="p-6 rounded-2xl bg-surface space-y-6"
          style={{ border: '2px solid var(--color-border-ui)' }}
        >
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border-ui">
            <div className="flex items-center gap-3.5">
              <span className="p-3 rounded-2xl bg-primary text-white">
                <User size={24} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold font-mono uppercase text-text-primary">
                    {profile.fullName}
                  </h2>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md border ${
                      profile.isVerified
                        ? 'bg-success-light text-success border-success/30'
                        : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}
                  >
                    {profile.isVerified ? (
                      <>
                        <ShieldCheck size={12} /> {t('verified_member')}
                      </>
                    ) : (
                      t('self_registered')
                    )}
                  </span>
                </div>
                <p className="text-xs text-text-muted font-mono mt-0.5">
                  {t('local_id')}: {profile.localIdNumber}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setClaimOpen(true)}
              className="px-3.5 py-1.5 rounded-xl border-2 border-border-ui hover:border-accent text-xs font-mono font-bold uppercase text-accent hover:bg-accent-light transition-all cursor-pointer self-start sm:self-auto"
            >
              {t('claim_da_profile')}
            </button>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-surface-subtle border border-border-ui space-y-1">
              <span className="text-text-muted flex items-center gap-1.5">
                <MapPin size={13} className="text-primary" />
                {t('kebele_label')}:
              </span>
              <p className="font-bold text-text-primary text-sm">
                {profile.kebeleName ?? t('kebele_territory')}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-subtle border border-border-ui space-y-1">
              <span className="text-text-muted flex items-center gap-1.5">
                <Phone size={13} className="text-primary" />
                {t('phone_account')}
              </span>
              <p className="font-bold text-text-primary text-sm">
                {profile.phoneNumber ?? '—'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-subtle border border-border-ui space-y-1">
              <span className="text-text-muted flex items-center gap-1.5">
                <Globe size={13} className="text-primary" />
                {t('preferred_lang')}:
              </span>
              <p className="font-bold text-text-primary text-sm uppercase">
                {profile.preferredLanguage}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-subtle border border-border-ui space-y-1">
              <span className="text-text-muted flex items-center gap-1.5">
                <Calendar size={13} className="text-primary" />
                {t('consent_date')}
              </span>
              <p className="font-bold text-text-primary text-sm">
                {profile.consentAgreedAt
                  ? new Date(profile.consentAgreedAt).toLocaleDateString()
                  : '—'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="p-8 text-center rounded-2xl bg-surface-subtle space-y-3"
          style={{ border: '2px dashed var(--color-border-ui)' }}
        >
          <p className="text-sm font-mono font-bold uppercase text-text-primary">
            {t('no_parcels')}
          </p>
          <button
            type="button"
            onClick={() => setOnboardingOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-mono font-bold uppercase tracking-wider cursor-pointer"
          >
            {t('new_profile')}
          </button>
        </div>
      )}

      {/* Onboarding & Claiming Modals */}
      <FarmerOnboardingModal
        open={needsOnboarding || onboardingOpen || claimOpen}
        kebeles={kebeles}
        onSubmit={handleOnboard}
        onClaim={handleClaim}
        isLoading={isOnboarding}
        isClaiming={isClaiming}
        errors={formErrors}
      />
    </div>
  )
}
