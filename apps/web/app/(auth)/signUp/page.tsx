'use client'

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import { PhoneSignUpSchema, type AppLanguage } from '@repo/shared'
import { useSignUpForm } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Notice } from '@/components/ui/notice'
import { PasswordStrength } from '@/components/ui/passwordStrength'

const STEPS = ['Account', 'Verify SMS', 'Dashboard']

export default function SignUpPage() {
  const {
    formData,
    fieldErrors,
    generalError,
    isLoading,
    setField,
    setLanguage,
    handleSubmit,
  } = useSignUpForm()

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
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: lower }),
          }
        )
        const data = await res.json() as { available?: boolean }
        const available = data?.available ?? false
        setUsernameAvailable(available)
        if (!available) {
          setLiveErrors((p) => ({ ...p, username: 'Username already taken' }))
        }
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
    setLiveErrors((p) => ({ ...p, phoneNumber: r.success ? '' : (r.error.issues[0]?.message ?? '') }))
  }

  const onPasswordChange = (v: string) => {
    setField('password', v)
    const r = PhoneSignUpSchema.shape.password.safeParse(v)
    setLiveErrors((p) => ({ ...p, password: r.success ? '' : (r.error.issues[0]?.message ?? '') }))
  }

  const languages: Array<{ value: AppLanguage; label: string }> = [
    { value: 'am', label: 'አማርኛ (Amharic)' },
    { value: 'om', label: 'Afaan Oromoo (Oromo)' },
    { value: 'ti', label: 'ትግርኛ (Tigrinya)' },
    { value: 'en', label: 'English' },
  ]

  return (
    <div className="max-w-md w-full mx-auto space-y-6">
      {/* Step indicator */}
      <div className="flex justify-center gap-2">
        {STEPS.map((step, i) => (
          <span
            key={step}
            className={
              i === 0
                ? 'bg-primary text-[#151A14] font-mono text-xs px-3 py-1 rounded-full font-bold'
                : 'bg-[var(--color-surface-subtle)] text-text-muted font-mono text-xs px-3 py-1 rounded-full'
            }
          >
            {i + 1}. {step}
          </span>
        ))}
      </div>

      {/* Heading */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Join AgriIntel</h1>
        <p className="text-sm text-text-muted mt-1">Start your precision farming journey.</p>
      </div>

      {/* General error */}
      {generalError && <Notice type="error" message={generalError} />}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          placeholder="Abebe Bikila"
          value={formData.name}
          onChange={(e) => onNameChange(e.target.value)}
          error={liveErrors.name || fieldErrors.name}
          success={!!(formData.name && !liveErrors.name && !fieldErrors.name)}
          disabled={isLoading}
        />

        <Input
          label="Username"
          type="text"
          placeholder="your_username"
          value={formData.username}
          onChange={(e) => onUsernameChange(e.target.value)}
          error={liveErrors.username || fieldErrors.username}
          success={!!(formData.username && usernameAvailable === true && !liveErrors.username)}
          hint={
            usernameChecking
              ? 'Checking availability...'
              : usernameAvailable === true && !liveErrors.username
              ? '✓ Available'
              : 'Lowercase letters, numbers, and underscores only'
          }
          disabled={isLoading}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          style={{ textTransform: 'lowercase' }}
        />

        <Input
          label="Phone Number"
          type="tel"
          placeholder="+251911000000"
          value={formData.phoneNumber}
          onChange={(e) => onPhoneChange(e.target.value)}
          error={liveErrors.phoneNumber || fieldErrors.phoneNumber}
          success={!!(formData.phoneNumber && !liveErrors.phoneNumber && !fieldErrors.phoneNumber)}
          disabled={isLoading}
          hint={
            !liveErrors.phoneNumber && !fieldErrors.phoneNumber
              ? 'Format: +251 9... or 09...'
              : undefined
          }
        />

        <div className="space-y-2">
          <Input
            label="Password"
            type="password"
            placeholder="Min 10 characters (upper, lower, number)"
            value={formData.password}
            onChange={(e) => onPasswordChange(e.target.value)}
            error={liveErrors.password || fieldErrors.password}
            success={!!(formData.password && !liveErrors.password && !fieldErrors.password)}
            disabled={isLoading}
          />
          <PasswordStrength password={formData.password} />
        </div>

        <Select
          label="Preferred Language"
          value={formData.preferredLanguage}
          onChange={(e) => setLanguage(e.target.value as AppLanguage)}
          options={languages}
          disabled={isLoading}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
          disabled={usernameAvailable !== true || usernameChecking}
        >
          Continue to SMS Verification →
        </Button>
      </form>

      {/* Sign-in link */}
      <p className="text-xs text-text-muted text-center">
        Already registered?{' '}
        <Link
          href="/signIn"
          className="font-bold text-primary hover:text-primary-hover font-mono transition-colors"
        >
          Sign In →
        </Link>
      </p>
    </div>
  )
}
