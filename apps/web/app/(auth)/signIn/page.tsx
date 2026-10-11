'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useSignInForm } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Notice } from '@/components/ui/notice'
import { BrandLogo } from '@/components/ui/brandLogo'

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
            Platform Gateway
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Access your agricultural operations desk
          </p>
        </div>

        {generalError && (
          <div className="mb-5">
            <Notice type="error" message={generalError} />
          </div>
        )}

        {isLockedOut && (
          <div className="mb-5 p-3.5 rounded-2xl bg-danger-light border border-danger text-danger text-xs font-mono font-medium">
            Account temporarily locked due to 5 failed attempts. Retry in {lockoutMinutesRemaining} min.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Phone Number"
            type="tel"
            placeholder="+251911000000"
            value={formData.phoneNumber}
            onChange={(e) => setField('phoneNumber', e.target.value)}
            error={fieldErrors.phoneNumber}
            disabled={isLoading || isLockedOut}
            hint="Format: +251 9... or 09..."
          />

          <div className="space-y-1">
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
              onChange={(e) => setField('password', e.target.value)}
              error={fieldErrors.password}
              disabled={isLoading || isLockedOut}
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              disabled={isLockedOut}
            >
              Sign In to Station
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-5 border-t border-border-subtle text-center">
          <p className="text-xs text-text-muted">
            New operator or farmer?{' '}
            <Link
              href="/signUp"
              className="font-bold text-primary hover:text-primary-hover font-mono transition-colors"
            >
              Register Account →
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  )
}
