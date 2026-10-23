'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ShieldCheck, UserCheck, ArrowRight, Sparkles } from 'lucide-react'
import type { KebeleRow, FarmerOnboardingInput, ClaimFarmerProfileInput } from '@repo/shared'

interface FarmerOnboardingModalProps {
  open: boolean
  kebeles: KebeleRow[]
  onSubmit: (data: FarmerOnboardingInput) => void
  onClaim: (data: ClaimFarmerProfileInput) => void
  isLoading: boolean
  isClaiming: boolean
  errors?: Record<string, string[]>
}

export function FarmerOnboardingModal({
  open,
  kebeles,
  onSubmit,
  onClaim,
  isLoading,
  isClaiming,
  errors = {},
}: FarmerOnboardingModalProps) {
  const t = useTranslations('Phase2.farmer')
  const [mode, setMode] = useState<'create' | 'claim'>('create')

  // Form states
  const [fullName, setFullName] = useState('')
  const [localIdNumber, setLocalIdNumber] = useState('')
  const [kebeleId, setKebeleId] = useState('')
  const [preferredLanguage, setPreferredLanguage] = useState<'am' | 'om' | 'ti' | 'en'>('am')
  const [consentAgreed, setConsentAgreed] = useState(true)

  // Claim state
  const [claimLocalId, setClaimLocalId] = useState('')

  if (!open) return null

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      fullName,
      localIdNumber,
      kebeleId,
      preferredLanguage,
      consentAgreed: true,
    })
  }

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onClaim({
      localIdNumber: claimLocalId,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-surface rounded-2xl shadow-2xl overflow-hidden"
        style={{ border: '2px solid var(--color-border-ui)' }}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-surface-subtle border-b-2 border-border-ui">
          <div className="flex items-center gap-2.5 mb-2">
            <span className="p-2 rounded-xl bg-primary text-white">
              <ShieldCheck size={20} />
            </span>
            <div>
              <h2 className="text-lg font-bold text-text-primary tracking-tight font-mono uppercase">
                {t('onboarding_title')}
              </h2>
              <p className="text-xs text-text-muted">
                {t('onboarding_subtitle')}
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex gap-2 mt-4 p-1 rounded-xl bg-white border-2 border-border-ui">
            <button
              type="button"
              onClick={() => setMode('create')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                mode === 'create'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {t('new_profile')}
            </button>
            <button
              type="button"
              onClick={() => setMode('claim')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                mode === 'claim'
                  ? 'bg-accent text-white shadow-xs'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {t('claim_da_record')}
            </button>
          </div>
        </div>

        {/* Mode: Create New Profile */}
        {mode === 'create' && (
          <form onSubmit={handleCreateSubmit} className="p-5 sm:p-6 space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-text-muted mb-1.5">
                {t('full_name')}
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Abebe Bekele Tadesse"
                className="w-full px-3.5 py-2.5 text-sm bg-white rounded-xl border-2 border-border-ui focus:border-primary outline-hidden font-sans"
              />
              {errors.fullName && (
                <p className="text-xs text-danger mt-1">{errors.fullName[0]}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-text-muted mb-1.5">
                  {t('local_id')}
                </label>
                <input
                  type="text"
                  required
                  value={localIdNumber}
                  onChange={(e) => setLocalIdNumber(e.target.value)}
                  placeholder="e.g. W04-LID-8921"
                  className="w-full px-3.5 py-2.5 text-sm bg-white rounded-xl border-2 border-border-ui focus:border-primary outline-hidden font-mono"
                />
                {errors.localIdNumber && (
                  <p className="text-xs text-danger mt-1">{errors.localIdNumber[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-text-muted mb-1.5">
                  {t('kebele_select')}
                </label>
                <select
                  required
                  value={kebeleId}
                  onChange={(e) => setKebeleId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white rounded-xl border-2 border-border-ui focus:border-primary outline-hidden"
                >
                  <option value="">{t('kebele_select')}</option>
                  {kebeles.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.name}
                    </option>
                  ))}
                </select>
                {errors.kebeleId && (
                  <p className="text-xs text-danger mt-1">{errors.kebeleId[0]}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-text-muted mb-1.5">
                {t('preferred_lang')}
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

            {/* Consent Agreement */}
            <div className="pt-2">
              <label className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-subtle border-2 border-border-ui cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={consentAgreed}
                  onChange={(e) => setConsentAgreed(e.target.checked)}
                  className="mt-0.5 rounded-md border-border-ui text-primary focus:ring-primary w-4 h-4"
                />
                <span className="text-xs text-text-muted">
                  {t('consent_text')}
                </span>
              </label>
              {errors.consentAgreed && (
                <p className="text-xs text-danger mt-1">{errors.consentAgreed[0]}</p>
              )}
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50 shadow-md"
              >
                {isLoading ? t('loading_plots') : t('complete_registration')}
                <ArrowRight size={15} />
              </button>
            </div>
          </form>
        )}

        {/* Mode: Claim DA Profile */}
        {mode === 'claim' && (
          <form onSubmit={handleClaimSubmit} className="p-5 sm:p-6 space-y-4">
            <div className="p-4 rounded-xl bg-accent-light border-2 border-accent/40 text-xs text-text-muted">
              <p className="font-bold text-accent mb-1 font-mono uppercase">
                {t('claim_title')}
              </p>
              {t('claim_desc')}
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-text-muted mb-1.5">
                {t('local_id')}
              </label>
              <input
                type="text"
                required
                value={claimLocalId}
                onChange={(e) => setClaimLocalId(e.target.value)}
                placeholder="e.g. LID-12345"
                className="w-full px-3.5 py-2.5 text-sm bg-white rounded-xl border-2 border-border-ui focus:border-accent outline-hidden font-mono"
              />
              {errors.localIdNumber && (
                <p className="text-xs text-danger mt-1">{errors.localIdNumber[0]}</p>
              )}
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={isClaiming}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-accent hover:bg-accent-hover text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50 shadow-md"
              >
                {isClaiming ? t('loading_plots') : t('claim_btn')}
                <UserCheck size={15} />
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  )
}
