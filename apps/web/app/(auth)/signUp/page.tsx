'use client'

import React, { Suspense } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import type { AppLanguage } from '@repo/shared'
import { useSignUpForm } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Notice } from '@/components/ui/notice'
import { PasswordStrength } from '@/components/ui/passwordStrength'

function SignUpContent() {
  const t = useTranslations('SignUp')
  const {
    formData,
    fieldErrors,
    liveErrors,
    generalError,
    phoneError,
    isLoading,
    usernameAvailable,
    usernameChecking,
    phoneAvailable,
    phoneChecking,
    onNameChange,
    onUsernameChange,
    onPhoneChange,
    onPasswordChange,
    setLanguage,
    handleSubmit,
    canSubmit,
  } = useSignUpForm()

  const languages: Array<{ value: AppLanguage; label: string }> = [
    { value: 'en', label: t('langEn') },
    { value: 'am', label: t('langAm') },
    { value: 'om', label: t('langOm') },
  ]

  return (
    <div className="max-w-md w-full mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{t('title')}</h1>
        <p className="text-sm text-text-muted mt-1">{t('subtitle')}</p>
      </div>

      {phoneError && <Notice type="error" message={t('phoneTaken')} />}
      {generalError && <Notice type="error" message={generalError} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t('fullName')}
          type="text"
          placeholder="Abebe Bikila"
          value={formData.name}
          onChange={(e) => onNameChange(e.target.value)}
          error={liveErrors.name || fieldErrors.name}
          success={!!(formData.name && !liveErrors.name && !fieldErrors.name)}
          disabled={isLoading}
        />

        <Input
          label={t('username')}
          type="text"
          placeholder="your_username"
          value={formData.username}
          onChange={(e) => onUsernameChange(e.target.value)}
          error={liveErrors.username || fieldErrors.username}
          success={!!(formData.username && usernameAvailable === true && !liveErrors.username)}
          hint={
            usernameChecking ? t('usernameChecking')
            : usernameAvailable === true && !liveErrors.username ? t('usernameAvailable')
            : t('usernameLowercaseHint')
          }
          disabled={isLoading}
          autoCapitalize="none"
          style={{ textTransform: 'lowercase' }}
        />

        <Input
          label={t('phoneNumber')}
          type="tel"
          placeholder="+251911000000"
          value={formData.phoneNumber}
          onChange={(e) => onPhoneChange(e.target.value)}
          error={liveErrors.phoneNumber || fieldErrors.phoneNumber}
          success={!!(formData.phoneNumber && phoneAvailable === true && !liveErrors.phoneNumber && !fieldErrors.phoneNumber)}
          disabled={isLoading}
          hint={
            phoneChecking ? t('usernameChecking')
            : phoneAvailable === true && !liveErrors.phoneNumber && !fieldErrors.phoneNumber ? '✓ Phone number available'
            : !liveErrors.phoneNumber && !fieldErrors.phoneNumber ? t('phoneHint')
            : undefined
          }
        />

        <div className="space-y-2">
          <Input
            label={t('password')}
            type="password"
            placeholder={t('passwordPlaceholder')}
            value={formData.password}
            onChange={(e) => onPasswordChange(e.target.value)}
            error={liveErrors.password || fieldErrors.password}
            success={!!(formData.password && !liveErrors.password && !fieldErrors.password)}
            disabled={isLoading}
          />
          <PasswordStrength password={formData.password || ''} />
        </div>

        <Select
          label={t('preferredLanguage')}
          value={formData.preferredLanguage}
          onChange={(e) => setLanguage(e.target.value as AppLanguage)}
          options={languages}
          disabled={isLoading}
        />

        <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading} disabled={!canSubmit}>
          {t('submit')}
        </Button>
      </form>

      <p className="text-xs text-text-muted text-center">
        {t('alreadyRegistered')}{' '}
        <Link href="/signIn" className="font-bold text-primary hover:text-primary-hover font-mono transition-colors">
          {t('signIn')}
        </Link>
      </p>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-[300px] flex items-center justify-center font-mono text-xs text-text-muted">Loading...</div>}>
      <SignUpContent />
    </Suspense>
  )
}
