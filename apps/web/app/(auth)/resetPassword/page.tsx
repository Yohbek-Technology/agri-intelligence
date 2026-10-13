'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { PasswordResetRequestSchema, PasswordResetConfirmSchema } from '@repo/shared'
import { usePasswordReset } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Notice } from '@/components/ui/notice'
import { PasswordStrength } from '@/components/ui/passwordStrength'

function ResetPasswordContent() {
  const {
    phoneNumber,
    code,
    newPassword,
    confirmPassword,
    fieldErrors,
    generalError,
    successMessage,
    isLoading,
    setPhoneNumber,
    setCode,
    setNewPassword,
    setConfirmPassword,
    handleConfirmSubmit,
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
    setLiveErrors((p) => ({
      ...p,
      code: valid ? '' : v.length > 0 ? 'Must be exactly 6 digits' : '',
    }))
  }

  const onNewPasswordChange = (v: string) => {
    setNewPassword(v)
    const r = PasswordResetConfirmSchema.shape.newPassword.safeParse(v)
    setLiveErrors((p) => {
      const next: Record<string, string> = {
        ...p,
        newPassword: r.success ? '' : (r.error.issues[0]?.message ?? ''),
      }
      if (confirmPassword) {
        next.confirmPassword = v === confirmPassword ? '' : 'Passwords do not match'
      }
      return next
    })
  }

  const onConfirmPasswordChange = (v: string) => {
    setConfirmPassword(v)
    setLiveErrors((p) => ({
      ...p,
      confirmPassword: v === newPassword ? '' : v.length > 0 ? 'Passwords do not match' : '',
    }))
  }

  const canSubmit =
    !isLoading &&
    !!phoneNumber &&
    !!code &&
    !!newPassword &&
    !!confirmPassword &&
    !liveErrors.phoneNumber &&
    !liveErrors.code &&
    !liveErrors.newPassword &&
    !liveErrors.confirmPassword &&
    !fieldErrors.phoneNumber &&
    !fieldErrors.code &&
    !fieldErrors.newPassword &&
    !fieldErrors.confirmPassword

  if (successMessage) {
    return (
      <div className="max-w-md w-full mx-auto">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="flex flex-col items-center justify-center gap-4 py-12"
        >
          <div className="w-20 h-20 rounded-full bg-[var(--color-success-light)] border-2 border-[var(--color-success)] flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <motion.path
                d="M10 20 L17 28 L30 13"
                stroke="var(--color-success)"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-text-primary">Password Updated</h2>
          <p className="text-sm text-text-muted text-center">{successMessage}</p>
          <Link
            href="/signIn"
            className="text-xs font-mono font-bold text-primary hover:text-primary-hover transition-colors"
          >
            Go to Sign In →
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-md w-full mx-auto space-y-6">
      {/* Heading */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Set New Password</h1>
        <p className="text-sm text-text-muted mt-1">
          Enter your recovery code and choose a strong new password.
        </p>
      </div>

      {/* General error */}
      {generalError && <Notice type="error" message={generalError} />}

      {/* Form */}
      <form onSubmit={handleConfirmSubmit} className="space-y-4">
        <Input
          label="Phone Number"
          type="tel"
          placeholder="+251911000000"
          value={phoneNumber}
          onChange={(e) => onPhoneChange(e.target.value)}
          error={liveErrors.phoneNumber || fieldErrors.phoneNumber}
          success={!!(phoneNumber && !liveErrors.phoneNumber && !fieldErrors.phoneNumber)}
          disabled={isLoading}
        />

        <Input
          label="6-Digit Recovery Code"
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="123456"
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          error={liveErrors.code || fieldErrors.code}
          success={!!(code && !liveErrors.code && !fieldErrors.code)}
          disabled={isLoading}
          hint={!liveErrors.code && !fieldErrors.code ? 'Check your SMS inbox' : undefined}
        />

        <div className="space-y-2">
          <Input
            label="New Password"
            type="password"
            placeholder="Min 10 characters (upper, lower, number)"
            value={newPassword}
            onChange={(e) => onNewPasswordChange(e.target.value)}
            error={liveErrors.newPassword || fieldErrors.newPassword}
            success={!!(newPassword && !liveErrors.newPassword && !fieldErrors.newPassword)}
            disabled={isLoading}
          />
          <PasswordStrength password={newPassword} />
        </div>

        <Input
          label="Confirm New Password"
          type="password"
          placeholder="Repeat new password"
          value={confirmPassword}
          onChange={(e) => onConfirmPasswordChange(e.target.value)}
          error={liveErrors.confirmPassword || fieldErrors.confirmPassword}
          success={
            !!(
              confirmPassword &&
              !liveErrors.confirmPassword &&
              !fieldErrors.confirmPassword
            )
          }
          disabled={isLoading}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
          disabled={!canSubmit}
        >
          Reset &amp; Revoke Sessions →
        </Button>
      </form>

      {/* Back link */}
      <p className="text-xs text-text-muted text-center">
        <Link
          href="/signIn"
          className="font-mono font-bold text-text-muted hover:text-text-primary transition-colors"
        >
          ← Return to Sign In
        </Link>
      </p>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[300px] flex items-center justify-center font-mono text-xs text-text-muted">
          Loading...
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  )
}
