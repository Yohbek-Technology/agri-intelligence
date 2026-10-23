'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useRoleGuard } from '@/hooks/useAuth'
import { useDaFieldHub } from '@/hooks/useDaFieldHub'
import { ShieldCheck, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function DaRegisterFarmerPage() {
  const router = useRouter()
  const t = useTranslations('Phase2.da')
  const tFarmer = useTranslations('Phase2.farmer')
  const tPlots = useTranslations('Phase2.plots')
  const { isAuthorized, isLoading: authLoading } = useRoleGuard(['da', 'system_admin'])
  const { kebeles, handleCreateProxyFarmer, isCreatingProxy, formErrors } = useDaFieldHub()

  const [fullName, setFullName] = useState('')
  const [localIdNumber, setLocalIdNumber] = useState('')
  const [kebeleId, setKebeleId] = useState('')
  const [hasNoPhone, setHasNoPhone] = useState(true)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [preferredLanguage, setPreferredLanguage] = useState<'am' | 'om' | 'ti' | 'en'>('am')

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleCreateProxyFarmer({
      fullName,
      localIdNumber,
      kebeleId,
      hasNoPhone,
      phoneNumber: hasNoPhone ? null : phoneNumber || null,
      preferredLanguage,
      consentAgreed: true,
    })
  }

  return (
    <div className="w-full px-2.5 py-3 sm:p-6 lg:p-8 space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link
          href="/da/farmers"
          className="p-2 rounded-xl bg-surface hover:bg-surface-subtle border-2 border-border-ui text-text-muted transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-mono uppercase tracking-tight text-text-primary">
            {t('proxy_drawer_title')}
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            {t('proxy_drawer_desc')}
          </p>
        </div>
      </div>

      <div
        className="p-6 rounded-2xl bg-surface shadow-xs space-y-5"
        style={{ border: '2px solid var(--color-border-ui)' }}
      >
        <div className="p-3.5 rounded-xl bg-primary-light border border-primary/30 text-xs text-primary flex items-start gap-2">
          <ShieldCheck size={16} className="shrink-0 mt-0.5" />
          <span>
            <strong>{t('auto_verify_notice')}</strong>
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-text-muted mb-1.5">
              {tFarmer('full_name')}
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Tolossa Desta Guta"
              className="w-full px-3.5 py-2.5 text-sm bg-white rounded-xl border-2 border-border-ui focus:border-primary outline-hidden"
            />
            {formErrors.fullName && <p className="text-xs text-danger mt-1">{formErrors.fullName[0]}</p>}
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase text-text-muted mb-1.5">
              {tFarmer('local_id')}
            </label>
            <input
              type="text"
              required
              value={localIdNumber}
              onChange={(e) => setLocalIdNumber(e.target.value)}
              placeholder="e.g. LID-2026-081"
              className="w-full px-3.5 py-2.5 text-sm bg-white rounded-xl border-2 border-border-ui focus:border-primary outline-hidden font-mono"
            />
            {formErrors.localIdNumber && (
              <p className="text-xs text-danger mt-1">{formErrors.localIdNumber[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase text-text-muted mb-1.5">
              {tFarmer('kebele_select')}
            </label>
            <select
              required
              value={kebeleId}
              onChange={(e) => setKebeleId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white rounded-xl border-2 border-border-ui focus:border-primary outline-hidden"
            >
              <option value="">{tFarmer('kebele_select')}</option>
              {kebeles.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.name}
                </option>
              ))}
            </select>
            {formErrors.kebeleId && <p className="text-xs text-danger mt-1">{formErrors.kebeleId[0]}</p>}
          </div>

          <div className="p-3.5 rounded-xl bg-surface-subtle border-2 border-border-ui space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasNoPhone}
                onChange={(e) => setHasNoPhone(e.target.checked)}
                className="rounded-sm text-primary w-4 h-4"
              />
              <span className="text-xs font-mono font-bold uppercase text-text-primary">
                {t('has_no_phone')}
              </span>
            </label>

            {!hasNoPhone && (
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-text-muted mb-1">
                  {t('phone_number')}
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+251911000000"
                  className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-border-ui font-mono"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase text-text-muted mb-1.5">
              {tFarmer('preferred_lang')}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { code: 'am', label: 'አማርኛ' },
                { code: 'om', label: 'Afaan Oromoo' },
                { code: 'ti', label: 'ትግርኛ' },
                { code: 'en', label: 'English' },
              ].map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setPreferredLanguage(lang.code as any)}
                  className={`py-2 px-1 text-center rounded-xl border-2 text-xs font-medium cursor-pointer transition-all ${
                    preferredLanguage === lang.code
                      ? 'border-primary bg-primary-light text-primary font-bold'
                      : 'border-border-ui bg-white text-text-muted hover:border-text-faint'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-border-ui flex items-center justify-end gap-3">
            <Link
              href="/da/farmers"
              className="px-4 py-2.5 rounded-xl border-2 border-border-ui text-xs font-mono uppercase font-bold text-text-muted hover:bg-surface-subtle transition-colors cursor-pointer"
            >
              {tPlots('cancel')}
            </Link>
            <button
              type="submit"
              disabled={isCreatingProxy}
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-mono uppercase font-bold tracking-wider transition-colors cursor-pointer disabled:opacity-50 shadow-md"
            >
              {isCreatingProxy ? t('recording') : t('create_verified_profile')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
