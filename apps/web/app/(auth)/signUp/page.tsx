'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { AppLanguage } from '@repo/shared'
import { useSignUpForm } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Notice } from '@/components/ui/notice'
import { BrandLogo } from '@/components/ui/brandLogo'

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

  const languages: Array<{ value: AppLanguage; label: string }> = [
    { value: 'am', label: 'አማርኛ (Amharic)' },
    { value: 'om', label: 'Afaan Oromoo (Oromo)' },
    { value: 'ti', label: 'ትግርኛ (Tigrinya)' },
    { value: 'en', label: 'English' },
  ]

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
            Operator Enrollment
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Create your unified agricultural station profile
          </p>
        </div>

        {generalError && (
          <div className="mb-5">
            <Notice type="error" message={generalError} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            placeholder="Abebe Bikila"
            value={formData.name}
            onChange={(e) => setField('name', e.target.value)}
            error={fieldErrors.name}
            disabled={isLoading}
          />

          <Input
            label="Phone Number"
            type="tel"
            placeholder="+251911000000"
            value={formData.phoneNumber}
            onChange={(e) => setField('phoneNumber', e.target.value)}
            error={fieldErrors.phoneNumber}
            disabled={isLoading}
            hint="Format: +251 9... or 09..."
          />

          <Input
            label="Password"
            type="password"
            placeholder="Min 10 characters (upper, lower, number)"
            value={formData.password}
            onChange={(e) => setField('password', e.target.value)}
            error={fieldErrors.password}
            disabled={isLoading}
          />

          <Select
            label="Preferred Dialect / Language"
            value={formData.preferredLanguage}
            onChange={(e) => setLanguage(e.target.value as AppLanguage)}
            options={languages}
            disabled={isLoading}
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
            >
              Continue to SMS OTP →
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-5 border-t border-border-subtle text-center">
          <p className="text-xs text-text-muted">
            Already registered?{' '}
            <Link
              href="/signIn"
              className="font-bold text-primary hover:text-primary-hover font-mono transition-colors"
            >
              Sign In →
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  )
}
