'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

export interface NoticeProps {
  type?: 'error' | 'success' | 'warning' | 'info'
  message: string
  onDismiss?: () => void
}

export function Notice({ type = 'info', message, onDismiss }: NoticeProps) {
  const t = useTranslations('Notice')

  const styles = {
    error:   'bg-danger-light border-danger text-danger',
    success: 'bg-success-light border-success text-success',
    warning: 'bg-accent-light border-accent text-accent',
    info:    'bg-primary-light border-primary text-primary',
  }[type]

  const icons = {
    error:   '🛑',
    success: '✓',
    warning: '⚠',
    info:    'ℹ',
  }[type]

  const iconLabels = {
    error:   t('errorIcon'),
    success: t('successIcon'),
    warning: t('warningIcon'),
    info:    t('infoIcon'),
  }[type]

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={`p-3.5 rounded-2xl border text-xs sm:text-sm font-medium flex items-start justify-between gap-3 ${styles}`}
      role="alert"
    >
      <div className="flex items-center gap-2">
        <span className="text-base select-none" aria-label={iconLabels}>{icons}</span>
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
