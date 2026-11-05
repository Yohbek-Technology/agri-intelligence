'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Mail, Phone, MapPin, Send, ArrowUpRight, ShieldCheck } from 'lucide-react'
import { BrandLogo } from '@/components/ui/brandLogo'

export function Footer() {
  const [subscribed, setSubscribed] = useState(false)
  const [email, setEmail] = useState('')
  const t = useTranslations('Footer')
  const tNav = useTranslations('Navbar')

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
      setEmail('')
    }
  }

  return (
    <footer id="contact" className="scroll-mt-20 bg-[#0f3420] text-white border-t border-[#185333]">
      {/* ── Newsletter / Broadcast Subscription Strip ── */}
      <div className="border-b border-[#185333]/70 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {t('subscribeTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-[#9ec4a7]">
              {t('subscribeDesc')}
            </p>
          </div>

          <form
            onSubmit={handleSubscribe}
            className="w-full md:w-auto flex items-center gap-2 max-w-md"
          >
            {subscribed ? (
              <div className="bg-[#1b5e39] text-[#86efac] px-5 py-3 rounded-full text-xs font-semibold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span>{t('subscribedSuccess')}</span>
              </div>
            ) : (
              <div className="flex w-full rounded-full bg-white/10 p-1 border border-white/20 focus-within:border-[#e7b028] transition-colors">
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('subscribePlaceholder')}
                  required
                  className="bg-transparent text-xs text-white placeholder-white/60 px-4 py-2.5 outline-none flex-1 min-w-0"
                />
                <button
                  type="submit"
                  className="bg-[#e7b028] hover:bg-[#d69f1a] text-[#1a2f19] px-5 py-2.5 rounded-full font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <span>{t('subscribeBtn')}</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* ── Main Footer Columns ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Column 1: Brand & Bio */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo size="md" showSubtitle={false} className="py-0" />
            <p className="text-xs sm:text-sm text-[#9ec4a7] leading-relaxed max-w-sm">
              {t('footerDesc')}
            </p>
            <div className="pt-2 flex items-center gap-3 text-xs text-[#86efac]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#86efac] animate-pulse" />
              <span className="font-mono">{t('nationalNetwork')}</span>
            </div>
          </div>

          {/* Column 2: Platform Solutions */}
          <div className="space-y-3 text-xs">
            <span className="font-bold text-white uppercase tracking-wider text-[11px] block text-[#e7b028]">
              {t('platformSolutions')}
            </span>
            <ul className="space-y-2.5 text-[#9ec4a7]">
              <li>
                <a href="#services" className="hover:text-white transition-colors flex items-center gap-1">
                  Soil Moisture &amp; Weather Telemetry
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-white transition-colors flex items-center gap-1">
                  Crop Disease &amp; Pest AI Diagnostic
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-white transition-colors flex items-center gap-1">
                  Multilingual Voice (IVR) &amp; SMS
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-white transition-colors flex items-center gap-1">
                  Commodity Pricing &amp; Market Intel
                </a>
              </li>
              <li>
                <a href="#empirical-trial" className="hover:text-white transition-colors flex items-center gap-1">
                  Lume Woreda Empirical Yield Trial
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Portals & Access */}
          <div className="space-y-3 text-xs">
            <span className="font-bold text-white uppercase tracking-wider text-[11px] block text-[#e7b028]">
              {t('portalsHubs')}
            </span>
            <ul className="space-y-2.5 text-[#9ec4a7]">
              <li>
                <Link href="/farmer" className="hover:text-white transition-colors flex items-center gap-1">
                  {tNav('farmerPortal')} <ArrowUpRight className="w-3 h-3 text-[#e7b028]" />
                </Link>
              </li>
              <li>
                <Link href="/da" className="hover:text-white transition-colors flex items-center gap-1">
                  {tNav('daPortal')} <ArrowUpRight className="w-3 h-3 text-[#e7b028]" />
                </Link>
              </li>
              <li>
                <Link href="/officer" className="hover:text-white transition-colors flex items-center gap-1">
                  {tNav('officerPortal')} <ArrowUpRight className="w-3 h-3 text-[#e7b028]" />
                </Link>
              </li>
              <li>
                <Link href="/signIn" className="hover:text-white transition-colors flex items-center gap-1">
                  {tNav('signIn')}
                </Link>
              </li>
              <li>
                <Link href="/signUp" className="hover:text-white transition-colors flex items-center gap-1">
                  {tNav('signUp')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Information */}
          <div className="space-y-3 text-xs">
            <span className="font-bold text-white uppercase tracking-wider text-[11px] block text-[#e7b028]">
              {t('contactSupport')}
            </span>
            <div className="space-y-3 text-[#9ec4a7]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#e7b028] shrink-0 mt-0.5" />
                <span>{t('address')}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#e7b028] shrink-0" />
                <span className="font-mono">+251 911 000 000 / 8028</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#e7b028] shrink-0" />
                <span>support@agriintel.et</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="mt-14 pt-8 border-t border-[#185333] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7aa985]">
          <div>
            &copy; {new Date().getFullYear()} {t('allRightsReserved')}
          </div>
          <div className="flex items-center gap-6 font-medium">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Security</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
