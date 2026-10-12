'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
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
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <BrandLogo size="md" showSubtitle={false} />

        {/* Desktop Single-Word Navigation Items */}
        <div className="hidden lg:flex items-center gap-7 text-xs font-medium text-slate-600">
          <a 
            href="#overview" 
            className="whitespace-nowrap hover:text-emerald-700 transition-colors"
          >
            Overview
          </a>
          <a 
            href="#empirical-trial" 
            className="whitespace-nowrap hover:text-emerald-700 transition-colors"
          >
            Verification
          </a>
          <a 
            href="#capabilities" 
            className="whitespace-nowrap hover:text-emerald-700 transition-colors"
          >
            Capabilities
          </a>
          <a 
            href="#voice-dispatch" 
            className="whitespace-nowrap hover:text-emerald-700 transition-colors"
          >
            Dispatch
          </a>
          <a 
            href="#impact" 
            className="whitespace-nowrap hover:text-emerald-700 transition-colors"
          >
            Benchmarks
          </a>
        </div>

        {/* Right Controls: Currency, Language Dropdown, Sign In, Sign Up */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Currency Badge */}
          <span className="px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-mono font-medium text-slate-700 select-none">
            ETB
          </span>

          {/* Interactive Language Dropdown */}
          <div className="relative" ref={langRef}>
            <button
              type="button"
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-[11px] font-medium text-slate-700 transition-colors cursor-pointer select-none"
              aria-label="Select language"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{currentLang?.native || currentLang?.name}</span>
              <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${langDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {langDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-44 rounded-xl bg-white border border-slate-200 shadow-lg py-1.5 z-50 text-xs"
                >
                  <div className="px-3 py-1 text-[10px] font-mono text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Select Language
                  </div>
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setCurrentLang(lang)
                        setLangDropdownOpen(false)
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-emerald-50 transition-colors cursor-pointer ${
                        currentLang?.code === lang.code ? 'text-emerald-700 font-semibold bg-emerald-50/50' : 'text-slate-700'
                      }`}
                    >
                      <span>{lang.native}</span>
                      <span className="font-mono text-[10px] text-slate-400">{lang.code}</span>
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
                variant="primary" 
                size="sm" 
                className="rounded-xl font-medium text-xs bg-emerald-700 hover:bg-emerald-800 text-white whitespace-nowrap cursor-pointer shadow-xs"
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
                  className="rounded-xl text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 whitespace-nowrap cursor-pointer"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/signUp">
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="rounded-xl font-medium text-xs bg-emerald-700 hover:bg-emerald-800 text-white px-4 whitespace-nowrap cursor-pointer shadow-xs"
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
              <Button variant="primary" size="sm" className="rounded-xl text-xs bg-emerald-700 text-white">
                Desk →
              </Button>
            </Link>
          ) : (
            <Link href="/signIn">
              <Button variant="outline" size="sm" className="rounded-xl text-xs">
                Sign In
              </Button>
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 cursor-pointer"
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
            className="sm:hidden border-b border-slate-200 bg-white px-4 py-4 space-y-3 text-xs"
          >
            <a
              href="#overview"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 font-medium text-slate-700 hover:text-emerald-700"
            >
              Overview
            </a>
            <a
              href="#empirical-trial"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 font-medium text-slate-700 hover:text-emerald-700"
            >
              Verification
            </a>
            <a
              href="#capabilities"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 font-medium text-slate-700 hover:text-emerald-700"
            >
              Capabilities
            </a>
            <a
              href="#voice-dispatch"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 font-medium text-slate-700 hover:text-emerald-700"
            >
              Dispatch
            </a>
            <a
              href="#impact"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 font-medium text-slate-700 hover:text-emerald-700"
            >
              Benchmarks
            </a>

            <div className="pt-3 border-t border-slate-100 flex gap-2">
              <Link href="/signIn" className="flex-1">
                <Button variant="outline" size="sm" fullWidth>
                  Sign In
                </Button>
              </Link>
              <Link href="/signUp" className="flex-1">
                <Button variant="primary" size="sm" fullWidth className="bg-emerald-700 text-white">
                  Sign Up
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
