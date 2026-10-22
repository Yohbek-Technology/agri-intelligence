'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { UsernameSignInSchema } from '@repo/shared'
import { useSignInForm } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Notice } from '@/components/ui/notice'

export default function SignInPage() {
  const t = useTranslations('SignIn')
  const {
    formData,
    fieldErrors,
    generalError,
    isLoading,
    isLockedOut,
    lockoutMinutesRemaining,
    setField,
    handleSubmit,
  } = useSignInForm()

  const [liveErrors, setLiveErrors] = useState<Record<string, string>>({})

  const onUsernameChange = (value: string) => {
    setField('username', value)
    const r = UsernameSignInSchema.shape.username.safeParse(value)
    setLiveErrors((prev) => ({
      ...prev,
      username: r.success ? '' : (r.error.issues[0]?.message ?? ''),
    }))
  }

  const onPasswordChange = (value: string) => {
    setField('password', value)
    const r = UsernameSignInSchema.shape.password.safeParse(value)
    setLiveErrors((prev) => ({
      ...prev,
      password: r.success ? '' : (r.error.issues[0]?.message ?? ''),
    }))
  }

  const canSubmit =
    !isLoading &&
    !isLockedOut &&
    !!formData.username &&
    !!formData.password &&
    !liveErrors.username &&
    !liveErrors.password &&
    !fieldErrors.username &&
    !fieldErrors.password

  return (
    <div className="max-w-md w-full mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{t('title')}</h1>
        <p className="text-sm text-text-muted mt-1">{t('subtitle')}</p>
      </div>

      {isLockedOut && (
        <div className="flex items-center gap-2 bg-danger-light border-l-4 border-danger text-danger text-xs font-mono p-3 rounded-lg">
          <span>⚠️</span>
          <span>{t('lockedOut', { minutes: lockoutMinutesRemaining })}</span>
        </div>
      )}

      {generalError && !isLockedOut && <Notice type="error" message={generalError} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t('username')}
          type="text"
          placeholder="your_username"
          value={formData.username}
          onChange={(e) => onUsernameChange(e.target.value)}
          error={liveErrors.username || fieldErrors.username}
          success={!!(formData.username && !liveErrors.username && !fieldErrors.username)}
          disabled={isLoading || isLockedOut}
          hint={!liveErrors.username && !fieldErrors.username ? t('usernameHint') : undefined}
        />

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider font-mono">
              {t('password')}
            </label>
            <Link href="/forgotPassword" className="text-xs font-mono text-accent hover:text-accent-hover font-semibold transition-colors">
              {t('forgotPassword')}
            </Link>
          </div>
          <Input
            type="password"
            placeholder="••••••••••••"
            value={formData.password}
            onChange={(e) => onPasswordChange(e.target.value)}
            error={liveErrors.password || fieldErrors.password}
            success={!!(formData.password && !liveErrors.password && !fieldErrors.password)}
            disabled={isLoading || isLockedOut}
          />
        </div>

        <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading} disabled={!canSubmit}>
          {t('submit')}
        </Button>
      </form>

      <div className="bg-surface-subtle rounded-2xl p-4" style={{ border: '1.5px solid var(--color-border-ui)' }}>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span>🌤</span>
            <span className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider">{t('fieldAdvisory')}</span>
          </div>
          <span className="text-[10px] font-mono text-text-faint bg-[var(--color-border)] px-1.5 py-0.5 rounded-full uppercase tracking-wide">
            {t('sample')}
          </span>
        </div>
        <p className="text-sm text-text-primary">{t('advisoryText')}</p>
      </div>

      <p className="text-xs text-text-muted text-center">
        {t('newHere')}{' '}
        <Link href="/signUp" className="font-bold text-primary hover:text-primary-hover font-mono transition-colors">
          {t('register')}
        </Link>
      </p>
    </div>
  )
}
