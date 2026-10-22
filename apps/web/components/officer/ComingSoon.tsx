'use client'

import { useTranslations } from 'next-intl'
import { Construction } from 'lucide-react'

interface ComingSoonProps {
  titleKey: string
  subtitleKey: string
}

export function ComingSoon({ titleKey, subtitleKey }: ComingSoonProps) {
  const t = useTranslations('OfficerPages')

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full officer-content">
      <h1 className="text-2xl font-bold text-text-primary">{t(titleKey as any)}</h1>
      <p className="text-sm text-text-muted mt-1">{t(subtitleKey as any)}</p>

      <div
        className="mt-8 rounded-2xl bg-surface flex flex-col items-center justify-center py-20 gap-4"
        style={{ border: '1.5px solid var(--color-border-ui)', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}
      >
        <Construction size={40} className="text-text-faint opacity-40" />
        <p className="text-sm font-medium text-text-faint font-mono tracking-widest uppercase">
          {t('coming_soon')}
        </p>
      </div>
    </div>
  )
}
