'use client'

import React, { useRef, useState, useEffect, useTransition } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Globe, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { setLocaleAction } from '@/i18n/actions/locale'

const LANGUAGES = [
  { code: 'en', native: 'English' },
  { code: 'am', native: 'አማርኛ' },
  { code: 'om', native: 'Oromoo' },
] as const

export function LocaleSwitcher() {
  const locale = useLocale()
  const t = useTranslations('Navbar')
  const [open, setOpen] = useState(false)
  const [, startTransition] = useTransition()
  const ref = useRef<HTMLDivElement>(null)

  const current = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0]

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  function switchLocale(code: string) {
    setOpen(false)
    startTransition(() => {
      setLocaleAction(code)
    })
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
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
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-44 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl py-2 z-50 text-xs"
          >
            <div className="px-3 py-1 text-[10px] font-mono text-[var(--color-text-faint)] uppercase tracking-wider border-b border-[var(--color-border)]">
              {t('selectLanguage')}
            </div>
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => switchLocale(lang.code)}
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-[var(--color-primary-light)] transition-colors cursor-pointer ${
                  current.code === lang.code
                    ? 'text-[var(--color-primary)] font-bold bg-[var(--color-primary-light)]'
                    : 'text-[var(--color-text-primary)]'
                }`}
              >
                <span>{lang.native}</span>
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
