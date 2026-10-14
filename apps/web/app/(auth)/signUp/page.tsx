'use client'

import React, { useState, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { PhoneSignUpSchema, type AppLanguage } from '@repo/shared'
import { useSignUpForm } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Notice } from '@/components/ui/notice'
import { PasswordStrength } from '@/components/ui/passwordStrength'

function SignUpContent() {
  const t = useTranslations('SignUp')
  const searchParams = useSearchParams()
  const phoneError = searchParams.get('error') === 'phone_taken' ? t('phoneTaken') : null

  const { formData, fieldErrors, generalError, isLoading, setField, setLanguage, handleSubmit } = useSignUpForm()

  const [liveErrors, setLiveErrors] = useState<Record<string, string>>({})
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [usernameChecking, setUsernameChecking] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const onNameChange = (v: string) => {
    setField('name', v)
    const r = PhoneSignUpSchema.shape.name.safeParse(v)
    setLiveErrors((p) => ({ ...p, name: r.success ? '' : (r.error.issues[0]?.message ?? '') }))
  }

  const onUsernameChange = (v: string) => {
    const lower = v.toLowerCase()
    setField('username', lower)
    setUsernameAvailable(null)
    const r = PhoneSignUpSchema.shape.username.safeParse(lower)
    if (!r.success) {
      setLiveErrors((p) => ({ ...p, username: r.error.issues[0]?.message ?? '' }))
      if (debounceRef.current) clearTimeout(debounceRef.current)
      return
    }
    setLiveErrors((p) => ({ ...p, username: '' }))
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!lower) return
    debounceRef.current = setTimeout(async () => {
      setUsernameChecking(true)
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000'}/api/auth/is-username-available`,
          { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: lower }) }
        )
        const data = await res.json() as { available?: boolean }
        const available = data?.available ?? false
        setUsernameAvailable(available)
        if (!available) setLiveErrors((p) => ({ ...p, username: t('usernameTaken') }))
      } catch {
        setUsernameAvailable(null)
      } finally {
        setUsernameChecking(false)
      }
    }, 400)
  }

  const onPhoneChange = (v: string) => {
    setField('phoneNumber', v)
    const r = PhoneSignUpSchema.shape.phoneNumber.safeParse(v)
    if (!r.success) { setLiveErrors((p) => ({ ...p, phoneNumber: r.error.issues[0]?.message ?? '' })); return }
    setLiveErrors((p) => ({ ...p, phoneNumber: '' }))
    fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000'}/api/v1/auth/check-phone?phone=${encodeURIComponent(v)}`)
      .then((res) => res.json())
      .then((data: { exists?: boolean }) => {
        if (data.exists) setLiveErrors((p) => ({ ...p, phoneNumber: t('phoneTakenInline') }))
      })
      .catch(() => {})
  }

  const onPasswordChange = (v: string) => {
    setField('password', v)
    const r = PhoneSignUpSchema.shape.password.safeParse(v)
    setLiveErrors((p) => ({ ...p, password: r.success ? '' : (r.error.issues[0]?.message ?? '') }))
  }

  const languages: Array<{ value: AppLanguage; label: string }> = [
    { value: 'en', label: t('langEn') },
    { value: 'am', label: t('langAm') },
    { value: 'om', label: t('langOm') },
  ]

  const canSubmit =
    !isLoading && !usernameChecking && usernameAvailable === true &&
    !!formData.name && !!formData.username && !!formData.phoneNumber && !!formData.password &&
    !phoneError && !liveErrors.name && !liveErrors.username && !liveErrors.phoneNumber && !liveErrors.password &&
    !fieldErrors.name && !fieldErrors.username && !fieldErrors.phoneNumber && !fieldErrors.password

  return (
    <div className="max-w-md w-full mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{t('title')}</h1>
        <p className="text-sm text-text-muted mt-1">{t('subtitle')}</p>
      </div>

      {phoneError && <Notice type="error" message={phoneError} />}
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
          success={!!(formData.phoneNumber && !liveErrors.phoneNumber && !fieldErrors.phoneNumber)}
          disabled={isLoading}
          hint={!liveErrors.phoneNumber && !fieldErrors.phoneNumber ? t('phoneHint') : undefined}
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
          <PasswordStrength password={formData.password} />
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
