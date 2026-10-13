'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useScroll } from 'framer-motion'
import { ChevronDown, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BrandLogo } from '@/components/ui/brandLogo'

export interface NavbarProps {
  isAuthenticated: boolean
  dashboardPath: string
  role?: string | null
}

const LANGUAGES = [
  { code: 'EN', name: 'English', native: 'English' },
  { code: 'AM', name: 'Amharic', native: 'አማርኛ' },
  { code: 'OM', name: 'Afaan Oromo', native: 'Oromoo' },
  { code: 'TI', name: 'Tigrinya', native: 'ትግርኛ' },
]

export function Navbar({ isAuthenticated, dashboardPath, role }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [langDropdownOpen, setLangDropdownOpen] = useState(false)
  const [currentLang, setCurrentLang] = useState(LANGUAGES[0])
  const langRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll()

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <>
      {/* Top 3px Scroll Progress Bar inspired by yohajoh.tech */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-[3px] bg-[var(--color-primary)] origin-left z-[60]"
        style={{ scaleX: scrollYProgress }} 
      />

      <header className="fixed top-0 inset-x-0 z-50 pt-0.5 px-3 sm:px-5 pointer-events-none">
        <nav className="pointer-events-auto max-w-7xl mx-auto bg-white/92 backdrop-blur-xl border border-[var(--color-border)] rounded-full px-4 sm:px-5 py-0 shadow-md transition-all duration-300 hover:border-[var(--color-primary)]">
          <div className="flex items-center justify-between gap-4">
            {/* Brand Logo */}
            <BrandLogo size="xs" showSubtitle={false} className="py-0" />

            {/* Desktop Single-Word Navigation Items */}
            <div className="hidden lg:flex items-center gap-7 text-xs font-semibold text-[var(--color-text-muted)]">
              <a 
                href="#overview" 
                className="whitespace-nowrap hover:text-[var(--color-primary)] transition-colors"
              >
                Overview
              </a>
              <a 
                href="#empirical-trial" 
                className="whitespace-nowrap hover:text-[var(--color-primary)] transition-colors"
              >
                Verification
              </a>
              <a 
                href="#capabilities" 
                className="whitespace-nowrap hover:text-[var(--color-primary)] transition-colors"
              >
                Capabilities
              </a>
              <a 
                href="#voice-dispatch" 
                className="whitespace-nowrap hover:text-[var(--color-primary)] transition-colors"
              >
                Dispatch
              </a>
              <a 
                href="#impact" 
                className="whitespace-nowrap hover:text-[var(--color-primary)] transition-colors"
              >
                Benchmarks
              </a>
            </div>

            {/* Right Controls: Currency, Language Dropdown, Sign In, Sign Up */}
            <div className="hidden sm:flex items-center gap-3">
              {/* Currency Badge */}
              <span className="px-2.5 py-1 rounded-full bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-[11px] font-mono font-medium text-[var(--color-text-primary)] select-none">
                ETB
              </span>

              {/* Interactive Language Dropdown */}
              <div className="relative" ref={langRef}>
                <button
                  type="button"
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-surface-subtle)] hover:bg-[var(--color-primary-light)] border border-[var(--color-border)] text-[11px] font-medium text-[var(--color-text-primary)] transition-colors cursor-pointer select-none"
                  aria-label="Select language"
                >
                  <Globe className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                  <span>{currentLang?.native || currentLang?.name}</span>
                  <ChevronDown className={`w-3 h-3 text-[var(--color-text-muted)] transition-transform ${langDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {langDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-44 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl py-2 z-50 text-xs"
                    >
                      <div className="px-3 py-1 text-[10px] font-mono text-[var(--color-text-faint)] uppercase tracking-wider border-b border-[var(--color-border-subtle)]">
                        Select Language
                      </div>
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setCurrentLang(lang)
                            setLangDropdownOpen(false)
                          }}
                          className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-[var(--color-primary-light)] transition-colors cursor-pointer ${
                            currentLang?.code === lang.code ? 'text-[var(--color-primary)] font-bold bg-[var(--color-primary-light)]' : 'text-[var(--color-text-primary)]'
                          }`}
                        >
                          <span>{lang.native}</span>
                          <span className="font-mono text-[10px] text-[var(--color-text-faint)]">{lang.code}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Authentication Buttons: Sign In and Sign Up */}
              {isAuthenticated ? (
                <Link href={dashboardPath}>
                  <Button 
                    size="sm" 
                    className="rounded-full font-medium text-xs bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[#151A14] whitespace-nowrap cursor-pointer shadow-sm px-4 h-8 min-h-0"
                  >
                    Workspace ({role || 'Operator'}) →
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
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signUp">
                    <Button 
                      size="sm" 
                      className="rounded-full font-semibold text-xs bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[#151A14] px-5 whitespace-nowrap cursor-pointer shadow-sm h-8 min-h-0"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu trigger */}
            <div className="flex sm:hidden items-center gap-2">
              {isAuthenticated ? (
                <Link href={dashboardPath}>
                  <Button variant="primary" size="sm" className="rounded-full text-xs bg-[var(--color-primary)] text-white">
                    Desk →
                  </Button>
                </Link>
              ) : (
                <Link href="/signIn">
                  <Button variant="outline" size="sm" className="rounded-full text-xs">
                    Sign In
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
                <a
                  href="#overview"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1.5 font-medium text-[var(--color-text-primary)] hover:text-[var(--color-primary)]"
                >
                  Overview
                </a>
                <a
                  href="#empirical-trial"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1.5 font-medium text-[var(--color-text-primary)] hover:text-[var(--color-primary)]"
                >
                  Verification
                </a>
                <a
                  href="#capabilities"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1.5 font-medium text-[var(--color-text-primary)] hover:text-[var(--color-primary)]"
                >
                  Capabilities
                </a>
                <a
                  href="#voice-dispatch"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1.5 font-medium text-[var(--color-text-primary)] hover:text-[var(--color-primary)]"
                >
                  Dispatch
                </a>
                <a
                  href="#impact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1.5 font-medium text-[var(--color-text-primary)] hover:text-[var(--color-primary)]"
                >
                  Benchmarks
                </a>

                <div className="pt-3 border-t border-[var(--color-border)] flex gap-2">
                  <Link href="/signIn" className="flex-1">
                    <Button variant="outline" size="sm" fullWidth className="rounded-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signUp" className="flex-1">
                    <Button size="sm" fullWidth className="rounded-full bg-[var(--color-primary)] text-white">
                      Sign Up
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
