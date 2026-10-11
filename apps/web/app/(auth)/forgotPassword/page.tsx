'use client'

import React, { Suspense } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { usePasswordReset } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Notice } from '@/components/ui/notice'
import { BrandLogo } from '@/components/ui/brandLogo'

function ForgotPasswordContent() {
  const {
    phoneNumber,
    generalError,
    isLoading,
    setPhoneNumber,
    handleRequestSubmit,
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
            Recover Access
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Request an SMS OTP recovery token
          </p>
        </div>

        {generalError && (
          <div className="mb-5">
            <Notice type="error" message={generalError} />
          </div>
        )}

        <form onSubmit={handleRequestSubmit} className="space-y-4">
          <Input
            label="Registered Phone Number"
            type="tel"
            placeholder="+251911000000"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={isLoading}
            hint="Format: +251 9... or 09..."
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
          >
            Send Recovery SMS Token →
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

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-[300px] flex items-center justify-center font-mono text-xs text-text-muted">Loading...</div>}>
      <ForgotPasswordContent />
    </Suspense>
  )
}
