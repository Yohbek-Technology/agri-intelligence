'use client'

import React from 'react'
import Link from 'next/link'
import { BrandLogo } from '@/components/ui/brandLogo'

export function Footer() {
  return (
    <footer className="bg-[#060F09] border-t border-emerald-950/80 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          <div className="md:col-span-2 space-y-4">
            <BrandLogo size="lg" showSubtitle={false} />
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Autonomous agronomy intelligence engineered for Ethiopian smallholders, commercial farms, and agricultural extension agencies. Transforming micro-window timing into verifiable yield gains.
            </p>
            <div className="pt-2 flex items-center gap-3 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>National Node Status: Operational (East Shewa Hub)</span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <span className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] block">
              Agronomic Platform
            </span>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#overview" className="hover:text-emerald-400 transition-colors">Yield Protocol Engine</a></li>
              <li><a href="#empirical-trial" className="hover:text-emerald-400 transition-colors">Field Verification Trials</a></li>
              <li><a href="#capabilities" className="hover:text-emerald-400 transition-colors">Multimodal Pest & Blight AI</a></li>
              <li><a href="#capabilities" className="hover:text-emerald-400 transition-colors">7-Day Agro-Weather Radar</a></li>
              <li><a href="#voice-dispatch" className="hover:text-emerald-400 transition-colors">Voice & Kebele Dispatch</a></li>
            </ul>
          </div>

          <div className="space-y-3 text-xs">
            <span className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] block">
              Institutional Partners
            </span>
            <ul className="space-y-2 text-slate-400">
              <li><span className="hover:text-white transition-colors cursor-pointer">Ministry of Agriculture (MoA)</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Ethiopian Agricultural Authority</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Regional Extension Bureaus</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Oromia Cooperative Union Hub</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">National Meteorological Institute</span></li>
            </ul>
          </div>

          <div className="space-y-3 text-xs">
            <span className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] block">
              Technical Specs
            </span>
            <ul className="space-y-2 text-slate-400">
              <li><Link href="/signIn" className="hover:text-emerald-400 transition-colors">Agronomist Portal Access</Link></li>
              <li><Link href="/farmer" className="hover:text-emerald-400 transition-colors">Smallholder Voice Gateway</Link></li>
              <li><Link href="/da" className="hover:text-emerald-400 transition-colors">Kebele DA Offline Mesh</Link></li>
              <li><Link href="/officer" className="hover:text-emerald-400 transition-colors">Woreda Command Console</Link></li>
              <li><span className="text-emerald-400 font-mono text-[11px]">API Engine v2.4 (Abyssinia)</span></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-emerald-950/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
          <div>
            © 2026 AgriIntel Ethiopia. Precision Agronomy Intelligence System. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Ethio Telecom USSD/Voice: Connected
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
