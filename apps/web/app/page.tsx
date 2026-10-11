'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useAuthSession } from '@/hooks/useAuth'
import { Navbar } from '@/components/navigation/navbar'
import { Footer } from '@/components/navigation/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function HomePage() {
  const { isAuthenticated, dashboardPath, role } = useAuthSession()
  const [activeSpecimen, setActiveSpecimen] = useState(0)

  const specimens = [
    {
      crop: 'Magna Teff (Quncho)',
      condition: 'Stem Borer & Heavy Soil Saturation',
      confidence: '98.4%',
      severity: 'Medium Alert',
      severityColor: 'accent' as const,
      prescription: 'Excavate perimeter drainage furrows within 24h. Apply targeted biological neem extract.',
      image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1000&q=80',
      audioPrompt: 'የጤፍ ግንድ ተባይ ምርመራ ውጤት: ፈሳሽ ማስተንፈሻ ቦይ ይቆፍሩ።',
    },
    {
      crop: 'Kingbird Durum Wheat',
      condition: 'Stripe Rust (Puccinia striiformis)',
      confidence: '96.2%',
      severity: 'Critical Urgency',
      severityColor: 'danger' as const,
      prescription: 'Emergency Triazole fungicide spray required within 48h. Notify Kebele DA immediately.',
      image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=1000&q=80',
      audioPrompt: 'የስንዴ ቢጫ ዋግ በሽታ ተገኝቷል። በ48 ሰዓታት ውስጥ ፀረ-ፈንገስ ይርጩ።',
    },
    {
      crop: 'Highland Haricot Bean',
      condition: 'Nitrogen & Zinc Micronutrient Deficiency',
      confidence: '95.1%',
      severity: 'Advisory Level',
      severityColor: 'primary' as const,
      prescription: 'Side-dress with NPS Boron compound prior to forecasted light precipitation.',
      image: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=1000&q=80',
      audioPrompt: 'የቦሎቄ ማዳበሪያ ጉድለት: የNPS ቦሮን ማዳበሪያ ከዝናብ በፊት ይጨምሩ።',
    },
  ]

  const active = specimens[activeSpecimen]!

  const weatherTicks = [
    { location: 'Adama Central', temp: '26°C', condition: 'Clear Sky', wind: '8 km/h', moisture: '34%', alert: 'Optimal Spray Window' },
    { location: 'Wonji Plains', temp: '28°C', condition: 'Dry Silt', wind: '11 km/h', moisture: '28%', alert: 'Irrigation Required' },
    { location: 'Boku Ridge', temp: '24°C', condition: 'High Solar', wind: '6 km/h', moisture: '38%', alert: 'Tillering Phase' },
    { location: 'Lume Basin', temp: '25°C', condition: 'Scattered Cloud', wind: '9 km/h', moisture: '31%', alert: 'Fertilizer Ready' },
    { location: 'Arsi Foothills', temp: '21°C', condition: 'Dew Cover', wind: '5 km/h', moisture: '42%', alert: 'Monitor Rust' },
  ]

  const marketQuotes = [
    { crop: 'Quncho Teff Magna (White)', market: 'Adama Central Grain Exchange', price: '9,450 ETB / Q', change: '+2.7%', status: 'up' },
    { crop: 'Sergegna Mixed Teff', market: 'Wonji Secondary Depot', price: '7,800 ETB / Q', change: '-0.6%', status: 'down' },
    { crop: 'Kingbird Durum Wheat', market: 'Boku Cooperative Union', price: '5,600 ETB / Q', change: '+3.7%', status: 'up' },
    { crop: 'Red Haricot Beans (Export Grade)', market: 'Adama Terminal Market', price: '6,200 ETB / Q', change: '+1.6%', status: 'up' },
    { crop: 'Urea (46% Nitrogen Fertilizer)', market: 'Government Subsidized Depot', price: '3,850 ETB / Q', change: '0.0%', status: 'flat' },
    { crop: 'NPS Boron Compound Fertilizer', market: 'East Shewa Cooperative Hub', price: '4,100 ETB / Q', change: '0.0%', status: 'flat' },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-primary selection:text-white">
      <Navbar
        isAuthenticated={isAuthenticated}
        dashboardPath={dashboardPath}
        role={role}
      />

      <main className="flex-1">
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-black text-white">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=2000&q=85"
              alt="Ethiopian highland agriculture fields"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center opacity-45 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-black/60 to-black/80" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(39,68,34,0.35),transparent_60%)]" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 relative z-10 w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="max-w-3xl space-y-6 text-center sm:text-left"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-mono font-medium tracking-wide">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>ADAMA AGRICULTURAL INTELLIGENCE OS 2.6</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] font-mono text-white">
                Autonomous{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">
                  Extension OS
                </span>{' '}
                for Highland Agronomy
              </h1>

              <p className="text-base sm:text-lg text-white/85 font-sans leading-relaxed max-w-2xl">
                Real-time agro-meteorological radar, computer vision disease diagnostics, offline field agent mesh synchronization, and localized grain market price telemetry for Ethiopian smallholder ecosystems.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                {isAuthenticated ? (
                  <Link href={dashboardPath} className="w-full sm:w-auto">
                    <Button variant="primary" size="lg" fullWidth className="font-mono text-sm px-8 shadow-2xl">
                      Launch Operations Station ({role || 'Operator'}) →
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/signUp" className="w-full sm:w-auto">
                      <Button variant="primary" size="lg" fullWidth className="font-mono text-sm px-8 shadow-2xl">
                        Deploy Station Profile →
                      </Button>
                    </Link>
                    <Link href="/signIn" className="w-full sm:w-auto">
                      <Button variant="secondary" size="lg" fullWidth className="font-mono text-sm px-8">
                        Operator Sign In
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              <div className="pt-10 grid grid-cols-3 gap-6 border-t border-white/15 max-w-lg mx-auto sm:mx-0">
                <div>
                  <div className="text-2xl sm:text-3xl font-mono font-extrabold text-white">
                    38 Kebeles
                  </div>
                  <div className="text-xs font-mono text-white/70 mt-0.5">
                    Digitized Vertisols
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-mono font-extrabold text-emerald-400">
                    96.4%
                  </div>
                  <div className="text-xs font-mono text-white/70 mt-0.5">
                    AI Diagnostic Precision
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-mono font-extrabold text-amber-300">
                    2G SMS
                  </div>
                  <div className="text-xs font-mono text-white/70 mt-0.5">
                    Offline Telephony Fallback
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="hidden xl:block absolute right-16 top-1/3 z-20 w-80 bg-white/95 text-text-primary p-5 rounded-3xl shadow-2xl border border-white/40 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-primary">[RADAR TELEMETRY]</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                OPTIMAL
              </span>
            </div>
            <div className="text-sm font-bold font-mono">Boku Ridge Plot 03</div>
            <div className="text-xs text-text-muted font-mono mb-3">Magna Teff Field (1.2 Ha)</div>
            <div className="space-y-2 text-xs font-mono bg-surface-subtle p-3 rounded-2xl border border-border">
              <div className="flex justify-between">
                <span className="text-text-muted">Vertisol Moisture:</span>
                <span className="font-bold text-text-primary">34.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Rain Onset:</span>
                <span className="font-bold text-emerald-700">In 36 Hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Spray Verdict:</span>
                <span className="font-bold text-primary">Farm Recommended</span>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="bg-[#151A14] text-white py-3.5 overflow-hidden border-y border-[#263126] font-mono text-xs">
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-8 overflow-x-auto whitespace-nowrap no-scrollbar">
            <span className="font-bold text-accent uppercase tracking-wider flex items-center gap-2 flex-shrink-0">
              <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
              Live Agro-Meteorology // Adama Basin:
            </span>
            {weatherTicks.map((tick, i) => (
              <div key={i} className="inline-flex items-center gap-2 flex-shrink-0 text-white/70">
                <span className="text-white font-semibold">{tick.location}:</span>
                <span>{tick.temp}</span>
                <span>•</span>
                <span>{tick.condition}</span>
                <span>•</span>
                <span className="text-emerald-400">{tick.alert}</span>
                <span className="text-white/20">|</span>
              </div>
            ))}
          </div>
        </section>

        <section id="diagnostics" className="py-24 sm:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <Badge variant="primary" dot>
                COMPUTER VISION BENCHMARK
              </Badge>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight font-mono uppercase">
                Multimodal Crop Disease Scanner
              </h2>
              <p className="text-base text-text-muted font-sans">
                Fine-tuned on 85,000+ highland crop specimens across Ethiopian micro-climates. Generates instant actionable advisories in Amharic, Afaan Oromoo, and Tigrinya.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-5 space-y-4">
                <span className="text-xs font-mono text-text-muted uppercase tracking-wider block font-semibold">
                  Select Field Specimen to Inspect:
                </span>
                {specimens.map((spec, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setActiveSpecimen(idx)}
                    className={`p-5 rounded-3xl border-2 transition-all cursor-pointer ${
                      activeSpecimen === idx
                        ? 'bg-surface-subtle border-primary shadow-lg ring-2 ring-primary/10'
                        : 'bg-white border-border hover:border-border-strong shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-base text-text-primary">{spec.crop}</span>
                      <Badge variant={activeSpecimen === idx ? 'primary' : 'neutral'}>
                        {spec.confidence} Match
                      </Badge>
                    </div>
                    <p className="text-xs font-mono text-text-muted">{spec.condition}</p>
                  </motion.div>
                ))}
              </div>

              <div className="lg:col-span-7">
                <div className="bg-white border-2 border-border-strong rounded-3xl overflow-hidden shadow-2xl relative">
                  <div className="relative h-72 sm:h-96 overflow-hidden bg-black">
                    <Image
                      src={active.image}
                      alt={active.condition}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover object-center opacity-90"
                    />
                    <motion.div
                      animate={{ top: ['0%', '95%', '0%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 shadow-[0_0_15px_#34d399] z-20 pointer-events-none"
                    />
                    <div className="absolute top-4 left-4 z-10">
                      <Badge variant="danger" dot>
                        DIAGNOSTIC SCANNER ACTIVE
                      </Badge>
                    </div>
                    <div className="absolute bottom-4 right-4 z-10 bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-white font-mono text-xs">
                      Confidence Score: {active.confidence}
                    </div>
                  </div>

                  <div className="p-6 sm:p-8 space-y-5">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <span className="text-xs font-mono text-text-muted uppercase">Detected Condition:</span>
                        <h3 className="text-xl font-bold font-mono text-text-primary mt-0.5">{active.condition}</h3>
                      </div>
                      <Badge variant={active.severityColor}>{active.severity}</Badge>
                    </div>

                    <div className="p-5 rounded-2xl bg-surface-subtle border border-border">
                      <span className="font-bold text-primary block mb-1 font-mono uppercase text-xs">
                        Agronomic Protocol Prescription:
                      </span>
                      <p className="text-sm text-text-primary font-sans leading-relaxed">{active.prescription}</p>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🔊</span>
                        <span className="text-emerald-900 font-bold">Audio Extension Dispatch:</span>
                      </div>
                      <span className="text-emerald-800 truncate max-w-xs">{active.audioPrompt}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="intelligence" className="py-24 sm:py-32 bg-surface-subtle border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-3">
              <Badge variant="primary" dot>
                FIELD-TESTED INFRASTRUCTURE
              </Badge>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight font-mono uppercase">
                Engineered for Highland Realities
              </h2>
              <p className="text-base text-text-muted font-sans">
                Solving the structural disconnect between rural smallholders, frontline field agents, and municipal agricultural bureaus.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-3xl border border-border shadow-md space-y-4 hover:shadow-xl transition-all">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-3xl font-bold">
                  🌦
                </div>
                <h3 className="text-xl font-bold font-mono text-text-primary">
                  7-Day &ldquo;Farm or Not&rdquo; Radar
                </h3>
                <p className="text-sm text-text-muted leading-relaxed font-sans">
                  Algorithmic precipitation analysis calculating soil washoff risks, wind shear thresholds, and solar irradiance windows before farmers commit expensive fertilizer inputs.
                </p>
                <div className="pt-3 border-t border-border-subtle">
                  <span className="text-xs font-mono font-bold text-accent">RADAR AGRO-AI</span>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-border shadow-md space-y-4 hover:shadow-xl transition-all">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-3xl font-bold">
                  🌱
                </div>
                <h3 className="text-xl font-bold font-mono text-text-primary">
                  Highland Vertisol Dynamics
                </h3>
                <p className="text-sm text-text-muted leading-relaxed font-sans">
                  Deep moisture simulation calibrated specifically for heavy cracking clay vertisols found across the Great Rift Valley and East Shewa basin.
                </p>
                <div className="pt-3 border-t border-border-subtle">
                  <span className="text-xs font-mono font-bold text-accent">SOIL PHYSICS</span>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-border shadow-md space-y-4 hover:shadow-xl transition-all">
                <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center text-3xl font-bold">
                  📡
                </div>
                <h3 className="text-xl font-bold font-mono text-text-primary">
                  Offline Field Agent Mesh
                </h3>
                <p className="text-sm text-text-muted leading-relaxed font-sans">
                  Development agents manage 30 to 50 smallholders completely offline in remote kebeles, auto-synchronizing ledger records upon reconnecting to municipal WiFi or cellular mesh.
                </p>
                <div className="pt-3 border-t border-border-subtle">
                  <span className="text-xs font-mono font-bold text-accent">OFFLINE SYNC</span>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-border shadow-md space-y-4 hover:shadow-xl transition-all">
                <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center text-3xl font-bold">
                  🎙
                </div>
                <h3 className="text-xl font-bold font-mono text-text-primary">
                  Voice & 2G SMS Telephony
                </h3>
                <p className="text-sm text-text-muted leading-relaxed font-sans">
                  Smallholders without smartphones interact in spoken Amharic, Afaan Oromoo, or Tigrinya over standard 2G mobile phone networks with zero internet connectivity required.
                </p>
                <div className="pt-3 border-t border-border-subtle">
                  <span className="text-xs font-mono font-bold text-accent">MULTILINGUAL VOICE</span>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-border shadow-md space-y-4 hover:shadow-xl transition-all">
                <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-800 flex items-center justify-center text-3xl font-bold">
                  🏛
                </div>
                <h3 className="text-xl font-bold font-mono text-text-primary">
                  Depot Stock & Quota Ledgers
                </h3>
                <p className="text-sm text-text-muted leading-relaxed font-sans">
                  Municipal agriculture officers supervise real-time warehouse inventory, fertilizer buffer quotas, and automated shortage alarms across 14 woredas.
                </p>
                <div className="pt-3 border-t border-border-subtle">
                  <span className="text-xs font-mono font-bold text-accent">MUNICIPAL GOVERNANCE</span>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-border shadow-md space-y-4 hover:shadow-xl transition-all">
                <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center text-3xl font-bold">
                  🛡
                </div>
                <h3 className="text-xl font-bold font-mono text-text-primary">
                  Outbreak Containment Desk
                </h3>
                <p className="text-sm text-text-muted leading-relaxed font-sans">
                  Automated radius geofencing detects clustered pathology reports within 15 km, instantly triggering emergency SMS broadcast containment protocols.
                </p>
                <div className="pt-3 border-t border-border-subtle">
                  <span className="text-xs font-mono font-bold text-accent">BIOSECURITY MESH</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="markets" className="py-24 sm:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
              <div>
                <Badge variant="accent" dot>
                  TRANSPARENCY LEDGER
                </Badge>
                <h2 className="text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight font-mono uppercase mt-2">
                  Adama Grain & Input Market Board
                </h2>
                <p className="text-base text-text-muted font-sans mt-1">
                  Verified cooperative exchange rates updated twice daily via SMS telemetry.
                </p>
              </div>

              <div className="text-xs font-mono text-text-muted">
                Last Telemetry Sync: Today, 14:00 EAT
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {marketQuotes.map((q, i) => (
                <div
                  key={i}
                  className="bg-white border-2 border-border/80 rounded-3xl p-6 shadow-md hover:border-border-strong hover:shadow-xl transition-all"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="font-mono text-sm font-bold text-text-primary">{q.crop}</span>
                    <Badge variant={q.status === 'up' ? 'success' : q.status === 'down' ? 'danger' : 'neutral'}>
                      {q.change}
                    </Badge>
                  </div>

                  <div className="text-3xl font-mono font-extrabold text-text-primary my-3">
                    {q.price}
                  </div>

                  <div className="text-xs text-text-muted font-mono border-t border-border-subtle pt-3 mt-3 truncate">
                    {q.market}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="impact" className="py-24 sm:py-32 bg-[#121612] text-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-20 space-y-3">
              <Badge variant="accent" dot>
                VERIFIABLE EXTENSION METRICS
              </Badge>
              <h2 className="text-3xl sm:text-5xl font-extrabold font-mono uppercase tracking-tight text-white">
                Impact Across the Basin
              </h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 text-center">
              <div className="space-y-2">
                <div className="text-5xl sm:text-7xl font-extrabold font-mono text-emerald-400">
                  250K+
                </div>
                <div className="text-sm font-mono uppercase tracking-wider text-white/90">
                  Registered Plots
                </div>
                <p className="text-xs text-white/60 font-sans">
                  Geomapped across East Shewa
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-5xl sm:text-7xl font-extrabold font-mono text-amber-300">
                  96.4%
                </div>
                <div className="text-sm font-mono uppercase tracking-wider text-white/90">
                  Diagnostic Accuracy
                </div>
                <p className="text-xs text-white/60 font-sans">
                  Field validated by research centers
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-5xl sm:text-7xl font-extrabold font-mono text-emerald-400">
                  &lt;18m
                </div>
                <div className="text-sm font-mono uppercase tracking-wider text-white/90">
                  DA Dispatch SLA
                </div>
                <p className="text-xs text-white/60 font-sans">
                  Pest & rust outbreak response time
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-5xl sm:text-7xl font-extrabold font-mono text-amber-300">
                  100%
                </div>
                <div className="text-sm font-mono uppercase tracking-wider text-white/90">
                  Offline Fallback
                </div>
                <p className="text-xs text-white/60 font-sans">
                  Functional on 2G voice & SMS
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-gradient-to-r from-primary via-primary-hover to-[#1C3318] text-white relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-6 relative z-10">
            <h2 className="text-3xl sm:text-5xl font-extrabold font-mono uppercase tracking-tight">
              Modernize Agricultural Governance Today
            </h2>
            <p className="text-base sm:text-lg text-white/85 max-w-2xl mx-auto font-sans leading-relaxed">
              Deploy the unified field extension platform for smallholders, development agents, and municipal agriculture bureaus.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <Link href={dashboardPath}>
                  <Button variant="accent" size="lg" className="font-mono text-sm px-8 shadow-2xl">
                    Launch Authorized Workspace →
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/signUp">
                    <Button variant="accent" size="lg" className="font-mono text-sm px-8 shadow-2xl">
                      Enroll Operator Station →
                    </Button>
                  </Link>
                  <Link href="/signIn">
                    <Button variant="secondary" size="lg" className="font-mono text-sm px-8">
                      Operator Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
