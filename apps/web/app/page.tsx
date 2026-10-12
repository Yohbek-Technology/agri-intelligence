'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { 
  ArrowUpRight, 
  ArrowRight, 
  CheckCircle2, 
  PhoneCall, 
  MessageSquareText, 
  ShieldCheck, 
  MapPin, 
  TrendingUp,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react'
import { useAuthSession } from '@/hooks/useAuth'
import { Navbar } from '@/components/navigation/navbar'
import { Footer } from '@/components/navigation/footer'
import { Button } from '@/components/ui/button'

// Reusable viewport animation preset inspired by yohajoh.tech
const titleMotion = {
  initial: { opacity: 0, y: 32, filter: 'blur(6px)' },
  whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.65, ease: 'easeOut' as const }
}

const cardMotion = (delay = 0) => ({
  initial: { opacity: 0, y: 28, filter: 'blur(4px)' },
  whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.6, delay, ease: 'easeOut' as const }
})

export default function HomePage() {
  const { isAuthenticated, dashboardPath, role } = useAuthSession()
  const [emailOrPhone, setEmailOrPhone] = useState('')
  const [ctaSubmitted, setCtaSubmitted] = useState(false)

  const handleCtaSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (emailOrPhone.trim()) {
      setCtaSubmitted(true)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)] flex flex-col antialiased selection:bg-[var(--color-primary)] selection:text-white">
      {/* Top Floating Pill Navigation */}
      <Navbar
        isAuthenticated={isAuthenticated}
        dashboardPath={dashboardPath}
        role={role}
      />

      <main className="flex-1">
        {/* =========================================================================
            SECTION 1: HERO SECTION
            - 90% Clear & Vivid Ethiopian Highland Terraces Sunrise Image (10% subtle overlay)
            - Animated Title & Call to Action
            ========================================================================= */}
        <section 
          id="overview"
          className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-28 pb-32 md:pt-36 md:pb-40"
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
            
            {/* Seamless gentle transition into page background at very bottom */}
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--color-background)] via-[var(--color-background)]/50 to-transparent pointer-events-none" />
          </div>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            {/* Glassmorphic backplate for pristine typography legibility while keeping image 90% visible */}
            <div className="bg-black/25 backdrop-blur-[4px] border border-white/20 rounded-3xl p-6 sm:p-10 md:p-14 shadow-2xl">
              {/* Animated Massive Bold Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 35, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.8, ease: 'easeOut' as const }}
                className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.08] max-w-4xl mx-auto drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]"
              >
                Autonomous Agronomic <br />
                Intelligence. <br />
                <span className="text-[#A3E635] drop-shadow-[0_0_35px_rgba(163,230,53,0.65)]">
                  Yields Proven by Timing.
                </span>
              </motion.h1>

              {/* Animated Subtitle Description */}
              <motion.p
                initial={{ opacity: 0, y: 24, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' as const }}
                className="mt-6 text-base sm:text-lg text-white font-normal max-w-2xl mx-auto leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]"
              >
                Precision agronomy intelligence platform engineered for Ethiopian highlands farming, 
                delivering automated crop timing alerts and kebele-level resource coordination.
              </motion.p>

              {/* Action Buttons styled with globals.css primary green */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.28, ease: 'easeOut' as const }}
                className="mt-9 flex flex-wrap items-center justify-center gap-4"
              >
                {isAuthenticated ? (
                  <Link href={dashboardPath}>
                    <Button 
                      size="lg" 
                      className="rounded-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-semibold px-8 py-3.5 shadow-xl shadow-black/30 flex items-center gap-2 cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                    >
                      Open Workspace ({role || 'Operator'}) <ArrowUpRight className="w-4 h-4" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/signUp">
                    <Button 
                      size="lg" 
                      className="rounded-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-semibold px-8 py-3.5 shadow-xl shadow-black/30 flex items-center gap-2 cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                    >
                      Open Agronomist Portal <ArrowUpRight className="w-4 h-4" />
                    </Button>
                  </Link>
                )}

                <a href="#empirical-trial">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="rounded-full bg-white/20 hover:bg-white/30 text-white border-white/40 px-7 py-3.5 backdrop-blur-md flex items-center gap-2 cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                  >
                    Request Field Deployment
                  </Button>
                </a>

                <a 
                  href="#capabilities" 
                  className="text-white hover:text-[#A3E635] text-sm font-semibold px-4 py-3.5 inline-flex items-center gap-1.5 transition-colors drop-shadow-md"
                >
                  Our Capabilities <ArrowRight className="w-4 h-4" />
                </a>
              </motion.div>

              {/* Credibility Trust Bar */}
              <motion.div
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
              </motion.div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 2: THE 34 VS. 12 QUINTAL REALITY (Empirical Side-by-Side Trial)
            - Smooth scroll-in animated title
            - Clean, watermark-free presentation
            ========================================================================= */}
        <section id="empirical-trial" className="py-24 md:py-32 bg-[var(--color-background)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Animated Section Header */}
            <motion.div 
              {...titleMotion}
              className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
            >
              <div className="max-w-3xl space-y-3">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--color-text-primary)] leading-tight">
                  The 34 vs. 12 Quintal Reality: Timing Over Fortune
                </h2>
                <p className="text-sm sm:text-base text-[var(--color-text-muted)] leading-relaxed">
                  Two adjacent 1-hectare plots in Lume Woreda with identical soil profile and certified seed stock. 
                  The documented yield divergence was strictly determined by micro-window intervention timing.
                </p>
              </div>

              {/* Location Badge */}
              <div className="flex items-center gap-2 bg-[var(--color-surface)] px-4 py-2 rounded-full border border-[var(--color-border)] shadow-xs self-start md:self-auto">
                <MapPin className="w-4 h-4 text-[var(--color-primary)]" />
                <span className="text-xs font-semibold text-[var(--color-text-primary)]">Lume Woreda, Oromia</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] font-bold">
                  Verified
                </span>
              </div>
            </motion.div>

            {/* Comparison Grid with Center Metric Bridge */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* LEFT CARD: AgriIntel Autonomous Protocol (Winner Card) */}
              <motion.div 
                {...cardMotion(0.1)}
                className="lg:col-span-5 bg-[var(--color-surface)] rounded-3xl border-2 border-[var(--color-primary)] p-6 md:p-8 shadow-md flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:shadow-xl"
              >
                <div className="absolute top-0 right-0 w-36 h-36 bg-[var(--color-primary-light)] rounded-bl-full pointer-events-none -z-0" />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-4 pb-6 border-b border-[var(--color-border-subtle)]">
                    <div>
                      <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
                        AgriIntel Autonomous Protocol
                      </h3>
                      <p className="text-xs text-[var(--color-text-muted)] mt-1">
                        28-day window adherence: 100% compliant
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
                        01. Day 14
                      </span>
                      <div>
                        <span className="font-semibold text-[var(--color-text-primary)] block">Basal DAP Micro-Dosing</span>
                        <span className="text-[var(--color-text-muted)]">Delivered 36 hours prior to recorded root soak cycle</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-xs">
                      <span className="font-mono font-bold text-[var(--color-primary)] bg-[var(--color-primary-light)] border border-[var(--color-primary)]/20 px-2 py-1 rounded-md text-[11px] flex-shrink-0">
                        02. Day 28
                      </span>
                      <div>
                        <span className="font-semibold text-[var(--color-text-primary)] block">Pre-Rust Prophylactic Spray</span>
                        <span className="text-[var(--color-text-muted)]">Triggered 48 hours before spore condensation peak</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-xs">
                      <span className="font-mono font-bold text-[var(--color-primary)] bg-[var(--color-primary-light)] border border-[var(--color-primary)]/20 px-2 py-1 rounded-md text-[11px] flex-shrink-0">
                        03. Day 45
                      </span>
                      <div>
                        <span className="font-semibold text-[var(--color-text-primary)] block">Precision Urea Top-Dressing</span>
                        <span className="text-[var(--color-text-muted)]">Timed with forecasted convective storm moisture</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-xs">
                      <span className="font-mono font-bold text-[var(--color-primary)] bg-[var(--color-primary-light)] border border-[var(--color-primary)]/20 px-2 py-1 rounded-md text-[11px] flex-shrink-0">
                        04. Day 72
                      </span>
                      <div>
                        <span className="font-semibold text-[var(--color-text-primary)] block">Aphid Vector Biological Control</span>
                        <span className="text-[var(--color-text-muted)]">Intervened at threshold index 3.2 before colony bloom</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-xs">
                      <span className="font-mono font-bold text-[var(--color-primary)] bg-[var(--color-primary-light)] border border-[var(--color-primary)]/20 px-2 py-1 rounded-md text-[11px] flex-shrink-0">
                        05. Day 110
                      </span>
                      <div>
                        <span className="font-semibold text-[var(--color-text-primary)] block">Physiological Maturity Harvest</span>
                        <span className="text-[var(--color-text-muted)]">Harvested at 13.5% grain moisture before unseasonal rains</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-8 pt-5 border-t border-[var(--color-border-subtle)] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[var(--color-text-faint)] block text-[11px]">Calculated Net Return</span>
                    <span className="font-bold text-[var(--color-text-primary)] font-mono text-base">325,000 ETB</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] font-semibold text-[11px]">
                    Protocol Compliant Surplus
                  </span>
                </div>
              </motion.div>

              {/* CENTER BRIDGE: +220% Yield Delta Multiplier */}
              <motion.div 
                {...cardMotion(0.2)}
                className="lg:col-span-2 flex flex-col items-center justify-center p-6 bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)] text-center shadow-sm"
              >
                <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-text-faint)] font-bold mb-1">
                  Yield Advantage
                </span>
                
                <div className="text-4xl lg:text-5xl font-black text-[var(--color-primary)] font-mono tracking-tight my-2">
                  +220%
                </div>

                <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] text-[11px] font-bold border border-[var(--color-primary)]/20 mb-4">
                  <TrendingUp className="w-3 h-3" />
                  Yield Multiplier
                </div>

                <div className="w-full border-t border-[var(--color-border-subtle)] my-2" />

                <div className="text-xl font-bold font-mono text-[var(--color-text-primary)] mt-2">
                  +182,300 ETB
                </div>
                <div className="text-[11px] text-[var(--color-text-muted)] leading-tight mt-1">
                  Net value gain per single hectare
                </div>

                <div className="mt-5 text-[10px] font-mono text-[var(--color-text-muted)] bg-[var(--color-surface-subtle)] p-2.5 rounded-xl border border-[var(--color-border)] leading-normal">
                  Identical Soil • Identical Seeds • Timing Advantage
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
                        Traditional Farmer Intuition
                      </h3>
                      <p className="text-xs text-[var(--color-text-muted)] mt-1">
                        Calendar-based intervention (Traditional practice)
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
                        01. Day 22
                      </span>
                      <div>
                        <span className="font-semibold text-[var(--color-text-primary)] block">Delayed Fertilizer Application</span>
                        <span className="text-[var(--color-text-muted)]">Applied 8 days late during dry spell; 40% volatilization</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-xs">
                      <span className="font-mono font-bold text-[var(--color-accent)] bg-[var(--color-accent-light)] border border-[var(--color-accent)]/30 px-2 py-1 rounded-md text-[11px] flex-shrink-0">
                        02. Day 39
                      </span>
                      <div>
                        <span className="font-semibold text-[var(--color-text-primary)] block">Reactive Rust Fungicide</span>
                        <span className="text-[var(--color-text-muted)]">Applied post-symptom manifestation; irreversible canopy damage</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-xs">
                      <span className="font-mono font-bold text-[var(--color-accent)] bg-[var(--color-accent-light)] border border-[var(--color-accent)]/30 px-2 py-1 rounded-md text-[11px] flex-shrink-0">
                        03. Day 58
                      </span>
                      <div>
                        <span className="font-semibold text-[var(--color-text-primary)] block">Broadcast Urea Application</span>
                        <span className="text-[var(--color-text-muted)]">Heavy storm washed surface runoff; 60% nitrogen lost</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-xs">
                      <span className="font-mono font-bold text-[var(--color-accent)] bg-[var(--color-accent-light)] border border-[var(--color-accent)]/30 px-2 py-1 rounded-md text-[11px] flex-shrink-0">
                        04. Day 84
                      </span>
                      <div>
                        <span className="font-semibold text-[var(--color-text-primary)] block">Late Insecticide Spray</span>
                        <span className="text-[var(--color-text-muted)]">Post-infestation intervention; severe head blighting occurred</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-xs">
                      <span className="font-mono font-bold text-[var(--color-accent)] bg-[var(--color-accent-light)] border border-[var(--color-accent)]/30 px-2 py-1 rounded-md text-[11px] flex-shrink-0">
                        05. Day 118
                      </span>
                      <div>
                        <span className="font-semibold text-[var(--color-text-primary)] block">Rain-Interrupted Harvest</span>
                        <span className="text-[var(--color-text-muted)]">Wet harvest caused 18% field shattering and fungal discoloration</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-8 pt-5 border-t border-[var(--color-border-subtle)] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[var(--color-text-faint)] block text-[11px]">Calculated Net Return</span>
                    <span className="font-bold text-[var(--color-text-primary)] font-mono text-base">94,000 ETB</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[var(--color-accent-light)] text-[var(--color-accent)] font-semibold text-[11px]">
                    Control Plot Baseline
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 3: EMPIRICAL PROOF BANNER (Photo of Farmers in Field)
            - Animated Title & Presentation
            ========================================================================= */}
        <section className="py-14 bg-[var(--color-background)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              {...titleMotion}
              className="bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)] overflow-hidden shadow-sm p-6 sm:p-8 lg:p-10 transition-all duration-300 hover:shadow-md"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                {/* Photo Column */}
                <div className="lg:col-span-7 relative">
                  <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-sm">
                    <Image
                      src="/images/field-farmers.jpg"
                      alt="Ethiopian farmers inspecting grain in highland farmland"
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-cover object-center"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-mono">
                      <MapPin className="w-3.5 h-3.5 text-[#A3E635]" />
                      <span>Field Trial 4: Lume Woreda, Central Highlands</span>
                    </div>
                  </div>
                </div>

                {/* Editorial Column */}
                <div className="lg:col-span-5 space-y-4">
                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-text-primary)] leading-snug">
                    Empirical Agronomy Measured on Real Farmland
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                    Every recommendation in AgriIntel is calibrated against real agronomic trials across Ethiopian 
                    micro-climates. We don&apos;t rely on generic satellite estimations; our physics-informed models 
                    fuse localized telemetry with extension agent ground truth.
                  </p>

                  <div className="pt-3 flex flex-wrap gap-4 text-xs font-semibold">
                    <a 
                      href="#empirical-trial" 
                      className="inline-flex items-center gap-1 text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
                    >
                      ↗ View Multi-Trial Validation
                    </a>
                    <a 
                      href="#capabilities" 
                      className="inline-flex items-center gap-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                    >
                      ↗ Read Scientific Whitepaper
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 4: FOUR ARCHITECTURAL PILLARS ("Engineered for High-Stakes Agriculture")
            - Animated Title and Cards
            ========================================================================= */}
        <section id="capabilities" className="py-24 md:py-32 bg-[var(--color-surface)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
              {/* Left Column: Heading, Subtitle & Crop Inspection Image */}
              <motion.div 
                {...titleMotion}
                className="lg:col-span-5 space-y-6"
              >
                <div>
                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-text-primary)] leading-tight">
                    Engineered for High-Stakes Agriculture
                  </h2>
                  <p className="mt-3 text-sm text-[var(--color-text-muted)] leading-relaxed">
                    Designed specifically for the infrastructural realities and agronomic nuances of the Ethiopian agricultural landscape, from micro-plots to regional grain corridors.
                  </p>
                </div>

                {/* Farmer inspecting crop photo */}
                <div className="relative aspect-[16/11] rounded-3xl overflow-hidden border border-[var(--color-border)] shadow-md mt-4">
                  <Image
                    src="/images/crop-inspection.jpg"
                    alt="Farmer inspecting teff grain ears closely"
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 text-white text-[11px] font-mono px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm">
                    In-situ Teff Variety Verification
                  </div>
                </div>
              </motion.div>

              {/* Right Column: 4 Clean Feature Rows with Animated Appearance */}
              <div className="lg:col-span-7 flex flex-col justify-center space-y-4">
                {/* Feature 1: Voice & Dialectal Locales */}
                <motion.div 
                  {...cardMotion(0.1)}
                  className="bg-[var(--color-surface-subtle)] hover:bg-[var(--color-primary-light)] transition-all duration-300 p-6 rounded-2xl border border-[var(--color-border)] group shadow-2xs hover:shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]" />
                      <h4 className="font-bold text-[var(--color-text-primary)] text-base">
                        Voice & Dialectal Locales
                      </h4>
                    </div>
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[var(--color-surface)] text-[var(--color-primary)] font-semibold border border-[var(--color-border)] self-start sm:self-auto">
                      Afan Oromo / Amharic / Tigrinya
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed">
                    Delivers agronomic directives via natural voice in local languages, ensuring smallholders without digital literacy can receive and act on time-critical recommendations.
                  </p>
                  <a 
                    href="#voice-dispatch" 
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
                  >
                    Explore Voice Architecture <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </motion.div>

                {/* Feature 2: Multimodal Pest & Blight AI */}
                <motion.div 
                  {...cardMotion(0.2)}
                  className="bg-[var(--color-surface-subtle)] hover:bg-[var(--color-primary-light)] transition-all duration-300 p-6 rounded-2xl border border-[var(--color-border)] group shadow-2xs hover:shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]" />
                      <h4 className="font-bold text-[var(--color-text-primary)] text-base">
                        Multimodal Pest & Blight AI
                      </h4>
                    </div>
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[var(--color-surface)] text-[var(--color-primary)] font-semibold border border-[var(--color-border)] self-start sm:self-auto">
                      Edge Mobile & Cloud
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed">
                    Instant on-device and cloud diagnosis for over 48 endemic cereal diseases and invasive pests, operating seamlessly even during intermittent rural cellular connectivity.
                  </p>
                  <Link 
                    href="/signIn" 
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
                  >
                    Test Diagnostic Model <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </motion.div>

                {/* Feature 3: 7-Day Agro-Weather Timing Windows */}
                <motion.div 
                  {...cardMotion(0.3)}
                  className="bg-[var(--color-surface-subtle)] hover:bg-[var(--color-primary-light)] transition-all duration-300 p-6 rounded-2xl border border-[var(--color-border)] group shadow-2xs hover:shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]" />
                      <h4 className="font-bold text-[var(--color-text-primary)] text-base">
                        7-Day Agro-Weather Timing Windows
                      </h4>
                    </div>
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[var(--color-surface)] text-[var(--color-primary)] font-semibold border border-[var(--color-border)] self-start sm:self-auto">
                      Hyper-Local ECMWF + Radar
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed">
                    Predictive micro-climate forecast engines calculate exact 6-hour windows for fertilizer absorption, spray efficacy, and harvest drying.
                  </p>
                  <a 
                    href="#empirical-trial" 
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
                  >
                    View Weather Timing Pipeline <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </motion.div>

                {/* Feature 4: Verified Input Marketplace & Registry */}
                <motion.div 
                  {...cardMotion(0.4)}
                  className="bg-[var(--color-surface-subtle)] hover:bg-[var(--color-primary-light)] transition-all duration-300 p-6 rounded-2xl border border-[var(--color-border)] group shadow-2xs hover:shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]" />
                      <h4 className="font-bold text-[var(--color-text-primary)] text-base">
                        Verified Input Marketplace & Registry
                      </h4>
                    </div>
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[var(--color-surface)] text-[var(--color-primary)] font-semibold border border-[var(--color-border)] self-start sm:self-auto">
                      National Seed & Chemical
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed">
                    Direct integration with regional cooperative unions and agro-dealers ensures access to verified, certified seeds and genuine crop protection inputs.
                  </p>
                  <Link 
                    href="/signIn" 
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
                  >
                    Browse Input Verification System <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 5: DARK SECTION - VOICE BOX & KEBELE DIRECT DISPATCH
            - Animated Title and Cards
            - Uses deep rich tone with primary accents
            ========================================================================= */}
        <section 
          id="voice-dispatch" 
          className="relative bg-[#071109] text-white py-24 md:py-32 overflow-hidden border-t border-b border-black/40"
        >
          {/* Subtle ambient lighting */}
          <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[600px] h-[400px] bg-[var(--color-primary)]/20 blur-[140px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Animated Section Header */}
            <motion.div 
              {...titleMotion}
              className="max-w-3xl mb-14 space-y-3"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                Voice Box & Kebele Direct Dispatch
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                For regions and smallholders without reliable smartphones or internet access, AgriIntel delivers 
                automated voice broadcasts and direct alerts to local Kebele Development Agents (DAs).
              </p>
            </motion.div>

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
                      Voice Dispatch Station #104 — Arsi Foothills
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Real-Time Dispatch Log Cards */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                {/* Dispatch 1: Voice Call Broadcast */}
                <motion.div 
                  {...cardMotion(0.15)}
                  className="bg-white/5 border border-white/10 hover:border-[var(--color-primary)] transition-all duration-300 p-5 rounded-2xl backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white">
                        <PhoneCall className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-sm">
                          06:15 AM — Automated Voice Call
                        </h4>
                        <span className="text-[11px] font-mono text-slate-400">
                          Dialect: Afan Oromo
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                      ✓ Completed (98.2% Answer Rate)
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed pl-10">
                    &ldquo;Delivered in Afan Oromo to 412 registered wheat farmers: &lsquo;High stripe rust risk detected. 
                    Postpone morning nitrogen spray until wind speed drops below 6 km/h.&rsquo;&rdquo;
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
                          08:30 AM — Kebele Extension DA Alert
                        </h4>
                        <span className="text-[11px] font-mono text-slate-400">
                          Priority: Immediate Field Action
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-500/30">
                      ⚡ Actioned by DA Bekele &amp; Team
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed pl-10">
                    &ldquo;Priority dispatch to 6 assigned Development Agents: &lsquo;Soil moisture saturation at 84% in Lower Valley. 
                    Direct furrow drainage protocol activated across 42 teff hectares.&rsquo;&rdquo;
                  </p>
                </motion.div>

                {/* Dispatch 3: SMS Fallback Broadcast */}
                <motion.div 
                  {...cardMotion(0.35)}
                  className="bg-white/5 border border-white/10 hover:border-teal-500/40 transition-all duration-300 p-5 rounded-2xl backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-teal-800 flex items-center justify-center text-white">
                        <MessageSquareText className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-sm">
                          11:00 AM — Structured USSD/SMS Broadcast
                        </h4>
                        <span className="text-[11px] font-mono text-slate-400">
                          Channel: Ethio Telecom
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-teal-950 text-teal-400 border border-teal-500/30">
                      ✓ Delivered via SMS Gateway
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed pl-10">
                    &ldquo;Offline fallback sent to 1,280 smallholders with market price alerts for Adama grain depot 
                    and optimal 4-day harvest drying windows.&rdquo;
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
                <span className="text-slate-300 font-medium">Active Dispatch Channels:</span>
                <span>Ethio Telecom Voice Gateway • Kebele DA Offline Mesh • National Weather Service Sync</span>
              </div>
              <span className="hidden md:inline text-[#A3E635]">
                Network Latency: 42ms
              </span>
            </motion.div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 6: THREE BENCHMARK IMPACT CARDS
            - Animated Title and Cards
            ========================================================================= */}
        <section id="impact" className="py-20 md:py-28 bg-[var(--color-background)] border-b border-[var(--color-border)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Box 1 */}
              <motion.div 
                {...cardMotion(0.1)}
                className="bg-[var(--color-surface)] rounded-3xl p-6 sm:p-8 border border-[var(--color-border)] shadow-xs relative overflow-hidden transition-all duration-300 hover:shadow-md"
              >
                <div className="w-10 h-1.5 bg-[var(--color-primary)] rounded-full mb-5" />
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--color-primary)] mb-2">
                  98.4% DIAGNOSTIC ACCURACY
                </div>
                <p className="text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed">
                  Benchmarked against Ethiopian Agricultural Authority agronomist evaluations across 12,000 field specimens.
                </p>
              </motion.div>

              {/* Box 2 */}
              <motion.div 
                {...cardMotion(0.2)}
                className="bg-[var(--color-surface)] rounded-3xl p-6 sm:p-8 border border-[var(--color-border)] shadow-xs relative overflow-hidden transition-all duration-300 hover:shadow-md"
              >
                <div className="w-10 h-1.5 bg-[var(--color-primary)] rounded-full mb-5" />
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--color-primary)] mb-2">
                  220% AVERAGE YIELD INCREASE
                </div>
                <p className="text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed">
                  Documented across 48 monitored Highland wheat and teff pilot plots in East Shewa agricultural corridor.
                </p>
              </motion.div>

              {/* Box 3 */}
              <motion.div 
                {...cardMotion(0.3)}
                className="bg-[var(--color-surface)] rounded-3xl p-6 sm:p-8 border border-[var(--color-border)] shadow-xs relative overflow-hidden transition-all duration-300 hover:shadow-md"
              >
                <div className="w-10 h-1.5 bg-[var(--color-primary)] rounded-full mb-5" />
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--color-primary)] mb-2">
                  NO EXPENSIVE HARDWARE REQUIRED
                </div>
                <p className="text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed">
                  Zero sensor installation costs. Operates using existing satellite feeds, micro-weather radar, and basic mobile phones.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 7: ACCELERATE HARVEST OUTCOMES (Call To Action Box)
            - Animated Title and Form
            ========================================================================= */}
        <section className="py-24 md:py-32 bg-[var(--color-surface)]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              {...titleMotion}
              className="bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-primary-light)]/40 rounded-3xl border border-[var(--color-border)] p-8 sm:p-14 text-center shadow-md relative overflow-hidden"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[var(--color-text-primary)] leading-tight">
                Ready to accelerate <br />
                harvest outcomes?
              </h2>

              <p className="mt-4 text-sm sm:text-base text-[var(--color-text-muted)] max-w-xl mx-auto leading-relaxed">
                Schedule a field demonstration or connect your cooperative union to the national agronomic intelligence network.
              </p>

              {/* Interactive Submit Form */}
              <div className="mt-8 max-w-md mx-auto">
                {ctaSubmitted ? (
                  <div className="p-4 rounded-full bg-[var(--color-primary-light)] border border-[var(--color-primary)]/30 text-[var(--color-primary)] text-sm font-semibold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[var(--color-primary)]" />
                    Pilot request recorded. Our agronomy team will contact your station within 24 hours.
                  </div>
                ) : (
                  <form onSubmit={handleCtaSubmit} className="flex flex-col sm:flex-row items-center gap-2.5">
                    <input
                      type="text"
                      required
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      placeholder="Enter your email or phone number"
                      className="w-full px-5 py-3.5 rounded-full border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] shadow-xs"
                    />
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full sm:w-auto rounded-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-semibold px-7 py-3.5 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shadow-sm transition-all duration-300 hover:scale-[1.02]"
                    >
                      Connect <ArrowRight className="w-4 h-4" />
                    </Button>
                  </form>
                )}
              </div>

              {/* Security & Setup Bullet Notes */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--color-text-muted)] font-mono">
                <span>• Enterprise Grade &amp; Cooperative Compliant</span>
                <span>• Kebele Level Setup in Under 48h</span>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  )
}
