'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { PasswordResetRequestSchema, PasswordResetConfirmSchema } from '@repo/shared'
import { usePasswordReset } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Notice } from '@/components/ui/notice'
import { PasswordStrength } from '@/components/ui/passwordStrength'

function ResetPasswordContent() {
  const t = useTranslations('ResetPassword')
  const {
    phoneNumber, code, newPassword, confirmPassword,
    fieldErrors, generalError, successMessage, isLoading,
    setPhoneNumber, setCode, setNewPassword, setConfirmPassword, handleConfirmSubmit,
  } = usePasswordReset()

  const [liveErrors, setLiveErrors] = useState<Record<string, string>>({})

  const onPhoneChange = (v: string) => {
    setPhoneNumber(v)
    const r = PasswordResetRequestSchema.shape.phoneNumber.safeParse(v)
    setLiveErrors((p) => ({ ...p, phoneNumber: r.success ? '' : (r.error.issues[0]?.message ?? '') }))
  }

  const onCodeChange = (v: string) => {
    setCode(v)
    const valid = v.length === 6 && /^[0-9]{6}$/.test(v)
    setLiveErrors((p) => ({ ...p, code: valid ? '' : v.length > 0 ? t('codeMustBe6') : '' }))
  }

  const onNewPasswordChange = (v: string) => {
    setNewPassword(v)
    const r = PasswordResetConfirmSchema.shape.newPassword.safeParse(v)
    setLiveErrors((p) => ({
      ...p,
      newPassword: r.success ? '' : (r.error.issues[0]?.message ?? ''),
      ...(confirmPassword ? { confirmPassword: v === confirmPassword ? '' : t('passwordMismatch') } : {}),
    }))
  }

  const onConfirmPasswordChange = (v: string) => {
    setConfirmPassword(v)
    setLiveErrors((p) => ({ ...p, confirmPassword: v === newPassword ? '' : v.length > 0 ? t('passwordMismatch') : '' }))
  }

  const canSubmit =
    !isLoading && !!phoneNumber && !!code && !!newPassword && !!confirmPassword &&
    !liveErrors.phoneNumber && !liveErrors.code && !liveErrors.newPassword && !liveErrors.confirmPassword &&
    !fieldErrors.phoneNumber && !fieldErrors.code && !fieldErrors.newPassword && !fieldErrors.confirmPassword

  if (successMessage) {
    return (
      <div className="max-w-md w-full mx-auto">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="flex flex-col items-center justify-center gap-4 py-12"
        >
          <div className="w-20 h-20 rounded-full bg-[var(--color-success-light)] border-2 border-[var(--color-success)] flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <motion.path
                d="M10 20 L17 28 L30 13" stroke="var(--color-success)" strokeWidth="3" fill="none"
                strokeLinecap="round" strokeLinejoin="round"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-text-primary">{t('successTitle')}</h2>
          <p className="text-sm text-text-muted text-center">{successMessage}</p>
          <Link href="/signIn" className="text-xs font-mono font-bold text-primary hover:text-primary-hover transition-colors">
            {t('goToSignIn')}
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-md w-full mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{t('title')}</h1>
        <p className="text-sm text-text-muted mt-1">{t('subtitle')}</p>
      </div>

      {generalError && <Notice type="error" message={generalError} />}

      <form onSubmit={handleConfirmSubmit} className="space-y-4">
        <Input
          label={t('phoneLabel')} type="tel" placeholder="+251911000000"
          value={phoneNumber} onChange={(e) => onPhoneChange(e.target.value)}
          error={liveErrors.phoneNumber || fieldErrors.phoneNumber}
          success={!!(phoneNumber && !liveErrors.phoneNumber && !fieldErrors.phoneNumber)}
          disabled={isLoading}
        />
        <Input
          label={t('codeLabel')} type="text" inputMode="numeric" maxLength={6} placeholder="123456"
          value={code} onChange={(e) => onCodeChange(e.target.value)}
          error={liveErrors.code || fieldErrors.code}
          success={!!(code && !liveErrors.code && !fieldErrors.code)}
          disabled={isLoading}
          hint={!liveErrors.code && !fieldErrors.code ? t('codeHint') : undefined}
        />
        <div className="space-y-2">
          <Input
            label={t('newPassword')} type="password" placeholder={t('passwordPlaceholder')}
            value={newPassword} onChange={(e) => onNewPasswordChange(e.target.value)}
            error={liveErrors.newPassword || fieldErrors.newPassword}
            success={!!(newPassword && !liveErrors.newPassword && !fieldErrors.newPassword)}
            disabled={isLoading}
          />
          <PasswordStrength password={newPassword} />
        </div>
        <Input
          label={t('confirmPassword')} type="password" placeholder={t('confirmPlaceholder')}
          value={confirmPassword} onChange={(e) => onConfirmPasswordChange(e.target.value)}
          error={liveErrors.confirmPassword || fieldErrors.confirmPassword}
          success={!!(confirmPassword && !liveErrors.confirmPassword && !fieldErrors.confirmPassword)}
          disabled={isLoading}
        />
        <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading} disabled={!canSubmit}>
          {t('submit')}
        </Button>
      </form>

      <p className="text-xs text-text-muted text-center">
        <Link href="/signIn" className="font-mono font-bold text-text-muted hover:text-text-primary transition-colors">
          {t('backToSignIn')}
        </Link>
      </p>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-[300px] flex items-center justify-center font-mono text-xs text-text-muted">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}
