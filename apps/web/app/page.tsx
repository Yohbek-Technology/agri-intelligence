'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { useTranslations } from 'next-intl'
import {
  ArrowUpRight,
  ArrowRight,
  CheckCircle2,
  PhoneCall,
  MessageSquareText,
  ShieldCheck,
  MapPin,
  TrendingUp,
  Volume2,
  Scan,
  CloudSun,
  PackageCheck,
  Play,
  Pause,
} from 'lucide-react'
import { useAuthSession } from '@/hooks/useAuth'
import { Navbar } from '@/components/navigation/navbar'
import { Footer } from '@/components/navigation/footer'
import { Button } from '@/components/ui/button'
import { AiAssistantPopup } from '@/components/ai/aiAssistantPopup'

// Character-by-character fast staggered reveal animation inspired by yohajoh.tech
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.015, delayChildren: 0.04 },
  },
}

const letterVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
    filter: 'blur(5px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      type: 'spring' as const,
      damping: 20,
      stiffness: 240,
    },
  },
}

function AnimatedCharacterTitle({
  text,
  className = '',
  highlightWords = [],
  highlightClass = 'text-[var(--color-primary)]',
  as: Component = 'h2',
}: {
  text: string
  className?: string
  highlightWords?: string[]
  highlightClass?: string
  as?: 'h1' | 'h2' | 'h3'
}) {
  const words = text.split(' ')
  const MotionHeading = Component === 'h1' ? motion.h1 : Component === 'h3' ? motion.h3 : motion.h2

  return (
    <MotionHeading
      className={`flex flex-wrap gap-x-[0.26em] ${className}`}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
    >
      {words.map((word, wordIndex) => {
        const isHighlight = highlightWords.some(hw => word.toLowerCase().includes(hw.toLowerCase()))
        return (
          <motion.span
            key={wordIndex}
            variants={letterVariants}
            className={`inline-block whitespace-nowrap ${isHighlight ? highlightClass : ''}`}
          >
            {word}
          </motion.span>
        )
      })}
    </MotionHeading>
  )
}

const cardMotion = (delay = 0) => ({
  initial: { opacity: 0, y: 26, filter: 'blur(4px)' },
  whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.55, delay, ease: 'easeOut' as const }
})

