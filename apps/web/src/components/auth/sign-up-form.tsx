import React from 'react'
import Link from 'next/link'
import type { PhoneSignUp } from '@repo/shared'
import { Input } from '../ui/input'
import { Select } from '../ui/select'
import { Button } from '../ui/button'
import { Notice } from '../ui/notice'
import { Card, CardHeader } from '../ui/card'

export interface SignUpFormProps {
  formData: PhoneSignUp
  fieldErrors: Partial<Record<keyof PhoneSignUp, string>>
  generalError: string | null
  isLoading: boolean
  onFieldChange: (field: keyof PhoneSignUp, value: string) => void
  onSubmit: (e: React.FormEvent) => void
}

const LANGUAGE_OPTIONS = [
  { value: 'am', label: 'አማርኛ (Amharic)' },
  { value: 'om', label: 'Afaan Oromoo (Oromo)' },
  { value: 'ti', label: 'ትግርኛ (Tigrinya)' },
  { value: 'en', label: 'English' },
]

export function SignUpForm({
  formData,
  fieldErrors,
  generalError,
  isLoading,
  onFieldChange,
  onSubmit,
}: SignUpFormProps) {
  return (
    <Card className="w-full max-w-md mx-auto shadow-none">
      <CardHeader
        title="Profile Registration"
        subtitle="Autonomous Agricultural Intelligence & Extension System"
        badge="[NEW-ENROLLMENT]"
      />

      {generalError && (
        <div className="mb-5">
          <Notice variant="danger">{generalError}</Notice>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Full Legal Name"
          type="text"
          placeholder="e.g. Abebe Balcha"
          value={formData.name || ''}
          error={fieldErrors.name}
          badge="[IDENTITY]"
          disabled={isLoading}
          onChange={(e) => onFieldChange('name', e.target.value)}
        />

        <Input
          label="Mobile Phone Number"
          type="tel"
          placeholder="+251 91 123 4567"
          value={formData.phoneNumber}
          error={fieldErrors.phoneNumber}
          hint="Formatted to Ethiopian telecom standard (+2519... or 09...)"
          badge="[ET-E164]"
          disabled={isLoading}
          onChange={(e) => onFieldChange('phoneNumber', e.target.value)}
        />

        <Select
          label="Primary Working Language"
          options={LANGUAGE_OPTIONS}
          value={formData.preferredLanguage || 'am'}
          badge="[LOC-VOICE]"
          disabled={isLoading}
          onChange={(e) => onFieldChange('preferredLanguage', e.target.value)}
        />

        <Input
          label="Access Password"
          type="password"
          placeholder="Minimum 10 characters"
          value={formData.password}
          error={fieldErrors.password}
          hint="Must include uppercase, lowercase, and numeric characters"
          badge="[SEC-RULE]"
          disabled={isLoading}
          onChange={(e) => onFieldChange('password', e.target.value)}
        />

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
          >
            Dispatch 6-Digit OTP Code →
          </Button>
        </div>
      </form>

      <div className="mt-6 pt-5 border-t-[1px] border-border text-center text-xs text-text-muted">
        <span>Already hold an active agricultural profile? </span>
        <Link href="/sign-in" className="font-semibold text-primary hover:underline">
          Access Terminal Sign-In →
        </Link>
      </div>
    </Card>
  )
}
