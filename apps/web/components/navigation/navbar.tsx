'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useScroll } from 'framer-motion'
import { useTranslations } from 'next-intl'
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

      <header className="fixed top-0 inset-x-0 z-50 pt-2 px-3 sm:px-5 pointer-events-none">
        <nav className="pointer-events-auto max-w-7xl mx-auto bg-white/92 backdrop-blur-xl border border-[var(--color-border)] rounded-full px-4 sm:px-5 py-2.5 shadow-md transition-all duration-300 hover:border-[var(--color-primary)]">
          <div className="flex items-center justify-between gap-4">
            {/* Brand */}
            <BrandLogo size="xs" showSubtitle={false} className="py-0" />

            {/* Desktop nav links */}
            <div className="hidden lg:flex items-center gap-7 text-xs font-semibold text-[var(--color-text-muted)]">
              <a href="#overview" className="whitespace-nowrap hover:text-[var(--color-primary)] transition-colors">
                {t('overview')}
              </a>
              <a href="#empirical-trial" className="whitespace-nowrap hover:text-[var(--color-primary)] transition-colors">
                {t('verification')}
              </a>
              <a href="#capabilities" className="whitespace-nowrap hover:text-[var(--color-primary)] transition-colors">
                {t('capabilities')}
              </a>
              <a href="#voice-dispatch" className="whitespace-nowrap hover:text-[var(--color-primary)] transition-colors">
                {t('dispatch')}
              </a>
              <a href="#impact" className="whitespace-nowrap hover:text-[var(--color-primary)] transition-colors">
                {t('benchmarks')}
              </a>
            </div>

            {/* Right controls */}
            <div className="hidden sm:flex items-center gap-3">
              {/* Currency badge */}
              <span className="px-2.5 py-1 rounded-full bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-[11px] font-mono font-medium text-[var(--color-text-primary)] select-none">
                {t('currency')}
              </span>

              {/* Language switcher */}
              <LocaleSwitcher />

              {/* Auth buttons */}
              {isAuthenticated ? (
                <Link href={dashboardPath}>
                  <Button
                    size="sm"
                    className="rounded-full font-medium text-xs bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[#151A14] whitespace-nowrap cursor-pointer shadow-sm px-4 h-8 min-h-0"
                  >
                    {t('workspace')} ({role || t('operator')}) →
                  </Button>
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/signIn">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full text-xs font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface-subtle)] whitespace-nowrap cursor-pointer px-4 h-8 min-h-0"
                    >
                      {t('signIn')}
                    </Button>
                  </Link>
                  <Link href="/signUp">
                    <Button
                      size="sm"
                      className="rounded-full font-semibold text-xs bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-5 whitespace-nowrap cursor-pointer shadow-sm h-8 min-h-0"
                    >
                      {t('signUp')}
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile trigger */}
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
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-full border border-[var(--color-border)] bg-white text-[var(--color-text-primary)] cursor-pointer"
                aria-label="Toggle navigation"
              >
                ☰
              </button>
            </div>
          </div>

          {/* Mobile drawer */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="sm:hidden mt-3 border-t border-[var(--color-border)] pt-3 pb-2 space-y-2 text-xs"
              >
                <a href="#overview" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 font-medium text-[var(--color-text-primary)] hover:text-[var(--color-primary)]">
                  {t('overview')}
                </a>
                <a href="#empirical-trial" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 font-medium text-[var(--color-text-primary)] hover:text-[var(--color-primary)]">
                  {t('verification')}
                </a>
                <a href="#capabilities" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 font-medium text-[var(--color-text-primary)] hover:text-[var(--color-primary)]">
                  {t('capabilities')}
                </a>
                <a href="#voice-dispatch" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 font-medium text-[var(--color-text-primary)] hover:text-[var(--color-primary)]">
                  {t('dispatch')}
                </a>
                <a href="#impact" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 font-medium text-[var(--color-text-primary)] hover:text-[var(--color-primary)]">
                  {t('benchmarks')}
                </a>

                <div className="pt-2 pb-1">
                  <LocaleSwitcher />
                </div>

                <div className="pt-3 border-t border-[var(--color-border)] flex gap-2">
                  <Link href="/signIn" className="flex-1">
                    <Button variant="outline" size="sm" fullWidth className="rounded-full">
                      {t('signIn')}
                    </Button>
                  </Link>
                  <Link href="/signUp" className="flex-1">
                    <Button size="sm" fullWidth className="rounded-full bg-[var(--color-primary)] text-white">
                      {t('signUp')}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </header>
    </>
  )
}
