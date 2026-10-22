'use client'

import React, { Suspense } from 'react'
import Link from 'next/link'
import { LockKeyhole } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useForgotPasswordForm } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Notice } from '@/components/ui/notice'

function ForgotPasswordContent() {
  const t = useTranslations('ForgotPassword')
  const {
    phoneNumber,
    liveError,
    generalError,
    isLoading,
    onPhoneChange,
    handleSubmit,
  } = useForgotPasswordForm()

  return (
    <div className="max-w-md w-full mx-auto space-y-6">
      <div className="flex justify-center">
        <div className="w-14 h-14 rounded-2xl bg-accent-light flex items-center justify-center" style={{ border: '2px solid var(--color-border-ui)' }}>
          <LockKeyhole size={28} color="var(--color-accent)" strokeWidth={1.5} />
        </div>
      </div>

      <div className="text-center">
        <h1 className="text-2xl font-bold text-text-primary">{t('title')}</h1>
        <p className="text-sm text-text-muted mt-1">{t('subtitle')}</p>
      </div>

      {generalError && <Notice type="error" message={generalError} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t('phoneLabel')}
          type="tel"
          placeholder="+251911000000"
          value={phoneNumber}
          onChange={(e) => onPhoneChange(e.target.value)}
          error={liveError}
          success={!!(phoneNumber && !liveError)}
          disabled={isLoading}
          hint={!liveError ? t('phoneHint') : undefined}
        />

        <div className="flex items-center gap-2 text-xs font-mono text-text-muted bg-accent-light rounded-xl px-3 py-2" style={{ border: '2px solid var(--color-border-ui)' }}>
          <span>⏱</span>
          <span>{t('otpNote')}</span>
        </div>

        <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading} disabled={!!liveError || !phoneNumber}>
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

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-[300px] flex items-center justify-center font-mono text-xs text-text-muted">Loading...</div>}>
      <ForgotPasswordContent />
    </Suspense>
  )
}
