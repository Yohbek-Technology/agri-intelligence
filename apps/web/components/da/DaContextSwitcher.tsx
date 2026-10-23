'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { User, CheckCircle2, ChevronDown, UserPlus, ShieldCheck, MapPin } from 'lucide-react'
import type { FarmerProfileRow } from '@repo/shared'

interface DaContextSwitcherProps {
  activeFarmer: FarmerProfileRow | null
  farmers: FarmerProfileRow[]
  onSelectFarmer: (id: string | null) => void
  onOpenProxyRegister: () => void
  onVerifyFarmer: (id: string) => void
  isVerifying: boolean
}

export function DaContextSwitcher({
  activeFarmer,
  farmers,
  onSelectFarmer,
  onOpenProxyRegister,
  onVerifyFarmer,
  isVerifying,
}: DaContextSwitcherProps) {
  const t = useTranslations('Phase2.da')

  return (
    <div
      className="p-3.5 sm:p-4 rounded-2xl bg-surface mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
      style={{ border: '2px solid var(--color-border-ui)' }}
    >
      {/* Current Active Farmer Context */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-primary-light text-primary border border-primary/30">
          <User size={20} />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-text-faint font-bold">
              {t('active_context')}
            </span>
            {activeFarmer && (
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-md border font-bold uppercase ${
                  activeFarmer.isVerified
                    ? 'bg-success-light text-success border-success/30'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}
              >
                {activeFarmer.isVerified ? t('field_verified') : t('pending_verification')}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            <h2 className="text-base font-bold font-mono text-text-primary uppercase">
              {activeFarmer ? activeFarmer.fullName : t('no_farmer_selected')}
            </h2>
            {activeFarmer && (
              <span className="text-xs font-mono text-text-muted">
                ({activeFarmer.localIdNumber})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Switcher & Actions */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Farmer Select Dropdown */}
        <select
          value={activeFarmer?.id ?? ''}
          onChange={(e) => onSelectFarmer(e.target.value || null)}
          className="px-3.5 py-2 text-xs font-mono bg-surface-subtle border-2 border-border-ui rounded-xl outline-hidden text-text-primary cursor-pointer hover:border-text-faint transition-colors"
        >
          <option value="">{t('switch_farmer')}</option>
          {farmers.map((f) => (
            <option key={f.id} value={f.id}>
              {f.fullName} ({f.localIdNumber})
            </option>
          ))}
        </select>

        {/* Verify Active Farmer Button */}
        {activeFarmer && !activeFarmer.isVerified && (
          <button
            type="button"
            disabled={isVerifying}
            onClick={() => onVerifyFarmer(activeFarmer.id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-success-light hover:bg-success text-success hover:text-white border-2 border-success/40 text-xs font-mono font-bold uppercase transition-all cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 size={14} />
            {isVerifying ? t('verifying') : t('verify_farmer_btn')}
          </button>
        )}

        {/* Register Proxy Farmer Button */}
        <button
          type="button"
          onClick={onOpenProxyRegister}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
        >
          <UserPlus size={14} />
          {t('proxy_register_btn')}
        </button>
      </div>
    </div>
  )
}
