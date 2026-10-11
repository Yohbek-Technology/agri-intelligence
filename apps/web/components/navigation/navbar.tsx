'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { BrandLogo } from '@/components/ui/brandLogo'

export interface NavbarProps {
  isAuthenticated: boolean
  dashboardPath: string
  role?: string | null
}

export function Navbar({ isAuthenticated, dashboardPath, role }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-border/70 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        <BrandLogo size="md" />

        <div className="hidden lg:flex items-center gap-8 text-xs font-mono font-semibold uppercase tracking-wider text-text-muted">
          <a href="#intelligence" className="hover:text-primary transition-colors">
            Intelligence
          </a>
          <a href="#diagnostics" className="hover:text-primary transition-colors">
            Diagnostics
          </a>
          <a href="#agro-weather" className="hover:text-primary transition-colors">
            Agro-Weather
          </a>
          <a href="#markets" className="hover:text-primary transition-colors">
            Market Board
          </a>
          <a href="#impact" className="hover:text-primary transition-colors">
            Impact
          </a>
        </div>

        <div className="hidden sm:flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-surface-subtle border border-border text-[11px] font-mono text-text-muted">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span>Adama Central // Live</span>
          </div>

          {isAuthenticated ? (
            <Link href={dashboardPath}>
              <Button variant="primary" size="sm" className="rounded-xl font-mono text-xs">
                Launch Workspace ({role || 'Operator'}) →
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/signIn">
                <Button variant="ghost" size="sm" className="rounded-xl font-mono text-xs">
                  Sign In
                </Button>
              </Link>
              <Link href="/signUp">
                <Button variant="primary" size="sm" className="rounded-xl font-mono text-xs">
                  Enroll Station →
                </Button>
              </Link>
            </>
          )}
        </div>

        <div className="flex sm:hidden items-center gap-2">
          {isAuthenticated ? (
            <Link href={dashboardPath}>
              <Button variant="primary" size="sm" className="rounded-xl text-xs font-mono">
                Desk →
              </Button>
            </Link>
          ) : (
            <Link href="/signIn">
              <Button variant="outline" size="sm" className="rounded-xl text-xs font-mono">
                Sign In
              </Button>
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl border border-border bg-white text-text-primary cursor-pointer"
          >
            ☰
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="sm:hidden border-b border-border bg-white px-4 py-4 space-y-3 font-mono text-xs uppercase"
          >
            <a
              href="#intelligence"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 text-text-muted hover:text-primary"
            >
              Intelligence
            </a>
            <a
              href="#diagnostics"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 text-text-muted hover:text-primary"
            >
              Diagnostics
            </a>
            <a
              href="#agro-weather"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 text-text-muted hover:text-primary"
            >
              Agro-Weather
            </a>
            <a
              href="#markets"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 text-text-muted hover:text-primary"
            >
              Market Board
            </a>
            <a
              href="#impact"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 text-text-muted hover:text-primary"
            >
              Impact
            </a>
            <div className="pt-2 border-t border-border flex gap-2">
              <Link href="/signIn" className="flex-1">
                <Button variant="outline" size="sm" fullWidth>
                  Sign In
                </Button>
              </Link>
              <Link href="/signUp" className="flex-1">
                <Button variant="primary" size="sm" fullWidth>
                  Enroll
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
