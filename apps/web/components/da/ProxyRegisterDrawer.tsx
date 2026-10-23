'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, UserPlus, ShieldCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { KebeleRow, ProxyFarmerOnboardingInput } from '@repo/shared'

interface ProxyRegisterDrawerProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: ProxyFarmerOnboardingInput) => void
  kebeles: KebeleRow[]
  isLoading: boolean
  errors?: Record<string, string[]>
}

export function ProxyRegisterDrawer({
  open,
  onClose,
  onSubmit,
  kebeles,
  isLoading,
  errors = {},
}: ProxyRegisterDrawerProps) {
  const t = useTranslations('Phase2.da')
  const tFarmer = useTranslations('Phase2.farmer')
  const tPlots = useTranslations('Phase2.plots')

  const [fullName, setFullName] = useState('')
  const [localIdNumber, setLocalIdNumber] = useState('')
  const [kebeleId, setKebeleId] = useState('')
  const [hasNoPhone, setHasNoPhone] = useState(true)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [preferredLanguage, setPreferredLanguage] = useState<'am' | 'om' | 'ti' | 'en'>('am')

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
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
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="w-full max-w-lg h-full bg-surface shadow-2xl flex flex-col border-l-2 border-border-ui overflow-y-auto"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-surface-subtle border-b-2 border-border-ui flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-primary text-white">
              <UserPlus size={18} />
            </span>
            <div>
              <h2 className="text-base font-bold font-mono uppercase tracking-tight text-text-primary">
                {t('proxy_drawer_title')}
              </h2>
              <p className="text-xs text-text-muted">
                {t('proxy_drawer_desc')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-white border border-border-ui transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 flex-1">
          {/* Informational Banner */}
          <div className="p-3.5 rounded-xl bg-primary-light border border-primary/30 text-xs text-primary flex items-start gap-2">
            <ShieldCheck size={16} className="shrink-0 mt-0.5" />
            <span>
              <strong>{t('auto_verify_notice')}</strong>
            </span>
          </div>

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
            {errors.fullName && <p className="text-xs text-danger mt-1">{errors.fullName[0]}</p>}
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
            {errors.localIdNumber && (
              <p className="text-xs text-danger mt-1">{errors.localIdNumber[0]}</p>
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
            {errors.kebeleId && <p className="text-xs text-danger mt-1">{errors.kebeleId[0]}</p>}
          </div>

          {/* Phone Availability */}
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

          {/* Language Selection */}
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

          {/* Footer Actions */}
          <div className="pt-4 border-t border-border-ui flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border-2 border-border-ui text-xs font-mono uppercase font-bold text-text-muted hover:bg-surface-subtle transition-colors cursor-pointer"
            >
              {tPlots('cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-mono uppercase font-bold tracking-wider transition-colors cursor-pointer disabled:opacity-50 shadow-md"
            >
              {isLoading ? t('recording') : t('create_verified_profile')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
