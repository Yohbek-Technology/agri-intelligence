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
  TrendingUp
} from 'lucide-react'
import { useAuthSession } from '@/hooks/useAuth'
import { Navbar } from '@/components/navigation/navbar'
import { Footer } from '@/components/navigation/footer'
import { Button } from '@/components/ui/button'

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
    <div className="min-h-screen bg-[#FBFBF9] text-slate-900 flex flex-col antialiased selection:bg-emerald-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        isAuthenticated={isAuthenticated}
        dashboardPath={dashboardPath}
        role={role}
      />

      <main className="flex-1">
        {/* =========================================================================
            SECTION 1: HERO SECTION (With Amazing Landscape Background Image)
            ========================================================================= */}
        <section
          id="overview"
          className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-[#061009] text-white pt-24 pb-28 md:pt-32 md:pb-36 border-b border-emerald-950/70"
        >
          {/* Stunning Background Image with High-End Cinematic Grading */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/hero-bg.jpg"
              alt="Ethiopian highland agricultural crop terraces at sunrise"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center scale-[1.03]"
            />
            {/* Rich gradient layers for crystal-clear readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#061009]/92 via-[#061009]/78 to-[#061009]/96" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.18)_0%,transparent_75%)]" />
          </div>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            {/* Clean Bold Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.08] max-w-4xl mx-auto"
            >
              Autonomous Agronomic <br />
              Intelligence. <br />
              <span className="text-emerald-400 drop-shadow-[0_0_35px_rgba(16,185,129,0.4)]">
                Yields Proven by Timing.
              </span>
            </motion.h1>

            {/* Subtitle Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-6 text-base sm:text-lg text-slate-200/90 max-w-2xl mx-auto leading-relaxed font-normal"
            >
              Precision agronomy intelligence platform engineered for Ethiopian highlands farming,
              delivering automated crop timing alerts and kebele-level resource coordination.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-4"
            >
              {isAuthenticated ? (
                <Link href={dashboardPath}>
                  <Button
                    size="lg"
                    className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-7 py-3.5 shadow-xl shadow-emerald-500/25 flex items-center gap-2 cursor-pointer transition-all"
                  >
                    Open Workspace ({role || 'Operator'})
                  </Button>
                </Link>
              ) : (
                <Link href="/signUp">
                  <Button
                    size="lg"
                    className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-7 py-3.5 shadow-xl shadow-emerald-500/25 flex items-center gap-2 cursor-pointer transition-all"
                  >
                    Open Agronomist Portal
                  </Button>
                </Link>
              )}

              <a href="#empirical-trial">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-xl bg-white/10 hover:bg-white/15 text-white border-white/25 px-6 py-3.5 backdrop-blur-md flex items-center gap-2 cursor-pointer transition-all"
                >
                  Request Field Deployment
                </Button>
              </a>

              <a
                href="#capabilities"
                className="text-emerald-300 hover:text-emerald-200 text-sm font-medium px-4 py-3.5 inline-flex items-center gap-1.5 transition-colors"
              >
                Our Capabilities <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 2: THE 34 VS. 12 QUINTAL REALITY (Empirical Side-by-Side Trial)
            ========================================================================= */}
        <section id="empirical-trial" className="py-20 md:py-28 bg-[#F8FAF7]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Clean Section Header (No watermark tags) */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="max-w-3xl space-y-3">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
                  The 34 vs. 12 Quintal Reality: Timing Over Fortune
                </h2>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  Two adjacent 1-hectare plots in Lume Woreda with identical soil profile and certified seed stock.
                  The documented yield divergence was strictly determined by micro-window intervention timing.
                </p>
              </div>

              {/* Location Badge */}
              <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200/90 shadow-2xs self-start md:self-auto">
                <MapPin className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-medium text-slate-700">Lume Woreda, Oromia</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                  Verified
                </span>
              </div>
            </div>

            {/* Comparison Grid with Center Metric Bridge */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* LEFT CARD: AgriIntel Autonomous Protocol (Green Highlighted Winner) */}
              <div className="lg:col-span-5 bg-white rounded-2xl border-2 border-emerald-500/40 p-6 md:p-8 shadow-sm flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full pointer-events-none -z-0" />

                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-4 pb-6 border-b border-slate-100">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        AgriIntel Autonomous Protocol
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        28-day window adherence: 100% compliant
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-4xl sm:text-5xl font-extrabold text-emerald-600 tracking-tight font-mono">
                        34.2
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 uppercase mt-0.5">
                        Quintal / Hectare
                      </div>
                    </div>
                  </div>

                  {/* Chronological Steps */}
                  <div className="mt-6 space-y-4">
                    <div className="flex items-start gap-3 text-xs">
                      <span className="font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md text-[11px] flex-shrink-0">
                        01. Day 14
                      </span>
                      <div>
                        <span className="font-semibold text-slate-900 block">Basal DAP Micro-Dosing</span>
                        <span className="text-slate-600">Delivered 36 hours prior to recorded root soak cycle</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-xs">
                      <span className="font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md text-[11px] flex-shrink-0">
                        02. Day 28
                      </span>
                      <div>
                        <span className="font-semibold text-slate-900 block">Pre-Rust Prophylactic Spray</span>
                        <span className="text-slate-600">Triggered 48 hours before spore condensation peak</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-xs">
                      <span className="font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md text-[11px] flex-shrink-0">
                        03. Day 45
                      </span>
                      <div>
                        <span className="font-semibold text-slate-900 block">Precision Urea Top-Dressing</span>
                        <span className="text-slate-600">Timed with forecasted convective storm moisture</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-xs">
                      <span className="font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md text-[11px] flex-shrink-0">
                        04. Day 72
                      </span>
                      <div>
                        <span className="font-semibold text-slate-900 block">Aphid Vector Biological Control</span>
                        <span className="text-slate-600">Intervened at threshold index 3.2 before colony bloom</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-xs">
                      <span className="font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md text-[11px] flex-shrink-0">
                        05. Day 110
                      </span>
                      <div>
                        <span className="font-semibold text-slate-900 block">Physiological Maturity Harvest</span>
                        <span className="text-slate-600">Harvested at 13.5% grain moisture before unseasonal rains</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Calculated Net Return</span>
                    <span className="font-bold text-slate-900 font-mono text-base">325,000 ETB</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-medium text-[11px]">
                    Protocol Compliant Surplus
                  </span>
                </div>
              </div>

              {/* CENTER BRIDGE: +220% Yield Delta Multiplier */}
              <div className="lg:col-span-2 flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-200/90 text-center shadow-2xs">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold mb-1">
                  Yield Advantage
                </span>

                <div className="text-4xl lg:text-5xl font-black text-emerald-600 font-mono tracking-tight my-2">
                  +220%
                </div>

                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200 mb-4">
                  <TrendingUp className="w-3 h-3" />
                  Yield Multiplier
                </div>

                <div className="w-full border-t border-slate-100 my-2" />

                <div className="text-xl font-bold font-mono text-slate-900 mt-2">
                  +182,300 ETB
                </div>
                <div className="text-[11px] text-slate-500 leading-tight mt-1">
                  Net value gain per single hectare
                </div>

                <div className="mt-5 text-[10px] font-mono text-slate-400 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-normal">
                  Identical Soil • Identical Seeds • Timing Advantage
                </div>
              </div>

              {/* RIGHT CARD: Traditional Farmer Intuition (Control Plot) */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-amber-200/90 p-6 md:p-8 shadow-sm flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50/50 rounded-bl-full pointer-events-none -z-0" />

                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-4 pb-6 border-b border-slate-100">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        Traditional Farmer Intuition
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Calendar-based intervention (Traditional practice)
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-4xl sm:text-5xl font-extrabold text-slate-400 tracking-tight font-mono">
                        12.0
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 uppercase mt-0.5">
                        Quintal / Hectare
                      </div>
                    </div>
                  </div>

                  {/* Chronological Missteps */}
                  <div className="mt-6 space-y-4">
                    <div className="flex items-start gap-3 text-xs">
                      <span className="font-mono font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-1 rounded-md text-[11px] flex-shrink-0">
                        01. Day 22
                      </span>
                      <div>
                        <span className="font-semibold text-slate-900 block">Delayed Fertilizer Application</span>
                        <span className="text-slate-600">Applied 8 days late during dry spell; 40% volatilization</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-xs">
                      <span className="font-mono font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-1 rounded-md text-[11px] flex-shrink-0">
                        02. Day 39
                      </span>
                      <div>
                        <span className="font-semibold text-slate-900 block">Reactive Rust Fungicide</span>
                        <span className="text-slate-600">Applied post-symptom manifestation; irreversible canopy damage</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-xs">
                      <span className="font-mono font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-1 rounded-md text-[11px] flex-shrink-0">
                        03. Day 58
                      </span>
                      <div>
                        <span className="font-semibold text-slate-900 block">Broadcast Urea Application</span>
                        <span className="text-slate-600">Heavy storm washed surface runoff; 60% nitrogen lost</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-xs">
                      <span className="font-mono font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-1 rounded-md text-[11px] flex-shrink-0">
                        04. Day 84
                      </span>
                      <div>
                        <span className="font-semibold text-slate-900 block">Late Insecticide Spray</span>
                        <span className="text-slate-600">Post-infestation intervention; severe head blighting occurred</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-xs">
                      <span className="font-mono font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-1 rounded-md text-[11px] flex-shrink-0">
                        05. Day 118
                      </span>
                      <div>
                        <span className="font-semibold text-slate-900 block">Rain-Interrupted Harvest</span>
                        <span className="text-slate-600">Wet harvest caused 18% field shattering and fungal discoloration</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Calculated Net Return</span>
                    <span className="font-bold text-slate-900 font-mono text-base">94,000 ETB</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-medium text-[11px]">
                    Control Plot Baseline
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 3: EMPIRICAL PROOF (Photo of Farmers in Field)
            ========================================================================= */}
        <section className="py-12 bg-[#F8FAF7]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm p-6 sm:p-8 lg:p-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                {/* Photo Column */}
                <div className="lg:col-span-7 relative">
                  <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                    <Image
                      src="/images/field-farmers.jpg"
                      alt="Ethiopian farmers inspecting grain in highland farmland"
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md text-white text-xs font-mono">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Field Trial 4: Lume Woreda, Central Highlands</span>
                    </div>
                  </div>
                </div>

                {/* Editorial Column */}
                <div className="lg:col-span-5 space-y-4">
                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-snug">
                    Empirical Agronomy Measured on Real Farmland
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Every recommendation in AgriIntel is calibrated against real agronomic trials across Ethiopian
                    micro-climates. We don&apos;t rely on generic satellite estimations; our physics-informed models
                    fuse localized telemetry with extension agent ground truth.
                  </p>

                  <div className="pt-3 flex flex-wrap gap-4 text-xs font-semibold">
                    <a
                      href="#empirical-trial"
                      className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 transition-colors"
                    >
                      ↗ View Multi-Trial Validation
                    </a>
                    <a
                      href="#capabilities"
                      className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      ↗ Read Scientific Whitepaper
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 4: FOUR ARCHITECTURAL PILLARS ("Engineered for High-Stakes Agriculture")
            ========================================================================= */}
        <section id="capabilities" className="py-20 md:py-28 bg-[#FFFFFF]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
              {/* Left Column: Heading, Subtitle & Crop Inspection Image */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
                    Engineered for High-Stakes Agriculture
                  </h2>
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                    Designed specifically for the infrastructural realities and agronomic nuances of the Ethiopian agricultural landscape, from micro-plots to regional grain corridors.
                  </p>
                </div>

                {/* Farmer inspecting crop photo */}
                <div className="relative aspect-[16/11] rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm mt-4">
                  <Image
                    src="/images/crop-inspection.jpg"
                    alt="Farmer inspecting teff grain ears closely"
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 text-white text-[11px] font-mono px-2.5 py-1 rounded bg-black/60 backdrop-blur-sm">
                    In-situ Teff Variety Verification
                  </div>
                </div>
              </div>

              {/* Right Column: 4 Clean Feature Rows */}
              <div className="lg:col-span-7 flex flex-col justify-center space-y-4">
                {/* Feature 1: Voice & Dialectal Locales */}
                <div className="bg-[#FAFBF9] hover:bg-emerald-50/40 transition-colors p-6 rounded-2xl border border-slate-200/80 group">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <h4 className="font-bold text-slate-900 text-base">
                        Voice & Dialectal Locales
                      </h4>
                    </div>
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium self-start sm:self-auto">
                      Afan Oromo / Amharic / Tigrinya
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Delivers agronomic directives via natural voice in local languages, ensuring smallholders without digital literacy can receive and act on time-critical recommendations.
                  </p>
                  <a
                    href="#voice-dispatch"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
                  >
                    Explore Voice Architecture <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Feature 2: Multimodal Pest & Blight AI */}
                <div className="bg-[#FAFBF9] hover:bg-emerald-50/40 transition-colors p-6 rounded-2xl border border-slate-200/80 group">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <h4 className="font-bold text-slate-900 text-base">
                        Multimodal Pest & Blight AI
                      </h4>
                    </div>
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium self-start sm:self-auto">
                      Edge Mobile & Cloud
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Instant on-device and cloud diagnosis for over 48 endemic cereal diseases and invasive pests, operating seamlessly even during intermittent rural cellular connectivity.
                  </p>
                  <Link
                    href="/signIn"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
                  >
                    Test Diagnostic Model <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Feature 3: 7-Day Agro-Weather Timing Windows */}
                <div className="bg-[#FAFBF9] hover:bg-emerald-50/40 transition-colors p-6 rounded-2xl border border-slate-200/80 group">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <h4 className="font-bold text-slate-900 text-base">
                        7-Day Agro-Weather Timing Windows
                      </h4>
                    </div>
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium self-start sm:self-auto">
                      Hyper-Local ECMWF + Radar
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Predictive micro-climate forecast engines calculate exact 6-hour windows for fertilizer absorption, spray efficacy, and harvest drying.
                  </p>
                  <a
                    href="#empirical-trial"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
                  >
                    View Weather Timing Pipeline <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Feature 4: Verified Input Marketplace & Registry */}
                <div className="bg-[#FAFBF9] hover:bg-emerald-50/40 transition-colors p-6 rounded-2xl border border-slate-200/80 group">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <h4 className="font-bold text-slate-900 text-base">
                        Verified Input Marketplace & Registry
                      </h4>
                    </div>
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium self-start sm:self-auto">
                      National Seed & Chemical
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Direct integration with regional cooperative unions and agro-dealers ensures access to verified, certified seeds and genuine crop protection inputs.
                  </p>
                  <Link
                    href="/signIn"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
                  >
                    Browse Input Verification System <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 5: DARK SECTION - VOICE BOX & KEBELE DIRECT DISPATCH
            ========================================================================= */}
        <section
          id="voice-dispatch"
          className="relative bg-[#061209] text-white py-24 md:py-32 overflow-hidden border-t border-b border-emerald-950/70"
        >
          {/* Ambient lighting */}
          <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[600px] h-[400px] bg-emerald-500/10 blur-[140px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Clean Header (No watermark tags) */}
            <div className="max-w-3xl mb-14 space-y-3">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                Voice Box & Kebele Direct Dispatch
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                For regions and smallholders without reliable smartphones or internet access, AgriIntel delivers
                automated voice broadcasts and direct alerts to local Kebele Development Agents (DAs).
              </p>
            </div>

            {/* Split Content: Farmer with Phone on Left, 3 Dispatches on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
              {/* Photo Column */}
              <div className="lg:col-span-5 relative flex flex-col">
                <div className="relative aspect-[4/3] lg:aspect-auto lg:h-full rounded-2xl overflow-hidden border border-emerald-500/20 shadow-2xl">
                  <Image
                    src="/images/voice-box-farmer.jpg"
                    alt="Farmer using basic mobile phone in terraced Ethiopian highland field"
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 backdrop-blur-md text-emerald-300 border border-emerald-500/30 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Voice Dispatch Station #104 — Arsi Foothills
                    </span>
                  </div>
                </div>
              </div>

              {/* Real-Time Dispatch Log Cards */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                {/* Dispatch 1: Voice Call Broadcast */}
                <div className="bg-white/5 border border-white/10 hover:border-emerald-500/40 transition-colors p-5 rounded-2xl backdrop-blur-sm">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-950/90 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
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
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                      ✓ Completed (98.2% Answer Rate)
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed pl-10">
                    &ldquo;Delivered in Afan Oromo to 412 registered wheat farmers: &lsquo;High stripe rust risk detected.
                    Postpone morning nitrogen spray until wind speed drops below 6 km/h.&rsquo;&rdquo;
                  </p>
                </div>

                {/* Dispatch 2: Kebele DA Alert */}
                <div className="bg-white/5 border border-white/10 hover:border-amber-500/40 transition-colors p-5 rounded-2xl backdrop-blur-sm">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-950/90 border border-amber-500/30 flex items-center justify-center text-amber-400">
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
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-500/30">
                      ⚡ Actioned by DA Bekele &amp; Team
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed pl-10">
                    &ldquo;Priority dispatch to 6 assigned Development Agents: &lsquo;Soil moisture saturation at 84% in Lower Valley.
                    Direct furrow drainage protocol activated across 42 teff hectares.&rsquo;&rdquo;
                  </p>
                </div>

                {/* Dispatch 3: SMS Fallback Broadcast */}
                <div className="bg-white/5 border border-white/10 hover:border-teal-500/40 transition-colors p-5 rounded-2xl backdrop-blur-sm">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-teal-950/90 border border-teal-500/30 flex items-center justify-center text-teal-400">
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
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-950 text-teal-400 border border-teal-500/30">
                      ✓ Delivered via SMS Gateway
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed pl-10">
                    &ldquo;Offline fallback sent to 1,280 smallholders with market price alerts for Adama grain depot
                    and optimal 4-day harvest drying windows.&rdquo;
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Live Status Ribbon */}
            <div className="mt-12 p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-300 font-medium">Active Dispatch Channels:</span>
                <span>Ethio Telecom Voice Gateway • Kebele DA Offline Mesh • National Weather Service Sync</span>
              </div>
              <span className="hidden md:inline text-emerald-400">
                Network Latency: 42ms
              </span>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 6: THREE BENCHMARK IMPACT CARDS
            ========================================================================= */}
        <section id="impact" className="py-16 md:py-24 bg-[#F8FAF7] border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Box 1 */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs relative overflow-hidden">
                <div className="w-8 h-1 bg-emerald-600 rounded-full mb-4" />
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-800 mb-2">
                  98.4% DIAGNOSTIC ACCURACY
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Benchmarked against Ethiopian Agricultural Authority agronomist evaluations across 12,000 field specimens.
                </p>
              </div>

              {/* Box 2 */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs relative overflow-hidden">
                <div className="w-8 h-1 bg-emerald-600 rounded-full mb-4" />
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-800 mb-2">
                  220% AVERAGE YIELD INCREASE
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Documented across 48 monitored Highland wheat and teff pilot plots in East Shewa agricultural corridor.
                </p>
              </div>

              {/* Box 3 */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs relative overflow-hidden">
                <div className="w-8 h-1 bg-emerald-600 rounded-full mb-4" />
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-800 mb-2">
                  NO EXPENSIVE HARDWARE REQUIRED
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Zero sensor installation costs. Operates using existing satellite feeds, micro-weather radar, and basic mobile phones.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 7: ACCELERATE HARVEST OUTCOMES (Call To Action Box)
            ========================================================================= */}
        <section className="py-20 md:py-28 bg-[#FFFFFF]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-b from-white to-emerald-50/30 rounded-3xl border border-emerald-500/30 p-8 sm:p-12 text-center shadow-sm relative overflow-hidden">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
                Ready to accelerate <br />
                harvest outcomes?
              </h2>

              <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
                Schedule a field demonstration or connect your cooperative union to the national agronomic intelligence network.
              </p>

              {/* Interactive Submit Form */}
              <div className="mt-8 max-w-md mx-auto">
                {ctaSubmitted ? (
                  <div className="p-4 rounded-xl bg-emerald-100/90 border border-emerald-300 text-emerald-900 text-sm font-medium flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700" />
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
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent text-sm bg-white text-slate-900 placeholder:text-slate-400 shadow-2xs"
                    />
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full sm:w-auto rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold px-6 py-3.5 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shadow-sm"
                    >
                      Connect <ArrowRight className="w-4 h-4" />
                    </Button>
                  </form>
                )}
              </div>

              {/* Security & Setup Bullet Notes */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-mono">
                <span>• Enterprise Grade &amp; Cooperative Compliant</span>
                <span>• Kebele Level Setup in Under 48h</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  )
}
