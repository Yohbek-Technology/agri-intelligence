'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import {
  X,
  Menu,
  ArrowUpRight,
  ChevronDown,
} from 'lucide-react'
import { BrandLogo } from '@/components/ui/brandLogo'
import { LocaleSwitcher } from '@/components/ui/localeSwitcher'

export interface NavbarProps {
  isAuthenticated: boolean
  dashboardPath: string
  role?: string | null
}

export function Navbar({ isAuthenticated, dashboardPath, role }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [portalDropdownOpen, setPortalDropdownOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const t = useTranslations('Navbar')

  // Lock only body scroll when mobile menu is open (never touch documentElement to avoid breaking layout)
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  // Smooth scroll and set active link on click
  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    sectionId: string
  ) => {
    e.preventDefault()
    setActiveSection(sectionId)
    setMobileMenuOpen(false)
    document.body.style.overflow = ''

    // Scroll smoothly to target section after closing the drawer
    setTimeout(() => {
      if (sectionId === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }

      const target = document.getElementById(sectionId)
      if (target) {
        const navbarHeight = window.innerWidth >= 640 ? 80 : 64
        const targetTop = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight
        window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' })
        target.focus({ preventScroll: true })
      }
    }, 60)
  }

  // Scrollspy to automatically update active section as user scrolls
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 160
      const sections = ['contact', 'empirical-trial', 'services', 'about']

      for (const section of sections) {
        const el = document.getElementById(section)
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(section)
          return
        }
      }
      setActiveSection('home')
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 bg-white/98 backdrop-blur-md border-b border-[#e7e1d5] shadow-xs">
        {/* ── Main Navigation Bar ── */}
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-6">
          {/* Brand Logo - Responsive sizing */}
          <div className="shrink-0 flex items-center">
            <BrandLogo size="sm" showSubtitle={false} className="py-0 sm:hidden" />
            <BrandLogo size="md" showSubtitle={false} className="py-0 hidden sm:block" />
          </div>

          {/* Desktop Links with Active State & Focus */}
          <div className="hidden lg:flex items-center gap-8 text-[13px] font-bold text-[#1b2f1e]">
            {/* Home */}
            <a
              href="#"
              onClick={(e) => handleNavClick(e, 'home')}
              className={`transition-all duration-200 py-1 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#14532d] rounded-sm ${
                activeSection === 'home'
                  ? 'text-[#14532d] font-extrabold relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#14532d]'
                  : 'text-[#3b4b3e] hover:text-[#14532d]'
              }`}
            >
              {t('home')}
            </a>

            {/* About Us */}
            <a
              href="#about"
              onClick={(e) => handleNavClick(e, 'about')}
              className={`transition-all duration-200 py-1 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#14532d] rounded-sm ${
                activeSection === 'about'
                  ? 'text-[#14532d] font-extrabold relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#14532d]'
                  : 'text-[#3b4b3e] hover:text-[#14532d]'
              }`}
            >
              {t('aboutUs')}
            </a>

            {/* Services */}
            <a
              href="#services"
              onClick={(e) => handleNavClick(e, 'services')}
              className={`transition-all duration-200 py-1 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#14532d] rounded-sm ${
                activeSection === 'services'
                  ? 'text-[#14532d] font-extrabold relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#14532d]'
                  : 'text-[#3b4b3e] hover:text-[#14532d]'
              }`}
            >
              {t('services')}
            </a>

            {/* Field Trial */}
            <a
              href="#empirical-trial"
              onClick={(e) => handleNavClick(e, 'empirical-trial')}
              className={`transition-all duration-200 py-1 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#14532d] rounded-sm ${
                activeSection === 'empirical-trial'
                  ? 'text-[#14532d] font-extrabold relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#14532d]'
                  : 'text-[#3b4b3e] hover:text-[#14532d]'
              }`}
            >
              {t('fieldTrial')}
            </a>

            {/* Portals Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setPortalDropdownOpen(true)}
              onMouseLeave={() => setPortalDropdownOpen(false)}
            >
              <button
                type="button"
                className="text-[#3b4b3e] hover:text-[#14532d] transition-colors flex items-center gap-1 cursor-pointer py-1 outline-none focus-visible:ring-2 focus-visible:ring-[#14532d] rounded-sm font-bold"
              >
                <span>{t('portals')}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              <AnimatePresence>
                {portalDropdownOpen && (
                  <motion.div
                    key="portal-desktop-dropdown"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 w-56 bg-white border border-[#e5dfd5] rounded-xl shadow-xl py-2 z-50 text-xs font-semibold"
                  >
                    <Link
                      href="/farmer"
                      className="block px-4 py-2 text-[#1b2f1e] hover:bg-[#f3eee5] hover:text-[#14532d]"
                    >
                      🌾 {t('farmerPortal')}
                    </Link>
                    <Link
                      href="/da"
                      className="block px-4 py-2 text-[#1b2f1e] hover:bg-[#f3eee5] hover:text-[#14532d]"
                    >
                      📋 {t('daPortal')}
                    </Link>
                    <Link
                      href="/officer"
                      className="block px-4 py-2 text-[#1b2f1e] hover:bg-[#f3eee5] hover:text-[#14532d]"
                    >
                      📊 {t('officerPortal')}
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Contact */}
            <a
              href="#contact"
              onClick={(e) => handleNavClick(e, 'contact')}
              className={`transition-all duration-200 py-1 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#14532d] rounded-sm ${
                activeSection === 'contact'
                  ? 'text-[#14532d] font-extrabold relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#14532d]'
                  : 'text-[#3b4b3e] hover:text-[#14532d]'
              }`}
            >
              {t('contact')}
            </a>
          </div>

          {/* Right Action Controls: Fits all screen sizes */}
          <div className="flex items-center gap-2 sm:gap-3">
            <LocaleSwitcher />

            {/* Main Action Button - Hidden on mobile screens to prevent overflow, visible on md+ */}
            {isAuthenticated ? (
              <Link href={dashboardPath} className="hidden md:flex">
                <button
                  type="button"
                  className="bg-[#e7b028] hover:bg-[#d69f1a] text-[#1a2f19] font-bold text-xs sm:text-sm px-5 sm:px-6 py-2.5 sm:py-3 rounded-full shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2 cursor-pointer"
                >
                  <span>{t('workspace')} ({role || t('operator')})</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </Link>
            ) : (
              <Link href="/signIn" className="hidden md:flex">
                <button
                  type="button"
                  className="bg-[#e7b028] hover:bg-[#d69f1a] text-[#1a2f19] font-bold text-xs sm:text-sm px-5 sm:px-6 py-2.5 sm:py-3 rounded-full shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2 cursor-pointer"
                >
                  <span>{t('accessPortal')}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </Link>
            )}

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-[#1b2f1e] hover:bg-[#f3eee5] active:bg-[#e7dfcf] transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer Overlay & Menu (Mounted outside header to prevent layout collisions) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="mobile-drawer-portal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 top-16 sm:top-20 z-40 lg:hidden"
          >
            {/* Backdrop Overlay - Closes menu when tapping outside */}
            <div
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/45 backdrop-blur-xs"
            />

            {/* Menu Slide-down Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
              className="relative max-h-[calc(100vh-4rem)] sm:max-h-[calc(100vh-5rem)] overflow-y-auto bg-white border-b border-[#e5dfd5] px-6 py-6 shadow-2xl space-y-4 text-sm font-semibold text-[#1b2f1e] z-10"
            >
              {/* Navigation Links */}
              <div className="space-y-1">
                <a
                  href="#"
                  onClick={(e) => handleNavClick(e, 'home')}
                  className={`flex items-center justify-between py-2.5 px-3 rounded-xl transition-colors cursor-pointer ${
                    activeSection === 'home'
                      ? 'bg-[#14532d]/10 text-[#14532d] font-extrabold'
                      : 'text-[#3b4b3e] hover:bg-[#f7f3ea]'
                  }`}
                >
                  <span>{t('home')}</span>
                </a>
                <a
                  href="#about"
                  onClick={(e) => handleNavClick(e, 'about')}
                  className={`flex items-center justify-between py-2.5 px-3 rounded-xl transition-colors cursor-pointer ${
                    activeSection === 'about'
                      ? 'bg-[#14532d]/10 text-[#14532d] font-extrabold'
                      : 'text-[#3b4b3e] hover:bg-[#f7f3ea]'
                  }`}
                >
                  <span>{t('aboutUs')}</span>
                </a>
                <a
                  href="#services"
                  onClick={(e) => handleNavClick(e, 'services')}
                  className={`flex items-center justify-between py-2.5 px-3 rounded-xl transition-colors cursor-pointer ${
                    activeSection === 'services'
                      ? 'bg-[#14532d]/10 text-[#14532d] font-extrabold'
                      : 'text-[#3b4b3e] hover:bg-[#f7f3ea]'
                  }`}
                >
                  <span>{t('services')}</span>
                </a>
                <a
                  href="#empirical-trial"
                  onClick={(e) => handleNavClick(e, 'empirical-trial')}
                  className={`flex items-center justify-between py-2.5 px-3 rounded-xl transition-colors cursor-pointer ${
                    activeSection === 'empirical-trial'
                      ? 'bg-[#14532d]/10 text-[#14532d] font-extrabold'
                      : 'text-[#3b4b3e] hover:bg-[#f7f3ea]'
                  }`}
                >
                  <span>{t('fieldTrial')}</span>
                </a>
                <a
                  href="#contact"
                  onClick={(e) => handleNavClick(e, 'contact')}
                  className={`flex items-center justify-between py-2.5 px-3 rounded-xl transition-colors cursor-pointer ${
                    activeSection === 'contact'
                      ? 'bg-[#14532d]/10 text-[#14532d] font-extrabold'
                      : 'text-[#3b4b3e] hover:bg-[#f7f3ea]'
                  }`}
                >
                  <span>{t('contact')}</span>
                </a>
              </div>

              {/* Portals Section */}
              <div className="pt-3 border-t border-[#f0ebe0] space-y-1">
                <span className="text-[11px] uppercase text-[#697a6c] tracking-wider font-extrabold px-3 block">
                  {t('portals')}
                </span>
                <Link
                  href="/farmer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg hover:bg-[#f7f3ea] text-[#1b2f1e]"
                >
                  <span>🌾</span>
                  <span>{t('farmerPortal')}</span>
                </Link>
                <Link
                  href="/da"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg hover:bg-[#f7f3ea] text-[#1b2f1e]"
                >
                  <span>📋</span>
                  <span>{t('daPortal')}</span>
                </Link>
                <Link
                  href="/officer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg hover:bg-[#f7f3ea] text-[#1b2f1e]"
                >
                  <span>📊</span>
                  <span>{t('officerPortal')}</span>
                </Link>
              </div>

              {/* Prominent CTA on Mobile */}
              <div className="pt-3 border-t border-[#f0ebe0]">
                {isAuthenticated ? (
                  <Link
                    href={dashboardPath}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-3 px-4 rounded-full bg-[#e7b028] hover:bg-[#d69f1a] text-[#1a2f19] font-extrabold text-sm flex items-center justify-center gap-2 shadow-md"
                  >
                    <span>{t('workspace')} ({role || t('operator')})</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/signIn"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center py-3 px-4 rounded-full bg-[#e7b028] hover:bg-[#d69f1a] text-[#1a2f19] font-extrabold text-sm flex items-center justify-center gap-2 shadow-md"
                    >
                      <span>{t('accessPortal')}</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/signUp"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center py-2.5 rounded-full border border-[#14532d] text-[#14532d] font-bold text-xs"
                    >
                      {t('signUp')}
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