export default function HomePage() {
  const { isAuthenticated, dashboardPath, role } = useAuthSession()
  const t = useTranslations('HomePage')
  const [emailOrPhone, setEmailOrPhone] = useState('')
  const [ctaSubmitted, setCtaSubmitted] = useState(false)

  // Interactive Showcase State for "Engineered for High-Stakes Agriculture" (inspired by yohajoh.tech)
  const [activePillar, setActivePillar] = useState(0)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)

  const handleCtaSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (emailOrPhone.trim()) {
      setCtaSubmitted(true)
    }
  }

  const pillars = [
    {
      id: 'voice',
      number: '01',
      navTitle: t('pillar1NavTitle'),
      headline: t('pillar1Headline'),
      summary: t('pillar1Summary'),
      tags: ['Afan Oromo', 'Amharic', 'USSD Fallback', 'Ethio Telecom SIP'],
      icon: Volume2,
      previewTitle: t('pillar1PreviewTitle'),
      actionText: t('pillar1ActionText'),
      details: {
        dialTime: t('pillar1DialTime'),
        target: t('pillar1Target'),
        messageSample: '\u201cYeroo ammaa kana dhukkubni wajjoo (stripe rust) baay\u2019ee waan jiruuf, dafanii qoricha farra fangasii biifaa.\u201d',
        confidenceRate: t('pillar1ConfidenceRate'),
      }
    },
    {
      id: 'ai',
      number: '02',
      navTitle: t('pillar2NavTitle'),
      headline: t('pillar2Headline'),
      summary: t('pillar2Summary'),
      tags: ['Edge TFLite', 'Stripe Rust', 'Stem Borer', 'Offline SQLite', '98.4% Confidence'],
      icon: Scan,
      previewTitle: t('pillar2PreviewTitle'),
      actionText: t('pillar2ActionText'),
      details: {
        specimen: t('pillar2Specimen'),
        condition: t('pillar2Condition'),
        severity: t('pillar2Severity'),
        prescription: t('pillar2Prescription'),
      }
    },
    {
      id: 'weather',
      number: '03',
      navTitle: t('pillar3NavTitle'),
      headline: t('pillar3Headline'),
      summary: t('pillar3Summary'),
      tags: ['ECMWF 0.1\u00b0 Mesh', 'Soil Saturation 84%', 'Wind Shear <6km/h', 'Radar Sync'],
      icon: CloudSun,
      previewTitle: t('pillar3PreviewTitle'),
      actionText: t('pillar3ActionText'),
      details: {
        windowType: t('pillar3WindowType'),
        calculatedWindow: t('pillar3Window'),
        precipitationForecast: t('pillar3Rain'),
        absorptionAdvantage: t('pillar3Advantage'),
      }
    },
    {
      id: 'inputs',
      number: '04',
      navTitle: t('pillar4NavTitle'),
      headline: t('pillar4Headline'),
      summary: t('pillar4Summary'),
      tags: ['Cooperative Union', 'Certified Quncho Teff', 'NPS Boron', 'Batch QR Verified'],
      icon: PackageCheck,
      previewTitle: t('pillar4PreviewTitle'),
      actionText: t('pillar4ActionText'),
      details: {
        verifiedBatch: t('pillar4Batch'),
        certificationAuthority: t('pillar4Authority'),
        depotHub: t('pillar4Depot'),
        purityScore: t('pillar4Purity'),
      }
    }
  ]
  const currentPillar = pillars[activePillar]!

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)] flex flex-col antialiased selection:bg-[var(--color-primary)] selection:text-white">
      {/* Floating Pill Navigation */}
      <Navbar
        isAuthenticated={isAuthenticated}
        dashboardPath={dashboardPath}
        role={role}
      />

      <main className="flex-1">
        {/* =========================================================================
            SECTION 1: HERO SECTION
            - Starts at 0px top (zero top margin)
            - 90% Clear & Vivid Ethiopian Highland Terraces Sunrise Image (10% subtle overlay)
            - Fast character-animated Title
            ========================================================================= */}
        <section
          id="overview"
          className="relative min-h-[95vh] flex items-center justify-center overflow-hidden m-0 p-0 pt-28 pb-32 md:pt-36 md:pb-40"
          style={{ marginTop: 0 }}
        >
          {/* Stunning Background Image - 90% CLEAR & VISIBLE (Only 10% Overlay) */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/hero-bg.jpg"
              alt="Ethiopian highland agricultural crop terraces at sunrise"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center scale-[1.02]"
            />
            {/* Exactly 10% subtle tint overlay as requested */}
            <div className="absolute inset-0 bg-black/10 pointer-events-none" />

            {/* Seamless gentle transition into page background at bottom */}
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--color-background)] via-[var(--color-background)]/50 to-transparent pointer-events-none" />
          </div>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            {/* Glassmorphic backplate for pristine typography legibility while keeping image 90% visible */}
            <div className="bg-black/25 backdrop-blur-[4px] border border-white/20 rounded-3xl p-6 sm:p-10 md:p-14 shadow-2xl">
              {/* Character-by-character animated headline */}
              <AnimatedCharacterTitle
                as="h1"
                text={t('heroTitle')}
                highlightWords={['Timing.']}
                highlightClass="text-[#A3E635] drop-shadow-[0_0_35px_rgba(163,230,53,0.7)]"
                className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.08] max-w-4xl mx-auto justify-center text-center drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]"
              />

              {/* Subtitle Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' as const }}
                className="mt-6 text-base sm:text-lg text-white font-normal max-w-2xl mx-auto leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]"
              >
                {t('heroSubtitle')}
              </motion.p>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' as const }}
                className="mt-9 flex flex-wrap items-center justify-center gap-4"
              >
                {isAuthenticated ? (
                  <Link href={dashboardPath}>
                    <Button
                      size="lg"
                      className="rounded-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-semibold px-8 py-3.5 shadow-xl shadow-black/30 flex items-center gap-2 cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                    >
                      {t('openWorkspace')} ({role || 'Operator'}) <ArrowUpRight className="w-4 h-4" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/signUp">
                    <Button
                      size="lg"
                      className="rounded-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-semibold px-8 py-3.5 shadow-xl shadow-black/30 flex items-center gap-2 cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                    >
                      {t('openPortal')}
                    </Button>
                  </Link>
                )}

                <a href="#empirical-trial">
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-full bg-white/20 hover:bg-white/30 text-white border-white/40 px-7 py-3.5 backdrop-blur-md flex items-center gap-2 cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                  >
                    {t('requestDeployment')}
                  </Button>
                </a>

                <a
                  href="#capabilities"
                  className="text-white hover:text-[#A3E635] text-sm font-semibold px-4 py-3.5 inline-flex items-center gap-1.5 transition-colors drop-shadow-md"
                >
                  {t('ourCapabilities')} <ArrowRight className="w-4 h-4" />
                </a>
              </motion.div>

              {/* Credibility Trust Bar */}
              {/* <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mt-12 pt-6 border-t border-white/20 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-white/95 font-medium drop-shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#A3E635]" />
                  <span>98.4% Woreda-Level Precision</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#A3E635]" />
                  <span>Low-Latency Kebele Dispatches</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#A3E635]" />
                  <span>No Hardware Required for Smallholders</span>
                </div>
              </motion.div> */}
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 2: THE 34 VS. 12 QUINTAL REALITY (DO NOT TOUCH - Untouched Section)
            ========================================================================= */}
        <section id="empirical-trial" className="py-24 md:py-32 bg-[var(--color-background)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header with character-by-character animation */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="max-w-3xl space-y-3">
                <AnimatedCharacterTitle
                  text={t('section2Title')}
                  highlightWords={['Timing']}
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--color-text-primary)] leading-tight"
                />
                <p className="text-sm sm:text-base text-[var(--color-text-muted)] leading-relaxed">
                  {t('section2Subtitle')}
                </p>
              </div>

              {/* Location Badge */}
              <div className="flex items-center gap-2 bg-[var(--color-surface)] px-4 py-2 rounded-full border border-[var(--color-border)] shadow-xs self-start md:self-auto">
                <MapPin className="w-4 h-4 text-[var(--color-primary)]" />
                <span className="text-xs font-semibold text-[var(--color-text-primary)]">{t('lumeWoreda')}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] font-bold">
                  {t('verified')}
                </span>
              </div>
            </div>

            {/* Comparison Grid with Center Metric Bridge (Exactly untouched logic) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* LEFT CARD: AgriIntel Autonomous Protocol */}
              <motion.div
                {...cardMotion(0.1)}
                className="lg:col-span-5 bg-[var(--color-surface)] rounded-3xl border-2 border-[var(--color-primary)] p-6 md:p-8 shadow-md flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:shadow-xl"
              >
                <div className="absolute top-0 right-0 w-36 h-36 bg-[var(--color-primary-light)] rounded-bl-full pointer-events-none -z-0" />

                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-4 pb-6 border-b border-[var(--color-border-subtle)]">
                    <div>
                      <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
                        {t('protocolTitle')}
                      </h3>
                      <p className="text-xs text-[var(--color-text-muted)] mt-1">
                        {t('protocolCompliance')}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-4xl sm:text-5xl font-extrabold text-[var(--color-primary)] tracking-tight font-mono">
                        34.2
                      </div>
                      <div className="text-[11px] font-mono text-[var(--color-text-faint)] uppercase mt-0.5">
                        Quintal / Hectare
                      </div>
                    </div>
                  </div>

                  {/* Chronological Steps */}
                  <div className="mt-6 space-y-4">
                    <div className="flex items-start gap-3 text-xs">
                      <span className="font-mono font-bold text-[var(--color-primary)] bg-[var(--color-primary-light)] border border-[var(--color-primary)]/20 px-2 py-1 rounded-md text-[11px] flex-shrink-0">
                        {t('step01')}
                      </span>
                      <div>
                        <span className="font-semibold text-[var(--color-text-primary)] block">{t('step01Title')}</span>
                        <span className="text-[var(--color-text-muted)]">{t('step01Desc')}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-xs">
                      <span className="font-mono font-bold text-[var(--color-primary)] bg-[var(--color-primary-light)] border border-[var(--color-primary)]/20 px-2 py-1 rounded-md text-[11px] flex-shrink-0">
                        {t('step02')}
                      </span>
                      <div>
                        <span className="font-semibold text-[var(--color-text-primary)] block">{t('step02Title')}</span>
                        <span className="text-[var(--color-text-muted)]">{t('step02Desc')}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-xs">
                      <span className="font-mono font-bold text-[var(--color-primary)] bg-[var(--color-primary-light)] border border-[var(--color-primary)]/20 px-2 py-1 rounded-md text-[11px] flex-shrink-0">
                        {t('step03')}
                      </span>
                      <div>
                        <span className="font-semibold text-[var(--color-text-primary)] block">{t('step03Title')}</span>
                        <span className="text-[var(--color-text-muted)]">{t('step03Desc')}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-xs">
                      <span className="font-mono font-bold text-[var(--color-primary)] bg-[var(--color-primary-light)] border border-[var(--color-primary)]/20 px-2 py-1 rounded-md text-[11px] flex-shrink-0">
                        {t('step04')}
                      </span>
                      <div>
                        <span className="font-semibold text-[var(--color-text-primary)] block">{t('step04Title')}</span>
                        <span className="text-[var(--color-text-muted)]">{t('step04Desc')}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-xs">
                      <span className="font-mono font-bold text-[var(--color-primary)] bg-[var(--color-primary-light)] border border-[var(--color-primary)]/20 px-2 py-1 rounded-md text-[11px] flex-shrink-0">
                        {t('step05')}
                      </span>
                      <div>
                        <span className="font-semibold text-[var(--color-text-primary)] block">{t('step05Title')}</span>
                        <span className="text-[var(--color-text-muted)]">{t('step05Desc')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-8 pt-5 border-t border-[var(--color-border-subtle)] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[var(--color-text-faint)] block text-[11px]">{t('calculatedNetReturn')}</span>
                    <span className="font-bold text-[var(--color-text-primary)] font-mono text-base">325,000 ETB</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] font-semibold text-[11px]">
                    {t('protocolSurplus')}
                  </span>
                </div>
              </motion.div>

              {/* CENTER BRIDGE: +220% Yield Delta Multiplier */}
              <motion.div
                {...cardMotion(0.2)}
                className="lg:col-span-2 flex flex-col items-center justify-center p-6 bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)] text-center shadow-sm"
              >
                <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-text-faint)] font-bold mb-1">
                  {t('yieldAdvantage')}
                </span>

                <div className="text-4xl lg:text-5xl font-black text-[var(--color-primary)] font-mono tracking-tight my-2">
                  +220%
                </div>

                <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] text-[11px] font-bold border border-[var(--color-primary)]/20 mb-4">
                  <TrendingUp className="w-3 h-3" />
                  {t('yieldMultiplier')}
                </div>

                <div className="w-full border-t border-[var(--color-border-subtle)] my-2" />

                <div className="text-xl font-bold font-mono text-[var(--color-text-primary)] mt-2">
                  +182,300 ETB
                </div>
                <div className="text-[11px] text-[var(--color-text-muted)] leading-tight mt-1">
                  {t('netValueGain')}
                </div>

                <div className="mt-5 text-[10px] font-mono text-[var(--color-text-muted)] bg-[var(--color-surface-subtle)] p-2.5 rounded-xl border border-[var(--color-border)] leading-normal">
                  {t('identicalConditions')}
                </div>
              </motion.div>

              {/* RIGHT CARD: Traditional Farmer Intuition (Control Plot) */}
              <motion.div
                {...cardMotion(0.3)}
                className="lg:col-span-5 bg-[var(--color-surface)] rounded-3xl border border-[var(--color-accent)]/40 p-6 md:p-8 shadow-sm flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:shadow-md"
              >
                <div className="absolute top-0 right-0 w-36 h-36 bg-[var(--color-accent-light)] rounded-bl-full pointer-events-none -z-0" />

                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-4 pb-6 border-b border-[var(--color-border-subtle)]">
                    <div>
                      <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
                        {t('traditionalTitle')}
                      </h3>
                      <p className="text-xs text-[var(--color-text-muted)] mt-1">
                        {t('traditionalSubtitle')}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-4xl sm:text-5xl font-extrabold text-[var(--color-text-faint)] tracking-tight font-mono">
                        12.0
                      </div>
                      <div className="text-[11px] font-mono text-[var(--color-text-faint)] uppercase mt-0.5">
                        Quintal / Hectare
                      </div>
                    </div>
                  </div>

                  {/* Chronological Missteps */}
                  <div className="mt-6 space-y-4">
                    <div className="flex items-start gap-3 text-xs">
                      <span className="font-mono font-bold text-[var(--color-accent)] bg-[var(--color-accent-light)] border border-[var(--color-accent)]/30 px-2 py-1 rounded-md text-[11px] flex-shrink-0">
                        {t('ctrl01')}
                      </span>
                      <div>
                        <span className="font-semibold text-[var(--color-text-primary)] block">{t('ctrl01Title')}</span>
                        <span className="text-[var(--color-text-muted)]">{t('ctrl01Desc')}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-xs">
                      <span className="font-mono font-bold text-[var(--color-accent)] bg-[var(--color-accent-light)] border border-[var(--color-accent)]/30 px-2 py-1 rounded-md text-[11px] flex-shrink-0">
                        {t('ctrl02')}
                      </span>
                      <div>
                        <span className="font-semibold text-[var(--color-text-primary)] block">{t('ctrl02Title')}</span>
                        <span className="text-[var(--color-text-muted)]">{t('ctrl02Desc')}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-xs">
                      <span className="font-mono font-bold text-[var(--color-accent)] bg-[var(--color-accent-light)] border border-[var(--color-accent)]/30 px-2 py-1 rounded-md text-[11px] flex-shrink-0">
                        {t('ctrl03')}
                      </span>
                      <div>
                        <span className="font-semibold text-[var(--color-text-primary)] block">{t('ctrl03Title')}</span>
                        <span className="text-[var(--color-text-muted)]">{t('ctrl03Desc')}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-xs">
                      <span className="font-mono font-bold text-[var(--color-accent)] bg-[var(--color-accent-light)] border border-[var(--color-accent)]/30 px-2 py-1 rounded-md text-[11px] flex-shrink-0">
                        {t('ctrl04')}
                      </span>
                      <div>
                        <span className="font-semibold text-[var(--color-text-primary)] block">{t('ctrl04Title')}</span>
                        <span className="text-[var(--color-text-muted)]">{t('ctrl04Desc')}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-xs">
                      <span className="font-mono font-bold text-[var(--color-accent)] bg-[var(--color-accent-light)] border border-[var(--color-accent)]/30 px-2 py-1 rounded-md text-[11px] flex-shrink-0">
                        {t('ctrl05')}
                      </span>
                      <div>
                        <span className="font-semibold text-[var(--color-text-primary)] block">{t('ctrl05Title')}</span>
                        <span className="text-[var(--color-text-muted)]">{t('ctrl05Desc')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-8 pt-5 border-t border-[var(--color-border-subtle)] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[var(--color-text-faint)] block text-[11px]">{t('calculatedNetReturn')}</span>
                    <span className="font-bold text-[var(--color-text-primary)] font-mono text-base">94,000 ETB</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[var(--color-accent-light)] text-[var(--color-accent)] font-semibold text-[11px]">
                    {t('controlBaseline')}
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 3: EMPIRICAL PROOF BANNER
            - Animated Title & Refined Card Color Grading
            ========================================================================= */}
        <section className="py-14 bg-[var(--color-background)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              {...cardMotion(0.1)}
              className="bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)] overflow-hidden shadow-sm p-6 sm:p-8 lg:p-10 transition-all duration-300 hover:shadow-lg hover:border-[var(--color-primary)]/40"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                {/* Photo Column */}
                <div className="lg:col-span-7 relative">
                  <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-sm group">
                    <Image
                      src="/images/field-farmers.jpg"
                      alt="Ethiopian farmers inspecting grain in highland farmland"
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-mono">
                      <MapPin className="w-3.5 h-3.5 text-[#A3E635]" />
                      <span>{t('fieldTrialLabel')}</span>
                    </div>
                  </div>
                </div>

                {/* Editorial Column */}
                <div className="lg:col-span-5 space-y-4">
                  <AnimatedCharacterTitle
                    as="h3"
                    text={t('section3Title')}
                    highlightWords={['Empirical']}
                    className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-text-primary)] leading-snug"
                  />
                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                    {t('section3Subtitle')}
                  </p>

                  <div className="pt-3 flex flex-wrap gap-4 text-xs font-semibold">
                    <a
                      href="#empirical-trial"
                      className="inline-flex items-center gap-1 text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
                    >
                      {t('viewValidation')}
                    </a>
                    <a
                      href="#capabilities"
                      className="inline-flex items-center gap-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                    >
                      {t('readWhitepaper')}
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 4: SYSTEM ARCHITECTURE — INTERACTIVE SHOWCASE CARD
            (Approach modeled after yohajoh.tech "The Way I Build" pipeline card)
            ========================================================================= */}
        <section id="capabilities" className="py-24 md:py-32 bg-[#F3F7F2] border-t border-b border-[var(--color-border)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Top Split Header */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
              <div className="lg:col-span-7 space-y-3">
                <AnimatedCharacterTitle
                  text={t('section4Title')}
                  highlightWords={['Engineered', 'High-Stakes']}
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--color-text-primary)] leading-tight"
                />
                <p className="text-sm sm:text-base text-[var(--color-text-muted)] leading-relaxed max-w-2xl">
                  {t('section4Subtitle')}
                </p>
              </div>

              {/* Vertical / Step indicator on top right */}
              <div className="lg:col-span-5 flex items-center lg:justify-end gap-2 text-xs font-mono text-[var(--color-text-muted)]">
                <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
                <span className="uppercase font-semibold tracking-wider">{t('systemPipeline')}</span>
                <span className="font-bold text-[var(--color-primary)]">
                  {currentPillar.number} / 04
                </span>
              </div>
            </div>

            {/* Main Interactive Showcase Card Container (styled as in yohajoh.tech) */}
            <motion.div
              {...cardMotion(0.1)}
              className="bg-white rounded-3xl border-2 border-[var(--color-primary)]/30 p-6 sm:p-10 shadow-xl overflow-hidden relative"
            >
              {/* Subtle ambient corner gradient */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--color-primary-light)]/60 rounded-bl-full pointer-events-none -z-0" />

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                {/* Left Detail Side */}
                <div className="lg:col-span-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center font-mono font-bold text-lg shadow-xs">
                      {currentPillar.number}
                    </div>
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-text-faint)] font-bold block">
                        {t('architectureModule')}
                      </span>
                      <h3 className="text-2xl font-bold text-[var(--color-text-primary)]">
                        {currentPillar.headline}
                      </h3>
                    </div>
                  </div>

                  <p className="text-sm sm:text-base text-[var(--color-text-muted)] leading-relaxed">
                    {currentPillar.summary}
                  </p>

                  {/* Interactive Tag Pills */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {currentPillar.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full bg-[var(--color-surface-subtle)] text-[var(--color-text-primary)] text-xs font-mono font-medium border border-[var(--color-border)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2">
                    <Link href="/signIn">
                      <Button
                        size="md"
                        className="rounded-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-semibold px-6 shadow-sm flex items-center gap-2 cursor-pointer"
                      >
                        {currentPillar.actionText}
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Right Interactive Telemetry & Visual Preview Card */}
                <div className="lg:col-span-6">
                  <div className="bg-[#FAFBF9] rounded-2xl border border-[var(--color-border)] p-6 shadow-sm space-y-5">
                    {/* Telemetry Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)] text-[11px] font-mono text-[var(--color-text-faint)]">
                      <span className="font-bold text-[var(--color-primary)] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-ping" />
                        {currentPillar.previewTitle}
                      </span>
                      <span className="uppercase">{t('activeProtocol')}</span>
                    </div>

                    {/* Dynamic Simulated Preview Component based on active pillar */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentPillar.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-4"
                      >
                        {currentPillar.id === 'voice' && (
                          <div className="space-y-3">
                            <div className="bg-white rounded-xl p-4 border border-[var(--color-border)] space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-[var(--color-text-primary)]">Audio Dispatch Broadcast</span>
                                <span className="font-mono text-[var(--color-primary)] font-bold">Afan Oromo</span>
                              </div>
                              <p className="text-xs text-[var(--color-text-muted)] italic font-mono bg-[var(--color-surface-subtle)] p-2.5 rounded-lg border border-[var(--color-border-subtle)]">
                                {currentPillar.details.messageSample}
                              </p>

                              {/* Audio Waveform Simulation */}
                              <div className="pt-2 flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                                  className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                                >
                                  {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                                </button>
                                <div className="flex-1 flex items-center gap-1 h-6">
                                  {[40, 70, 95, 45, 80, 100, 60, 85, 40, 75, 90, 50, 70, 85, 40, 60].map((h, i) => (
                                    <span
                                      key={i}
                                      className={`flex-1 rounded-full transition-all duration-300 ${isPlayingAudio ? 'bg-[var(--color-primary)] animate-pulse' : 'bg-slate-300'}`}
                                      style={{ height: `${h}%` }}
                                    />
                                  ))}
                                </div>
                                <span className="text-[11px] font-mono text-[var(--color-text-muted)]">0:24</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] font-mono px-1">
                              <span>{t('pickupRate')} {currentPillar.details.confidenceRate}</span>
                              <span>{t('target')} {currentPillar.details.target}</span>
                            </div>
                          </div>
                        )}

                        {currentPillar.id === 'ai' && (
                          <div className="space-y-3">
                            <div className="bg-white rounded-xl p-4 border border-[var(--color-border)] space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-[var(--color-text-primary)]">{currentPillar.details.specimen}</span>
                                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-mono font-bold">
                                  {t('criticalAlert')}
                                </span>
                              </div>
                              <div className="bg-red-50 p-3 rounded-lg border border-red-200 text-xs text-red-900 space-y-1">
                                <div className="font-semibold">{currentPillar.details.condition}</div>
                                <div className="text-[11px] text-red-800">{currentPillar.details.severity}</div>
                              </div>
                              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                                {currentPillar.details.prescription}
                              </p>
                            </div>
                          </div>
                        )}

                        {currentPillar.id === 'weather' && (
                          <div className="space-y-3">
                            <div className="bg-white rounded-xl p-4 border border-[var(--color-border)] space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-[var(--color-text-primary)]">{currentPillar.details.windowType}</span>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                                  {t('windowConfirmed')}
                                </span>
                              </div>
                              <div className="bg-[var(--color-primary-light)] p-3 rounded-lg border border-[var(--color-primary)]/30 text-xs text-[var(--color-primary)] space-y-1">
                                <div className="font-bold font-mono">{currentPillar.details.calculatedWindow}</div>
                                <div className="text-[11px]">{currentPillar.details.precipitationForecast}</div>
                              </div>
                              <p className="text-xs text-[var(--color-text-muted)] font-mono">
                                {t('impact')} {currentPillar.details.absorptionAdvantage}
                              </p>
                            </div>
                          </div>
                        )}

                        {currentPillar.id === 'inputs' && (
                          <div className="space-y-3">
                            <div className="bg-white rounded-xl p-4 border border-[var(--color-border)] space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-[var(--color-text-primary)]">{currentPillar.details.verifiedBatch}</span>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                                  {t('qrAuthenticated')}
                                </span>
                              </div>
                              <div className="bg-[var(--color-surface-subtle)] p-3 rounded-lg border border-[var(--color-border)] text-xs space-y-1">
                                <div className="font-semibold text-[var(--color-text-primary)]">{currentPillar.details.depotHub}</div>
                                <div className="text-[11px] text-[var(--color-text-muted)] font-mono">{currentPillar.details.purityScore}</div>
                              </div>
                              <p className="text-xs text-[var(--color-text-muted)]">
                                {t('auditAuthority')} {currentPillar.details.certificationAuthority}
                              </p>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Bottom Interactive Navigation Tabs (as seen in yohajoh.tech) */}
              <div className="mt-8 pt-8 border-t border-[var(--color-border)] grid grid-cols-2 sm:grid-cols-4 gap-3">
                {pillars.map((pillar, idx) => {
                  const Icon = pillar.icon
                  const isActive = activePillar === idx
                  return (
                    <button
                      key={pillar.id}
                      onClick={() => setActivePillar(idx)}
                      className={`text-left p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between gap-3 ${isActive
                        ? 'bg-[var(--color-primary-light)] border-[var(--color-primary)] shadow-sm scale-[1.02]'
                        : 'bg-white hover:bg-[var(--color-surface-subtle)] border-[var(--color-border)]'
                        }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <Icon className={`w-5 h-5 ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-faint)]'}`} />
                        <span className={`text-[10px] font-mono font-bold ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-faint)]'}`}>
                          {pillar.number}
                        </span>
                      </div>
                      <span className={`text-xs font-bold ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-primary)]'}`}>
                        {pillar.navTitle}
                      </span>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 5: DARK SECTION - VOICE BOX & KEBELE DIRECT DISPATCH
            - Enhanced High-Contrast Obsidian & Emerald Palette
            - Animated Title & Cards
            ========================================================================= */}
        <section
          id="voice-dispatch"
          className="relative bg-[#071109] text-white py-24 md:py-32 overflow-hidden border-t border-b border-black/50"
        >
          {/* Subtle ambient lighting */}
          <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[600px] h-[400px] bg-[var(--color-primary)]/25 blur-[140px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Animated Section Header */}
            <div className="max-w-3xl mb-14 space-y-3">
              <AnimatedCharacterTitle
                text={t('section5Title')}
                highlightWords={['Voice', 'Kebele']}
                highlightClass="text-[#A3E635]"
                className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight"
              />
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {t('section5Subtitle')}
              </p>
            </div>

            {/* Split Content: Farmer with Phone on Left, 3 Dispatches on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
              {/* Photo Column */}
              <motion.div
                {...cardMotion(0.1)}
                className="lg:col-span-5 relative flex flex-col"
              >
                <div className="relative aspect-[4/3] lg:aspect-auto lg:h-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                  <Image
                    src="/images/voice-box-farmer.jpg"
                    alt="Farmer using basic mobile phone in terraced Ethiopian highland field"
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-[#A3E635] border border-white/20 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#A3E635] animate-ping" />
                      {t('voiceStationLabel')}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Real-Time Dispatch Log Cards */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                {/* Dispatch 1: Voice Call Broadcast */}
                <motion.div
                  {...cardMotion(0.15)}
                  className="bg-white/5 border border-white/10 hover:border-[#A3E635] transition-all duration-300 p-5 rounded-2xl backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white">
                        <PhoneCall className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-sm">
                          {t('dispatch1Time')}
                        </h4>
                        <span className="text-[11px] font-mono text-slate-400">
                          {t('dispatch1Dialect')}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                      {t('dispatch1Status')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed pl-10">
                    {t('dispatch1Text')}
                  </p>
                </motion.div>

                {/* Dispatch 2: Kebele DA Alert */}
                <motion.div
                  {...cardMotion(0.25)}
                  className="bg-white/5 border border-white/10 hover:border-[var(--color-accent)] transition-all duration-300 p-5 rounded-2xl backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-sm">
                          {t('dispatch2Time')}
                        </h4>
                        <span className="text-[11px] font-mono text-slate-400">
                          {t('dispatch2Priority')}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-500/30">
                      {t('dispatch2Status')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed pl-10">
                    {t('dispatch2Text')}
                  </p>
                </motion.div>

                {/* Dispatch 3: SMS Fallback Broadcast */}
                <motion.div
                  {...cardMotion(0.35)}
                  className="bg-white/5 border border-white/10 hover:border-teal-400/50 transition-all duration-300 p-5 rounded-2xl backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-teal-800 flex items-center justify-center text-white">
                        <MessageSquareText className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-sm">
                          {t('dispatch3Time')}
                        </h4>
                        <span className="text-[11px] font-mono text-slate-400">
                          {t('dispatch3Channel')}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-teal-950 text-teal-400 border border-teal-500/30">
                      {t('dispatch3Status')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed pl-10">
                    {t('dispatch3Text')}
                  </p>
                </motion.div>
              </div>
            </div>

            {/* Bottom Live Status Ribbon */}
            <motion.div
              {...cardMotion(0.4)}
              className="mt-12 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs font-mono text-slate-400"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#A3E635] animate-pulse" />
                <span className="text-slate-300 font-medium">{t('activeChannels')}</span>
                <span>{t('channelList')}</span>
              </div>
              <span className="hidden md:inline text-[#A3E635]">
                {t('networkLatency')}
              </span>
            </motion.div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 6: THREE BENCHMARK IMPACT CARDS
            - Enhanced High-End Palette & Character Animated Title
            ========================================================================= */}
        <section id="impact" className="py-20 md:py-28 bg-[var(--color-background)] border-b border-[var(--color-border)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center max-w-2xl mx-auto">
              <AnimatedCharacterTitle
                text={t('section6Title')}
                highlightWords={['Validated']}
                className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-text-primary)] justify-center text-center"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Box 1 */}
              <motion.div
                {...cardMotion(0.1)}
                className="bg-[var(--color-surface)] rounded-3xl p-6 sm:p-8 border border-[var(--color-border)] shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-[var(--color-primary)]"
              >
                <div className="w-10 h-1.5 bg-[var(--color-primary)] rounded-full mb-5" />
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--color-primary)] mb-2">
                  {t('benchmark1Title')}
                </div>
                <p className="text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed">
                  {t('benchmark1Desc')}
                </p>
              </motion.div>

              {/* Box 2 */}
              <motion.div
                {...cardMotion(0.2)}
                className="bg-[var(--color-surface)] rounded-3xl p-6 sm:p-8 border border-[var(--color-border)] shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-[var(--color-primary)]"
              >
                <div className="w-10 h-1.5 bg-[var(--color-primary)] rounded-full mb-5" />
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--color-primary)] mb-2">
                  {t('benchmark2Title')}
                </div>
                <p className="text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed">
                  {t('benchmark2Desc')}
                </p>
              </motion.div>

              {/* Box 3 */}
              <motion.div
                {...cardMotion(0.3)}
                className="bg-[var(--color-surface)] rounded-3xl p-6 sm:p-8 border border-[var(--color-border)] shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-[var(--color-primary)]"
              >
                <div className="w-10 h-1.5 bg-[var(--color-primary)] rounded-full mb-5" />
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--color-primary)] mb-2">
                  {t('benchmark3Title')}
                </div>
                <p className="text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed">
                  {t('benchmark3Desc')}
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 7: ACCELERATE HARVEST OUTCOMES (Call To Action Box)
            - Character Animated Title & Beautiful Mint-Cream Card
            ========================================================================= */}
        <section className="py-24 md:py-32 bg-[var(--color-surface)]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              {...cardMotion(0.1)}
              className="bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-primary-light)]/40 rounded-3xl border border-[var(--color-border)] p-8 sm:p-14 text-center shadow-lg relative overflow-hidden"
            >
              <AnimatedCharacterTitle
                text={t('ctaTitle')}
                highlightWords={['outcomes?']}
                className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[var(--color-text-primary)] leading-tight justify-center text-center"
              />

              <p className="mt-4 text-sm sm:text-base text-[var(--color-text-muted)] max-w-xl mx-auto leading-relaxed">
                {t('ctaSubtitle')}
              </p>

              {/* Interactive Submit Form */}
              <div className="mt-8 max-w-md mx-auto">
                {ctaSubmitted ? (
                  <div className="p-4 rounded-full bg-[var(--color-primary-light)] border border-[var(--color-primary)]/30 text-[var(--color-primary)] text-sm font-semibold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[var(--color-primary)]" />
                    {t('ctaSuccess')}
                  </div>
                ) : (
                  <form onSubmit={handleCtaSubmit} className="flex flex-col sm:flex-row items-center gap-2.5">
                    <input
                      type="text"
                      required
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      placeholder={t('ctaPlaceholder')}
                      className="w-full px-5 py-3.5 rounded-full border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] shadow-xs"
                    />
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full sm:w-auto rounded-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-semibold px-7 py-3.5 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shadow-sm transition-all duration-300 hover:scale-[1.02]"
                    >
                      {t('ctaButton')}
                    </Button>
                  </form>
                )}
              </div>

              {/* Security & Setup Bullet Notes */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--color-text-muted)] font-mono">
                <span>{t('ctaNote1')}</span>
                <span>{t('ctaNote2')}</span>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Floating AI Assistant Popup Button & Modal */}
      <AiAssistantPopup />
    </div>
  )
}
