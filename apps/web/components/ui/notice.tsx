'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

export interface NoticeProps {
  type?: 'error' | 'success' | 'warning' | 'info'
  message: string
  onDismiss?: () => void
}

const BG: Record<string, string> = {
  error:   'bg-danger-light text-danger',
  success: 'bg-success-light text-success',
  warning: 'bg-accent-light text-accent',
  info:    'bg-primary-light text-primary',
}

const BORDER_COLOR: Record<string, string> = {
  error:   'var(--color-danger)',
  success: 'var(--color-success)',
  warning: 'var(--color-accent)',
  info:    'var(--color-primary)',
}

const ICONS: Record<string, string> = {
  error: '🛑', success: '✓', warning: '⚠', info: 'ℹ',
}

export function Notice({ type = 'info', message, onDismiss }: NoticeProps) {
  const t = useTranslations('Notice')

  const iconLabel = {
    error: t('errorIcon'), success: t('successIcon'),
    warning: t('warningIcon'), info: t('infoIcon'),
  }[type]

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={`p-3.5 rounded-2xl text-xs sm:text-sm font-medium flex items-start justify-between gap-3 ${BG[type]}`}
      style={{ border: `2px solid ${BORDER_COLOR[type]}` }}
      role="alert"
    >
      <div className="flex items-center gap-2">
        <span className="text-base select-none" aria-label={iconLabel}>{ICONS[type]}</span>
        <span>{message}</span>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label={t('dismiss')}
          className="text-text-muted hover:text-text-primary font-bold cursor-pointer"
        >
          ✕
        </button>
      )}
    </motion.div>
  )
}
