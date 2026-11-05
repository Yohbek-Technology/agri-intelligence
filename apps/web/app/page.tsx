'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import {
  ArrowUpRight,
  CheckCircle2,
  Sprout,
  Tractor,
  ShieldCheck,
  MapPin,
  TrendingUp,
  Volume2,
  Scan,
  CloudSun,
  Award,
  Wheat,
  Layers,
} from 'lucide-react'
import { useAuthSession } from '@/hooks/useAuth'
import { Navbar } from '@/components/navigation/navbar'
import { Footer } from '@/components/navigation/footer'
import { AiAssistantPopup } from '@/components/ai/aiAssistantPopup'

export default function HomePage() {
  const { isAuthenticated, dashboardPath, role } = useAuthSession()
  const t = useTranslations('Landing')
  const tNav = useTranslations('Navbar')

  return (
    <div className="min-h-screen bg-[#faf8f4] text-[#1b2b18] flex flex-col antialiased selection:bg-[#12442b] selection:text-white">
      {/* ── Main Navigation Header (Clean Crisp White, Fully Mobile Responsive) ── */}
      <Navbar
        isAuthenticated={isAuthenticated}
        dashboardPath={dashboardPath}
        role={role}
      />

      <main className="flex-1">
        {/* =========================================================================
            SECTION 1: HERO SECTION (Agriko Big Green Tractor Photo & Hero Text)
            - Responsive padding & text scaling for all mobile screen sizes
            - Redundant carousel arrows removed to eliminate mobile clutter & confusion
            ========================================================================= */}
        <section
          id="home"
          tabIndex={-1}
          className="relative min-h-[560px] sm:min-h-[640px] lg:min-h-[760px] flex items-center overflow-hidden bg-[#0d2e1c] outline-none"
        >
          {/* Hero Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/hero-tractor.jpg"
              alt="Modern green tractor in agricultural farm field"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center scale-[1.01]"
            />
            {/* Dark left gradient overlay for contrast while keeping photo visible */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30 pointer-events-none" />
            <div className="absolute inset-0 bg-[#0d2e1c]/30 pointer-events-none mix-blend-multiply" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-14 sm:py-20 lg:py-28 w-full">
            <div className="max-w-2xl text-left space-y-4 sm:space-y-6">
              {/* Massive Main Title - Fluid responsive scaling */}
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-[1.12] sm:leading-[1.08] tracking-tight drop-shadow-md break-words"
              >
                {t('heroTitle')}
              </motion.h1>

              {/* Subtext Paragraph */}
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="text-xs sm:text-base lg:text-lg text-white/90 leading-relaxed font-normal max-w-xl drop-shadow-sm"
              >
                {t('heroDesc')}
              </motion.p>

              {/* Action Buttons: Stacks neatly on small mobile screens, inline on tablet/desktop */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto"
              >
                <a href="#services" className="w-full sm:w-auto">
                  <button
                    type="button"
                    className="w-full sm:w-auto bg-white hover:bg-[#f3ede0] text-[#144228] font-extrabold text-xs sm:text-sm px-6 sm:px-8 py-3.5 sm:py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{t('exploreServices')}</span>
                    <ArrowUpRight className="w-4 h-4 text-[#144228]" />
                  </button>
                </a>

                {isAuthenticated ? (
                  <Link href={dashboardPath} className="w-full sm:w-auto">
                    <button
                      type="button"
                      className="w-full sm:w-auto bg-black/40 hover:bg-black/55 backdrop-blur-md text-white border-2 border-white/60 hover:border-white font-bold text-xs sm:text-sm px-6 sm:px-8 py-3 sm:py-3.5 rounded-full shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>{t('openWorkspace')} ({role || tNav('operator')})</span>
                    </button>
                  </Link>
                ) : (
                  <Link href="/signIn" className="w-full sm:w-auto">
                    <button
                      type="button"
                      className="w-full sm:w-auto bg-black/40 hover:bg-black/55 backdrop-blur-md text-white border-2 border-white/60 hover:border-white font-bold text-xs sm:text-sm px-6 sm:px-8 py-3 sm:py-3.5 rounded-full shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>{t('discoverMore')}</span>
                    </button>
                  </Link>
                )}
              </motion.div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 2: THREE OVERLAPPING FEATURE CARDS (Signature Agriko Component!)
            - mt-6 on mobile so it doesn't overlap/obscure hero action buttons
            - sm:-mt-16 lg:-mt-24 on tablet/desktop for the signature Agriko overlapping effect
            ========================================================================= */}
        <section className="relative z-20 mt-6 sm:-mt-16 lg:-mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 shadow-2xl rounded-3xl overflow-hidden border border-[#d6cfbe]">
            {/* CARD 1: Deep Forest Green (#134e30) */}
            <div className="bg-[#124b2f] text-white p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden group">
              <Tractor className="absolute -bottom-6 -right-6 w-36 h-36 text-white/5 pointer-events-none transition-transform group-hover:scale-110" />

              <div className="space-y-3 sm:space-y-4 relative z-10">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 border border-white/15 text-[#86efac]">
                  <Sprout className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  {t('profFarmers')}
                </h3>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-normal">
                  {t('profFarmersDesc')}
                </p>
              </div>

              <div className="pt-6 sm:pt-8 relative z-10">
                <Link
                  href="/farmer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#86efac] hover:text-white transition-colors"
                >
                  <span>{t('discoverMore')}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* CARD 2: Warm Harvest Mustard Yellow (#e7b028) */}
            <div className="bg-[#e7b028] text-[#1b2b18] p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden group">
              <Wheat className="absolute -bottom-6 -right-6 w-36 h-36 text-black/5 pointer-events-none transition-transform group-hover:scale-110" />

              <div className="space-y-3 sm:space-y-4 relative z-10">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-black/10 border border-black/10 text-[#1b2b18]">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  {t('organicSolutions')}
                </h3>
                <p className="text-xs sm:text-sm text-[#353f2c] leading-relaxed font-normal">
                  {t('organicSolutionsDesc')}
                </p>
              </div>

              <div className="pt-6 sm:pt-8 relative z-10">
                <a
                  href="#services"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1b2b18] hover:text-black transition-colors"
                >
                  <span>{t('discoverMore')}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* CARD 3: Soft Butter Cream (#f7f1e3) with Stamp & Avatars */}
            <div className="bg-[#f7f1e3] text-[#163824] p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden group">
              <div className="space-y-3 sm:space-y-4 relative z-10">
                <div className="flex items-center justify-between gap-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#124b2f]/10 text-[#124b2f]">
                    <ShieldCheck className="w-6 h-6" />
                  </div>

                  {/* Certified Smart Farming Stamp Badge (Agriko emblem) */}
                  <div className="flex items-center gap-2 bg-white/80 border border-[#d8cfbc] px-3 py-1.5 rounded-full shadow-xs">
                    <Award className="w-4 h-4 text-[#124b2f]" />
                    <span className="text-[10px] font-extrabold tracking-wider text-[#124b2f] uppercase">
                      {t('certifiedSmartAg')}
                    </span>
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  {t('ourValues')}
                </h3>
                <p className="text-xs sm:text-sm text-[#4d594b] leading-relaxed font-normal">
                  {t('ourValuesDesc')}
                </p>
              </div>

              <div className="pt-6 sm:pt-8 flex items-center justify-between gap-4 relative z-10 border-t border-[#e2d8c3] mt-4 sm:mt-6">
                <a
                  href="#about"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#124b2f] hover:text-[#0b2918] transition-colors"
                >
                  <span>{t('discoverMore')}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>

                {/* Overlapping team/farmer avatars */}
                <div className="flex items-center -space-x-2">
                  <div className="w-7 h-7 rounded-full bg-[#124b2f] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                    YA
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#e7b028] text-[#1b2b18] text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                    BK
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#3d6636] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                    LM
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#124b2f] text-[#86efac] text-[11px] font-extrabold flex items-center justify-center ring-2 ring-white">
                    +
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 3: ABOUT US SECTION ("Currently we are growing and selling...")
            ========================================================================= */}
        <section id="about" tabIndex={-1} className="scroll-mt-20 sm:scroll-mt-24 py-16 sm:py-24 lg:py-32 bg-[#faf8f4] outline-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16 items-center">
              {/* Left Column: Typography & Content */}
              <div className="lg:col-span-6 space-y-4 sm:space-y-6">
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#143d26] leading-tight tracking-tight">
                  {t('aboutTitle')}
                </h2>

                <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-[#4b5847] leading-relaxed">
                  <p>{t('aboutP1')}</p>
                  <p>{t('aboutP2')}</p>
                </div>

                {/* Dual Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1 sm:pt-2">
                  <a href="#services">
                    <button
                      type="button"
                      className="bg-[#e7b028] hover:bg-[#d69f1a] text-[#1b2b18] font-bold text-xs sm:text-sm px-6 py-3 rounded-full shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>{t('discoverMore')}</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </a>
                  <a href="#contact">
                    <button
                      type="button"
                      className="bg-white hover:bg-[#f3ede0] text-[#143d26] border border-[#d6cfbe] font-bold text-xs sm:text-sm px-6 py-3 rounded-full shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>{t('contactUs')}</span>
                    </button>
                  </a>
                </div>

                {/* Highlight Quote Box */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#f4ede0] border-l-4 border-[#e7b028] text-xs sm:text-sm text-[#273824] italic leading-relaxed">
                  &ldquo;{t('aboutQuote')}&rdquo;
                </div>

                {/* Bullet Checklist with Golden Check Circles */}
                <div className="space-y-2.5 sm:space-y-3 pt-1 sm:pt-2">
                  <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-[#1b2b18]">
                    <span className="w-5 h-5 rounded-full bg-[#fcedc7] text-[#c78326] flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                    <span>{t('aboutCheck1')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-[#1b2b18]">
                    <span className="w-5 h-5 rounded-full bg-[#fcedc7] text-[#c78326] flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                    <span>{t('aboutCheck2')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-[#1b2b18]">
                    <span className="w-5 h-5 rounded-full bg-[#fcedc7] text-[#c78326] flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                    <span>{t('aboutCheck3')}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Imagery with 3 Floating Boxes */}
              <div className="lg:col-span-6 space-y-4">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-[#ded7c8] aspect-[4/3] sm:aspect-[16/11]">
                  <Image
                    src="/images/about-crops.jpg"
                    alt="Fresh organic green crops and healthy harvest"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* 3 Attached Feature Highlight Cards */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1 sm:pt-2">
                  {/* Highlight 1: Forest Green */}
                  <div className="bg-[#124b2f] text-white p-3 sm:p-4 rounded-2xl flex flex-col items-center text-center justify-center space-y-1 sm:space-y-1.5 shadow-md">
                    <Sprout className="w-4 h-4 sm:w-5 sm:h-5 text-[#86efac]" />
                    <span className="text-[10px] sm:text-[11px] font-extrabold leading-tight">
                      {t('organicBadge')}
                    </span>
                  </div>

                  {/* Highlight 2: White Card */}
                  <div className="bg-white border border-[#ded7c8] text-[#143d26] p-3 sm:p-4 rounded-2xl flex flex-col items-center text-center justify-center space-y-1 sm:space-y-1.5 shadow-sm">
                    <Tractor className="w-4 h-4 sm:w-5 sm:h-5 text-[#c78326]" />
                    <span className="text-[10px] sm:text-[11px] font-extrabold leading-tight">
                      {t('agriBadge')}
                    </span>
                  </div>

                  {/* Highlight 3: White Card */}
                  <div className="bg-white border border-[#ded7c8] text-[#143d26] p-3 sm:p-4 rounded-2xl flex flex-col items-center text-center justify-center space-y-1 sm:space-y-1.5 shadow-sm">
                    <Wheat className="w-4 h-4 sm:w-5 sm:h-5 text-[#124b2f]" />
                    <span className="text-[10px] sm:text-[11px] font-extrabold leading-tight">
                      {t('vegBadge')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            NATURAL GRASS DIVIDER TRANSITION (Agriko Signature Border)
            ========================================================================= */}
        <div className="relative w-full overflow-hidden leading-none text-[#1b5e39] py-1 sm:py-2 bg-[#faf8f4]">
          <svg
            className="w-full h-8 sm:h-12 text-[#24613b]/20"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            fill="currentColor"
          >
            <path d="M0,0 C150,90 350,-40 500,60 C650,140 900,10 1200,40 L1200,120 L0,120 Z" />
          </svg>
        </div>

        {/* =========================================================================
            SECTION 4: SERVICES SECTION ("Innovative solutions for agriculture...")
            ========================================================================= */}
        <section id="services" tabIndex={-1} className="scroll-mt-20 sm:scroll-mt-24 py-16 sm:py-24 bg-[#f3ede0] outline-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-14">
            {/* Header: Left Title, Right Description */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-end">
              <div className="lg:col-span-7 space-y-2 sm:space-y-3">
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#143d26] leading-tight tracking-tight">
                  {t('servicesTitle')}
                </h2>
              </div>
              <div className="lg:col-span-5 text-xs sm:text-sm text-[#4b5847] leading-relaxed">
                {t('servicesDesc')}
              </div>
            </div>

            {/* 4 Cards Grid with Real Photography Headers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Service Card 1 */}
              <div className="bg-white rounded-3xl overflow-hidden border border-[#ded7c8] shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                <div>
                  <div className="relative h-44 sm:h-48 w-full overflow-hidden">
                    <Image
                      src="/images/service-field.jpg"
                      alt="Precision Soil & Micro-Climate Telemetry"
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#124b2f] text-white flex items-center justify-center shadow-md">
                      <CloudSun className="w-5 h-5 text-[#86efac]" />
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 space-y-2">
                    <h3 className="text-base sm:text-lg font-extrabold text-[#143d26]">
                      {t('service1Title')}
                    </h3>
                    <p className="text-xs text-[#52604e] leading-relaxed">
                      {t('service1Desc')}
                    </p>
                  </div>
                </div>

                <div className="p-5 sm:p-6 pt-0">
                  <a
                    href="#empirical-trial"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#124b2f] hover:text-[#c78326] transition-colors"
                  >
                    <span>{t('readMore')}</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Service Card 2 */}
              <div className="bg-white rounded-3xl overflow-hidden border border-[#ded7c8] shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                <div>
                  <div className="relative h-44 sm:h-48 w-full overflow-hidden">
                    <Image
                      src="/images/service-farmer.jpg"
                      alt="AI Crop Disease Detection"
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#e7b028] text-[#1b2b18] flex items-center justify-center shadow-md">
                      <Scan className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 space-y-2">
                    <h3 className="text-base sm:text-lg font-extrabold text-[#143d26]">
                      {t('service2Title')}
                    </h3>
                    <p className="text-xs text-[#52604e] leading-relaxed">
                      {t('service2Desc')}
                    </p>
                  </div>
                </div>

                <div className="p-5 sm:p-6 pt-0">
                  <Link
                    href="/farmer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#124b2f] hover:text-[#c78326] transition-colors"
                  >
                    <span>{t('readMore')}</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Service Card 3 */}
              <div className="bg-white rounded-3xl overflow-hidden border border-[#ded7c8] shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                <div>
                  <div className="relative h-44 sm:h-48 w-full overflow-hidden">
                    <Image
                      src="/images/about-crops.jpg"
                      alt="Multilingual Voice (IVR) & SMS Advisory"
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#124b2f] text-white flex items-center justify-center shadow-md">
                      <Volume2 className="w-5 h-5 text-[#86efac]" />
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 space-y-2">
                    <h3 className="text-base sm:text-lg font-extrabold text-[#143d26]">
                      {t('service3Title')}
                    </h3>
                    <p className="text-xs text-[#52604e] leading-relaxed">
                      {t('service3Desc')}
                    </p>
                  </div>
                </div>

                <div className="p-5 sm:p-6 pt-0">
                  <a
                    href="#contact"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#124b2f] hover:text-[#c78326] transition-colors"
                  >
                    <span>{t('readMore')}</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Service Card 4 */}
              <div className="bg-white rounded-3xl overflow-hidden border border-[#ded7c8] shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                <div>
                  <div className="relative h-44 sm:h-48 w-full overflow-hidden">
                    <Image
                      src="/images/service-harvest.jpg"
                      alt="Market Intelligence & Commodity Pricing"
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#e7b028] text-[#1b2b18] flex items-center justify-center shadow-md">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 space-y-2">
                    <h3 className="text-base sm:text-lg font-extrabold text-[#143d26]">
                      {t('service4Title')}
                    </h3>
                    <p className="text-xs text-[#52604e] leading-relaxed">
                      {t('service4Desc')}
                    </p>
                  </div>
                </div>

                <div className="p-5 sm:p-6 pt-0">
                  <Link
                    href="/officer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#124b2f] hover:text-[#c78326] transition-colors"
                  >
                    <span>{t('readMore')}</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 5: HIGH-IMPACT TRANSITION BANNER ("Helping farmers in their transition...")
            ========================================================================= */}
        <section className="py-16 sm:py-20 bg-[#12442b] text-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-center">
              <div className="lg:col-span-6 space-y-3 sm:space-y-4">
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight">
                  {t('impactTitle')}
                </h2>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-xl">
                  {t('impactDesc')}
                </p>
              </div>

              {/* National Stats Strip */}
              <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 sm:p-5 rounded-2xl text-center space-y-1">
                  <div className="text-2xl sm:text-4xl font-extrabold text-[#86efac] font-mono">
                    98.4%
                  </div>
                  <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-white/70 font-semibold">
                    {t('precisionRate')}
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 sm:p-5 rounded-2xl text-center space-y-1">
                  <div className="text-2xl sm:text-4xl font-extrabold text-[#e7b028] font-mono">
                    120k+
                  </div>
                  <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-white/70 font-semibold">
                    {t('activeFarmers')}
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 sm:p-5 rounded-2xl text-center space-y-1">
                  <div className="text-2xl sm:text-4xl font-extrabold text-[#86efac] font-mono">
                    850+
                  </div>
                  <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-white/70 font-semibold">
                    {t('kebeleDAs')}
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 sm:p-5 rounded-2xl text-center space-y-1">
                  <div className="text-2xl sm:text-4xl font-extrabold text-[#e7b028] font-mono">
                    35+
                  </div>
                  <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-white/70 font-semibold">
                    {t('woredas')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 6: EMPIRICAL TRIAL (The 34.2 vs. 12.8 Quintal Reality)
            ========================================================================= */}
        <section id="empirical-trial" tabIndex={-1} className="scroll-mt-20 sm:scroll-mt-24 py-16 sm:py-24 bg-[#faf8f4] outline-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
              <div className="max-w-3xl space-y-2 sm:space-y-3">
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#143d26] leading-tight tracking-tight">
                  {t('trialTitle')}
                </h2>
                <p className="text-xs sm:text-sm text-[#4b5847] leading-relaxed">
                  {t('trialDesc')}
                </p>
              </div>

              <div className="flex items-center gap-2 bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-[#ded7c8] shadow-xs self-start md:self-auto">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#124b2f]" />
                <span className="text-xs font-bold text-[#143d26]">{t('eastShewa')}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#eaf7ee] text-[#124b2f] font-bold">
                  {t('verifiedYear')}
                </span>
              </div>
            </div>

            {/* Comparison Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* AgriIntel Protocol */}
              <div className="lg:col-span-6 bg-white rounded-3xl border-2 border-[#124b2f] p-6 sm:p-8 shadow-xl flex flex-col justify-between relative overflow-hidden">
                <div className="space-y-5 sm:space-y-6">
                  <div className="flex items-start justify-between gap-4 pb-5 sm:pb-6 border-b border-[#f0ebe0]">
                    <div>
                      <h3 className="text-lg sm:text-xl font-extrabold text-[#143d26]">
                        {t('agriProtocol')}
                      </h3>
                      <p className="text-xs text-[#52604e] mt-1">
                        {t('agriCompliance')}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl sm:text-5xl font-black text-[#124b2f] font-mono">
                        34.2
                      </div>
                      <div className="text-[10px] font-mono text-[#52604e] uppercase">
                        {t('quintalHectare')}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-start gap-3">
                      <span className="font-mono font-bold text-[#124b2f] bg-[#eaf7ee] px-2 py-1 rounded-md shrink-0">
                        01
                      </span>
                      <div>
                        <span className="font-bold text-[#143d26] block">{t('step1Title')}</span>
                        <span className="text-[#52604e]">{t('step1Desc')}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="font-mono font-bold text-[#124b2f] bg-[#eaf7ee] px-2 py-1 rounded-md shrink-0">
                        02
                      </span>
                      <div>
                        <span className="font-bold text-[#143d26] block">{t('step2Title')}</span>
                        <span className="text-[#52604e]">{t('step2Desc')}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="font-mono font-bold text-[#124b2f] bg-[#eaf7ee] px-2 py-1 rounded-md shrink-0">
                        03
                      </span>
                      <div>
                        <span className="font-bold text-[#143d26] block">{t('step3Title')}</span>
                        <span className="text-[#52604e]">{t('step3Desc')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 sm:mt-8 pt-4 border-t border-[#f0ebe0] flex items-center justify-between text-xs font-bold text-[#124b2f]">
                  <span>{t('calculatedNet')}</span>
                  <span className="font-mono text-sm sm:text-base text-[#124b2f]">+171,000 ETB / ha</span>
                </div>
              </div>

              {/* Traditional Baseline */}
              <div className="lg:col-span-6 bg-[#f7f2e8] rounded-3xl border border-[#ded7c8] p-6 sm:p-8 shadow-sm flex flex-col justify-between">
                <div className="space-y-5 sm:space-y-6">
                  <div className="flex items-start justify-between gap-4 pb-5 sm:pb-6 border-b border-[#e5dfd2]">
                    <div>
                      <h3 className="text-lg sm:text-xl font-extrabold text-[#3d4b38]">
                        {t('traditionalControl')}
                      </h3>
                      <p className="text-xs text-[#6e7d69] mt-1">
                        {t('calendarGuessing')}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl sm:text-5xl font-black text-[#5e6b5a] font-mono">
                        12.8
                      </div>
                      <div className="text-[10px] font-mono text-[#6e7d69] uppercase">
                        {t('quintalHectare')}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs text-[#566352]">
                    <div className="flex items-start gap-3">
                      <span className="font-mono font-bold text-[#5e6b5a] bg-black/5 px-2 py-1 rounded-md shrink-0">
                        01
                      </span>
                      <div>
                        <span className="font-bold text-[#2d3929] block">{t('ctrl1Title')}</span>
                        <span className="text-[#566352]">{t('ctrl1Desc')}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="font-mono font-bold text-[#5e6b5a] bg-black/5 px-2 py-1 rounded-md shrink-0">
                        02
                      </span>
                      <div>
                        <span className="font-bold text-[#2d3929] block">{t('ctrl2Title')}</span>
                        <span className="text-[#566352]">{t('ctrl2Desc')}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="font-mono font-bold text-[#5e6b5a] bg-black/5 px-2 py-1 rounded-md shrink-0">
                        03
                      </span>
                      <div>
                        <span className="font-bold text-[#2d3929] block">{t('ctrl3Title')}</span>
                        <span className="text-[#566352]">{t('ctrl3Desc')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 sm:mt-8 pt-4 border-t border-[#e5dfd2] flex items-center justify-between text-xs font-bold text-[#566352]">
                  <span>{t('baselineNet')}</span>
                  <span className="font-mono text-sm sm:text-base">64,000 ETB / ha</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 7: FARMER TESTIMONIAL ("Dividing time and effort to provide quality services")
            ========================================================================= */}
        <section className="py-16 sm:py-24 bg-[#f3ede0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-3xl p-6 sm:p-14 border border-[#ded7c8] shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-center">
              <div className="lg:col-span-4 flex justify-center">
                <div className="relative w-44 h-44 sm:w-64 sm:h-64 rounded-full overflow-hidden border-4 border-[#e7b028] shadow-xl">
                  <Image
                    src="/images/farmer-testimonial.jpg"
                    alt={t('farmerName')}
                    fill
                    sizes="256px"
                    className="object-cover object-top"
                  />
                </div>
              </div>

              <div className="lg:col-span-8 space-y-4 sm:space-y-6 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-1 text-[#e7b028]">
                  {'★'.repeat(5)}
                </div>

                <blockquote className="text-base sm:text-2xl font-bold text-[#143d26] leading-snug">
                  {t('quote')}
                </blockquote>

                <div>
                  <div className="text-base font-extrabold text-[#143d26]">
                    {t('farmerName')}
                  </div>
                  <div className="text-xs text-[#52604e]">
                    {t('farmerRole')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Global Agriko Footer ── */}
      <Footer />

      {/* ── Interactive AI Assistant Popup ── */}
      <AiAssistantPopup />
    </div>
  )
}
