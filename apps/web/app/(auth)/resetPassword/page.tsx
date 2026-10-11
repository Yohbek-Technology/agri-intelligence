'use client'

import React, { Suspense } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { usePasswordReset } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Notice } from '@/components/ui/notice'
import { BrandLogo } from '@/components/ui/brandLogo'

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-white border border-border/80 shadow-2xl rounded-3xl p-6 sm:p-8 backdrop-blur-xl">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <BrandLogo size="lg" showSubtitle={false} />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight font-mono uppercase">
            Reset Password
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Submit SMS recovery code and establish new password
          </p>
        </div>

        {generalError && (
          <div className="mb-5">
            <Notice type="error" message={generalError} />
          </div>
        )}

        {successMessage && (
          <div className="mb-5">
            <Notice type="success" message={successMessage} />
          </div>
        )}

        <form onSubmit={handleConfirmSubmit} className="space-y-4">
          <Input
            label="Phone Number"
            type="tel"
            placeholder="+251911000000"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            error={fieldErrors.phoneNumber}
            disabled={isLoading}
          />

          <Input
            label="6-Digit SMS Recovery Code"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            error={fieldErrors.code}
            disabled={isLoading}
            hint="Check your SMS inbox"
          />

          <Input
            label="New Password"
            type="password"
            placeholder="Min 10 characters (upper, lower, number)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={fieldErrors.newPassword}
            disabled={isLoading}
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Repeat new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={fieldErrors.confirmPassword}
            disabled={isLoading}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
          >
            Confirm & Revoke Other Sessions
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-border-subtle text-center">
          <Link
            href="/signIn"
            className="text-xs font-mono font-bold text-text-muted hover:text-text-primary transition-colors"
          >
            ← Return to Sign In
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-[300px] flex items-center justify-center font-mono text-xs text-text-muted">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}
