'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { BrandLogo } from '../../components/ui/brandLogo'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('Layout')

  const STATS = [
    { icon: '👨‍🌾', value: '12,400+', label: t('farmersEnrolled') },
    { icon: '🎯', value: '98.4%',   label: t('precisionRate') },
    { icon: '🌾', value: '34.2 Qt/Ha', label: t('avgYieldGain') },
  ]

  const [statIndex, setStatIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setStatIndex((prev) => (prev + 1) % STATS.length)
    }, 3000)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const current = STATS[statIndex]

  return (
    <div className="h-screen overflow-hidden flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden h-screen sticky top-0">
        <Image
          src="/images/hero-bg.jpg"
          alt="Agricultural field"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
        <div className="absolute inset-0 bg-[#0D1F0B]/75" />

        {/* Decorative field lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 200 Q200 100 400 200 T800 200" stroke="#6EE22A" strokeWidth="1" fill="none" />
          <path d="M0 350 Q200 250 400 350 T800 350" stroke="#6EE22A" strokeWidth="1" fill="none" />
          <path d="M0 500 Q200 400 400 500 T800 500" stroke="#6EE22A" strokeWidth="1" fill="none" />
        </svg>

        <div className="absolute inset-0 flex flex-col justify-between p-10 z-10">
          <BrandLogo size="lg" inverted />

          <div className="flex-1 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={statIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="text-center"
              >
                <div className="text-5xl mb-4">{current.icon}</div>
                <div className="text-5xl font-bold text-white font-mono mb-2">{current.value}</div>
                <div className="text-white/70 text-sm font-mono uppercase tracking-widest">{current.label}</div>
              </motion.div>
            </AnimatePresence>
          </div>

          <p className="text-white/50 text-xs font-mono">{t('tagline')}</p>
        </div>
      </div>

      {/* Right content panel */}
      <div className="w-full lg:w-3/5 flex flex-col h-screen overflow-y-auto bg-[var(--color-surface)]">
        {/* Mobile top bar */}
        <div className="flex lg:hidden items-center justify-between px-5 py-4" style={{ borderBottom: '1.5px solid var(--color-border-ui)' }}>
          <BrandLogo size="sm" />
          <Link href="/" className="text-xs font-mono font-semibold text-text-muted hover:text-text-primary transition-colors">
            ← {t('portal')}
          </Link>
        </div>

        <main className="flex-1 flex items-center justify-center px-6 py-10">
          {children}
        </main>

        <footer className="py-4 text-center text-[10px] font-mono text-text-faint">
          © {new Date().getFullYear()} AgriIntel Ethiopia. All rights reserved.
        </footer>
      </div>
    </div>
  )
}
