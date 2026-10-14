'use client'

import React from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { BrandLogo } from '@/components/ui/brandLogo'

export function Footer() {
  const t = useTranslations('Footer')

  return (
    <footer className="bg-[#060F09] border-t border-emerald-950/80 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          <div className="md:col-span-2 space-y-4">
            <BrandLogo size="lg" showSubtitle={false} />
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              {t('description')}
            </p>
            <div className="pt-2 flex items-center gap-3 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{t('nodeStatus')}</span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <span className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] block">
              {t('platform')}
            </span>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#overview" className="hover:text-emerald-400 transition-colors">{t('yieldProtocol')}</a></li>
              <li><a href="#empirical-trial" className="hover:text-emerald-400 transition-colors">{t('fieldTrials')}</a></li>
              <li><a href="#capabilities" className="hover:text-emerald-400 transition-colors">{t('pestAI')}</a></li>
              <li><a href="#capabilities" className="hover:text-emerald-400 transition-colors">{t('weatherRadar')}</a></li>
              <li><a href="#voice-dispatch" className="hover:text-emerald-400 transition-colors">{t('voiceDispatch')}</a></li>
            </ul>
          </div>

          <div className="space-y-3 text-xs">
            <span className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] block">
              {t('partners')}
            </span>
            <ul className="space-y-2 text-slate-400">
              <li><span className="hover:text-white transition-colors cursor-pointer">{t('moa')}</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">{t('eaa')}</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">{t('regionalBureaus')}</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">{t('cooperativeHub')}</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">{t('meteorological')}</span></li>
            </ul>
          </div>

          <div className="space-y-3 text-xs">
            <span className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] block">
              {t('technical')}
            </span>
            <ul className="space-y-2 text-slate-400">
              <li><Link href="/signIn" className="hover:text-emerald-400 transition-colors">{t('portalAccess')}</Link></li>
              <li><Link href="/farmer" className="hover:text-emerald-400 transition-colors">{t('voiceGateway')}</Link></li>
              <li><Link href="/da" className="hover:text-emerald-400 transition-colors">{t('offlineMesh')}</Link></li>
              <li><Link href="/officer" className="hover:text-emerald-400 transition-colors">{t('commandConsole')}</Link></li>
              <li><span className="text-emerald-400 font-mono text-[11px]">{t('apiVersion')}</span></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-emerald-950/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
          <div>{t('copyright')}</div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {t('telecomStatus')}
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
