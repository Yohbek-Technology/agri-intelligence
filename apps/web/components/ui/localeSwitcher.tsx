'use client'

import React, { useRef, useState, useEffect, useTransition } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Globe, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { setLocaleAction } from '@/i18n/actions/locale'

const LANGUAGES = [
  { code: 'en' as const, native: 'English' },
  { code: 'am' as const, native: 'አማርኛ' },
  { code: 'om' as const, native: 'Oromoo' },
]

export function LocaleSwitcher() {
  const locale = useLocale()
  const t = useTranslations('Navbar')
  const [open, setOpen] = useState(false)
  const [openUpward, setOpenUpward] = useState(false)
  const [, startTransition] = useTransition()
  const ref = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const current = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0]

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  function handleToggle() {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      // dropdown height approx 160px — open upward if not enough space below
      setOpenUpward(spaceBelow < 180)
    }
    setOpen((p) => !p)
  }

  function switchLocale(code: string) {
    setOpen(false)
    startTransition(() => { setLocaleAction(code) })
  }

  const dropdownClass = openUpward
    ? 'bottom-full mb-2'
    : 'top-full mt-2'

  return (
    <div className="relative" ref={ref}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-surface-subtle)] hover:bg-[var(--color-primary-light)] border border-[var(--color-border)] text-[11px] font-medium text-[var(--color-text-primary)] transition-colors cursor-pointer select-none"
        aria-label={t('selectLanguage')}
      >
        <Globe className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
        <span>{current.native}</span>
        <ChevronDown
          className={`w-3 h-3 text-[var(--color-text-muted)] transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: openUpward ? 6 : -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: openUpward ? 6 : -6, scale: 0.97 }}
            transition={{ duration: 0.13 }}
            className={`absolute right-0 w-44 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl py-2 z-[999] text-xs ${dropdownClass}`}
          >
            <div className="px-3 py-1 text-[10px] font-mono text-[var(--color-text-faint)] uppercase tracking-wider border-b border-[var(--color-border)]">
              {t('selectLanguage')}
            </div>
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => switchLocale(lang.code)}
                className={`w-full text-left px-3 py-2.5 flex items-center justify-between hover:bg-[var(--color-primary-light)] transition-colors cursor-pointer ${
                  current.code === lang.code
                    ? 'text-[var(--color-primary)] font-bold bg-[var(--color-primary-light)]'
                    : 'text-[var(--color-text-primary)]'
                }`}
              >
                <span className="text-sm">{lang.native}</span>
                <span className="font-mono text-[10px] text-[var(--color-text-faint)] uppercase">
                  {lang.code}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
