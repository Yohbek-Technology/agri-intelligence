'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { useRoleGuard } from '@/hooks/useAuth'
import { useDaFieldHub } from '@/hooks/useDaFieldHub'
import { ProxyRegisterDrawer } from '@/components/da/ProxyRegisterDrawer'
import {
  Search,
  CheckCircle2,
  Clock,
  UserPlus,
  MapPin,
  Phone,
} from 'lucide-react'

export default function DaFarmersPage() {
  const t = useTranslations('Phase2.da')
  const tFarmer = useTranslations('Phase2.farmer')
  const tRegistry = useTranslations('Phase2.registry')
  const { isAuthorized, isLoading: authLoading } = useRoleGuard(['da', 'system_admin'])

  const {
    farmers,
    totalFarmers,
    farmersLoading,
    activeFarmerId,
    setActiveFarmerId,
    kebeles,
    filterParams,
    setFilterParams,
    proxyDrawerOpen,
    setProxyDrawerOpen,
    formErrors: proxyErrors,
    handleCreateProxyFarmer,
    isCreatingProxy,
    handleVerifyFarmer,
    isVerifying,
  } = useDaFieldHub()

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="text-xs font-mono uppercase tracking-widest text-text-faint animate-pulse">
          {t('loading_farmers')}
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-mono uppercase tracking-tight text-text-primary">
            {t('farmers_directory')}
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            {t('farmers_directory_subtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setProxyDrawerOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <UserPlus size={15} />
          {t('proxy_register_farmer')}
        </button>
      </div>

      {/* Filter Toolbar */}
      <div
        className="p-3.5 sm:p-4 rounded-2xl bg-surface flex flex-col sm:flex-row items-center gap-3"
        style={{ border: '2px solid var(--color-border-ui)' }}
      >
        <div className="relative flex-1 w-full">
          <Search size={15} className="absolute left-3.5 top-3 text-text-faint" />
          <input
            type="text"
            value={filterParams.q ?? ''}
            onChange={(e) =>
              setFilterParams((prev) => ({ ...prev, q: e.target.value, page: 1 }))
            }
            placeholder={t('search_farmers')}
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-surface-subtle border-2 border-border-ui rounded-xl outline-hidden focus:border-primary font-sans"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterParams.kebele_id ?? ''}
            onChange={(e) =>
              setFilterParams((prev) => ({
                ...prev,
                kebele_id: e.target.value || undefined,
                page: 1,
              }))
            }
            className="px-3 py-2 text-xs bg-surface-subtle border border-border-ui rounded-xl outline-hidden text-text-primary flex-1 sm:flex-initial"
          >
            <option value="">{tRegistry('all_kebeles')}</option>
            {kebeles.map((k) => (
              <option key={k.id} value={k.id}>
                {k.name}
              </option>
            ))}
          </select>

          <select
            value={filterParams.is_verified ?? 'all'}
            onChange={(e) =>
              setFilterParams((prev) => ({
                ...prev,
                is_verified: e.target.value as any,
                page: 1,
              }))
            }
            className="px-3 py-2 text-xs bg-surface-subtle border border-border-ui rounded-xl outline-hidden text-text-primary flex-1 sm:flex-initial"
          >
            <option value="all">{t('all_status')}</option>
            <option value="true">{t('verified')}</option>
            <option value="false">{t('pending')}</option>
          </select>
        </div>
      </div>

      {/* Farmers List */}
      <div
        className="rounded-2xl bg-surface overflow-hidden shadow-xs"
        style={{ border: '2px solid var(--color-border-ui)' }}
      >
        <div className="divide-y divide-border-ui">
          {farmersLoading ? (
            <div className="p-8 text-center text-xs font-mono text-text-faint">
              {t('loading_farmers')}
            </div>
          ) : farmers.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-text-faint">
              {t('no_matching_farmers')}
            </div>
          ) : (
            farmers.map((farmer) => {
              const isActive = activeFarmerId === farmer.id
              return (
                <div
                  key={farmer.id}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    isActive ? 'bg-primary-light/30' : 'hover:bg-surface-subtle/50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold font-mono uppercase text-text-primary">
                        {farmer.fullName}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md border ${
                          farmer.isVerified
                            ? 'bg-success-light text-success border-success/30'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}
                      >
                        {farmer.isVerified ? (
                          <>
                            <CheckCircle2 size={11} /> {t('verified')}
                          </>
                        ) : (
                          <>
                            <Clock size={11} /> {t('pending')}
                          </>
                        )}
                      </span>
                      {isActive && (
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-primary text-white">
                          {t('current_context')}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-text-muted">
                      <span>{tFarmer('local_id')}: {farmer.localIdNumber}</span>
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-text-faint" />
                        {farmer.kebeleName ?? 'Kebele Office'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone size={12} className="text-text-faint" />
                        {farmer.phoneNumber ?? t('has_no_phone')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {!farmer.isVerified && (
                      <button
                        type="button"
                        disabled={isVerifying}
                        onClick={() => handleVerifyFarmer(farmer.id)}
                        className="px-3 py-1.5 rounded-xl bg-success-light hover:bg-success text-success hover:text-white border border-success/40 text-xs font-mono font-bold uppercase transition-all cursor-pointer disabled:opacity-50"
                      >
                        {t('verify_farmer_btn')}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setActiveFarmerId(farmer.id)}
                      className={`px-3 py-1.5 rounded-xl border-2 text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                        isActive
                          ? 'border-primary bg-primary text-white shadow-xs'
                          : 'border-border-ui bg-surface-subtle text-text-primary hover:border-primary'
                      }`}
                    >
                      {isActive ? t('current_context') : t('select_context')}
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Proxy Register Drawer */}
      <ProxyRegisterDrawer
        open={proxyDrawerOpen}
        onClose={() => setProxyDrawerOpen(false)}
        onSubmit={handleCreateProxyFarmer}
        kebeles={kebeles}
        isLoading={isCreatingProxy}
        errors={proxyErrors}
      />
    </div>
  )
}
