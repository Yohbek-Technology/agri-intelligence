'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useScroll } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { X, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BrandLogo } from '@/components/ui/brandLogo'
import { LocaleSwitcher } from '@/components/ui/localeSwitcher'

export interface NavbarProps {
  isAuthenticated: boolean
  dashboardPath: string
  role?: string | null
}

export function Navbar({ isAuthenticated, dashboardPath, role }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { scrollYProgress } = useScroll()
  const t = useTranslations('Navbar')

  return (
    <>
      {/* Scroll progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-[var(--color-primary)] origin-left z-[60]"
        style={{ scaleX: scrollYProgress }}
      />

      {/* ── Pill navbar ── */}
      <header className="fixed top-0 inset-x-0 z-50 pt-2 px-3 sm:px-5 pointer-events-none">
        <nav className="pointer-events-auto max-w-7xl mx-auto bg-white/92 backdrop-blur-xl border border-[var(--color-border)] rounded-full px-4 sm:px-5 py-2.5 shadow-md transition-all duration-300 hover:border-[var(--color-primary)]">
          <div className="flex items-center justify-between gap-4">

            <BrandLogo size="xs" showSubtitle={false} className="py-0" />

            {/* Desktop links */}
            <div className="hidden lg:flex items-center gap-7 text-xs font-semibold text-[var(--color-text-muted)]">
              <a href="#overview" className="whitespace-nowrap hover:text-[var(--color-primary)] transition-colors">{t('overview')}</a>
              <a href="#empirical-trial" className="whitespace-nowrap hover:text-[var(--color-primary)] transition-colors">{t('verification')}</a>
              <a href="#capabilities" className="whitespace-nowrap hover:text-[var(--color-primary)] transition-colors">{t('capabilities')}</a>
              <a href="#voice-dispatch" className="whitespace-nowrap hover:text-[var(--color-primary)] transition-colors">{t('dispatch')}</a>
              <a href="#impact" className="whitespace-nowrap hover:text-[var(--color-primary)] transition-colors">{t('benchmarks')}</a>
            </div>

            {/* Desktop right controls */}
            <div className="hidden sm:flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-full bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-[11px] font-mono font-medium text-[var(--color-text-primary)] select-none">
                {t('currency')}
              </span>
              <LocaleSwitcher />
              {isAuthenticated ? (
                <Link href={dashboardPath}>
                  <Button size="sm" className="rounded-full font-medium text-xs bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white whitespace-nowrap cursor-pointer shadow-sm px-4 h-8 min-h-0">
                    {t('workspace')} ({role || t('operator')}) →
                  </Button>
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/signIn">
                    <Button variant="ghost" size="sm" className="rounded-full text-xs font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface-subtle)] whitespace-nowrap cursor-pointer px-4 h-8 min-h-0">
                      {t('signIn')}
                    </Button>
                  </Link>
                  <Link href="/signUp">
                    <Button size="sm" className="rounded-full font-semibold text-xs bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-5 whitespace-nowrap cursor-pointer shadow-sm h-8 min-h-0">
                      {t('signUp')}
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile: desk/signIn + hamburger */}
            <div className="flex sm:hidden items-center gap-2">
              {isAuthenticated ? (
                <Link href={dashboardPath}>
                  <Button variant="primary" size="sm" className="rounded-full text-xs bg-[var(--color-primary)] text-white">
                    {t('desk')}
                  </Button>
                </Link>
              ) : (
                <Link href="/signIn">
                  <Button variant="outline" size="sm" className="rounded-full text-xs">
                    {t('signIn')}
                  </Button>
                </Link>
              )}
              <button
                onClick={() => setMobileMenuOpen((p) => !p)}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-[var(--color-text-primary)] cursor-pointer"
                aria-label="Toggle navigation"
              >
                {mobileMenuOpen ? <X size={15} /> : <Menu size={15} />}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* ── Mobile drawer — separate from pill, slides down below it ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40 sm:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="fixed top-[68px] left-3 right-3 z-50 sm:hidden rounded-2xl bg-white/95 backdrop-blur-xl border border-[var(--color-border)] shadow-2xl"
            >
              {/* Nav links */}
              <div className="px-4 pt-4 pb-2 space-y-1">
                {[
                  { href: '#overview',       label: t('overview') },
                  { href: '#empirical-trial', label: t('verification') },
                  { href: '#capabilities',   label: t('capabilities') },
                  { href: '#voice-dispatch', label: t('dispatch') },
                  { href: '#impact',         label: t('benchmarks') },
                ].map(({ href, label }) => (
                  <a
                    key={href}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface-subtle)] hover:text-[var(--color-primary)] transition-colors"
                  >
                    {label}
                  </a>
                ))}
              </div>

              {/* Divider */}
              <div className="mx-4 border-t border-[var(--color-border)]" />

              {/* Language + auth */}
              <div className="px-4 py-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[var(--color-text-faint)] uppercase tracking-wider">Language</span>
                  <LocaleSwitcher forceUpward />
                </div>
                {!isAuthenticated && (
                  <div className="flex gap-2">
                    <Link href="/signIn" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" size="sm" fullWidth className="rounded-xl">
                        {t('signIn')}
                      </Button>
                    </Link>
                    <Link href="/signUp" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                      <Button size="sm" fullWidth className="rounded-xl bg-[var(--color-primary)] text-white">
                        {t('signUp')}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
