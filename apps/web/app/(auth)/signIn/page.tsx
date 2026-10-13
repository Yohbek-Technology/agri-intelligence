'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { PhoneSignInSchema } from '@repo/shared'
import { useSignInForm } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Notice } from '@/components/ui/notice'

export default function SignInPage() {
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

  const onPhoneChange = (value: string) => {
    setField('phoneNumber', value)
    const r = PhoneSignInSchema.shape.phoneNumber.safeParse(value)
    setLiveErrors((prev) => ({
      ...prev,
      phoneNumber: r.success ? '' : (r.error.issues[0]?.message ?? ''),
    }))
  }

  const onPasswordChange = (value: string) => {
    setField('password', value)
    const r = PhoneSignInSchema.shape.password.safeParse(value)
    setLiveErrors((prev) => ({
      ...prev,
      password: r.success ? '' : (r.error.issues[0]?.message ?? ''),
    }))
  }

  return (
    <div className="max-w-md w-full mx-auto space-y-6">
      {/* Heading */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Welcome Back</h1>
        <p className="text-sm text-text-muted mt-1">Monitor your crops. Extend your reach.</p>
      </div>

      {/* Lockout banner */}
      {isLockedOut && (
        <div className="flex items-center gap-2 bg-danger-light border-l-4 border-danger text-danger text-xs font-mono p-3 rounded-lg">
          <span>⚠️</span>
          <span>
            Account temporarily locked after 5 failed attempts. Retry in {lockoutMinutesRemaining} min.
          </span>
        </div>
      )}

      {/* General error */}
      {generalError && !isLockedOut && <Notice type="error" message={generalError} />}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Phone Number"
          type="tel"
          placeholder="+251911000000"
          value={formData.phoneNumber}
          onChange={(e) => onPhoneChange(e.target.value)}
          error={liveErrors.phoneNumber || fieldErrors.phoneNumber}
          success={!!(formData.phoneNumber && !liveErrors.phoneNumber && !fieldErrors.phoneNumber)}
          disabled={isLoading || isLockedOut}
          hint={!liveErrors.phoneNumber && !fieldErrors.phoneNumber ? 'Format: +251 9... or 09...' : undefined}
        />

        {/* Password with inline forgot link */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider font-mono">
              Password
            </label>
            <Link
              href="/forgotPassword"
              className="text-xs font-mono text-accent hover:text-accent-hover font-semibold transition-colors"
            >
              Forgot password?
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

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
          disabled={isLockedOut}
        >
          Sign In →
        </Button>
      </form>

      {/* Field conditions widget — sample/placeholder data, not a live feed */}
      <div className="bg-[var(--color-surface-subtle)] border border-[var(--color-border)] rounded-2xl p-4">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span>🌤</span>
            <span className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider">
              Adama Region
            </span>
          </div>
          <span className="text-[10px] font-mono text-text-faint bg-[var(--color-border)] px-1.5 py-0.5 rounded-full uppercase tracking-wide">
            Sample
          </span>
        </div>
        <p className="text-sm text-text-primary">
          Optimal spray window: Tomorrow 07:00–13:00
        </p>
      </div>

      {/* Sign-up link */}
      <p className="text-xs text-text-muted text-center">
        New here?{' '}
        <Link
          href="/signUp"
          className="font-bold text-primary hover:text-primary-hover font-mono transition-colors"
        >
          Register Account →
        </Link>
      </p>
    </div>
  )
}
