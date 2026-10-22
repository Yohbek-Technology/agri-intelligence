'use client'

import React, { useRef, useState, useEffect, useTransition } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Globe, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { setLocaleAction } from '@/i18n/actions/locale'

const UI_BORDER = '2px solid var(--color-border-ui)'

const LANGUAGES = [
  { code: 'en' as const, native: 'English' },
  { code: 'am' as const, native: 'አማርኛ' },
  { code: 'om' as const, native: 'Oromoo' },
]

interface LocaleSwitcherProps {
  forceUpward?: boolean
}

export function LocaleSwitcher({ forceUpward = false }: LocaleSwitcherProps) {
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
    if (!open) {
      if (forceUpward) {
        setOpenUpward(true)
      } else if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect()
        setOpenUpward(window.innerHeight - rect.bottom < 180)
      }
    }
    setOpen((p) => !p)
  }

  function switchLocale(code: string) {
    setOpen(false)
    startTransition(() => { setLocaleAction(code) })
  }

  const upward = forceUpward || openUpward

  return (
    <div className="relative" ref={ref}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-subtle hover:bg-primary-light text-[11px] font-medium text-text-primary transition-colors cursor-pointer select-none"
        style={{ border: UI_BORDER }}
        aria-label={t('selectLanguage')}
      >
        <Globe className="w-3.5 h-3.5 text-text-muted" />
        <span>{current.native}</span>
        <ChevronDown className={`w-3 h-3 text-text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: upward ? 6 : -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: upward ? 6 : -6, scale: 0.97 }}
            transition={{ duration: 0.13 }}
            className={`absolute right-0 w-44 rounded-2xl bg-surface shadow-xl py-2 z-[999] text-xs ${
              upward ? 'bottom-full mb-2' : 'top-full mt-2'
            }`}
            style={{ border: UI_BORDER }}
          >
            <div className="px-3 py-1 text-[10px] font-mono text-text-faint uppercase tracking-wider" style={{ borderBottom: UI_BORDER }}>
              {t('selectLanguage')}
            </div>
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => switchLocale(lang.code)}
                className={`w-full text-left px-3 py-2.5 flex items-center justify-between hover:bg-primary-light transition-colors cursor-pointer ${
                  current.code === lang.code
                    ? 'text-primary font-bold bg-primary-light'
                    : 'text-text-primary'
                }`}
              >
                <span className="text-sm">{lang.native}</span>
                <span className="font-mono text-[10px] text-text-faint uppercase">{lang.code}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
