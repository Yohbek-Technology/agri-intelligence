import React from 'react'
import Link from 'next/link'
import type { PhoneSignIn } from '@repo/shared'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Notice } from '../ui/notice'
import { Card, CardHeader } from '../ui/card'

export interface SignInFormProps {
  formData: PhoneSignIn
  fieldErrors: Partial<Record<keyof PhoneSignIn, string>>
  generalError: string | null
  isLoading: boolean
  isLockedOut: boolean
  lockoutMinutesRemaining: number
  onFieldChange: (field: keyof PhoneSignIn, value: string) => void
  onSubmit: (e: React.FormEvent) => void
}

export function SignInForm({
  formData,
  fieldErrors,
  generalError,
  isLoading,
  isLockedOut,
  lockoutMinutesRemaining,
  onFieldChange,
  onSubmit,
}: SignInFormProps) {
  return (
    <Card className="w-full max-w-md mx-auto shadow-none">
      <CardHeader
        title="Terminal Authentication"
        subtitle="Autonomous Agricultural Intelligence & Extension System"
        badge="[AUTH-GATE]"
      />

      {isLockedOut && (
        <div className="mb-5">
          <Notice variant="danger" title="Account Locked">
            Too many failed attempts. Temporary security lockout active for {lockoutMinutesRemaining} minutes.
          </Notice>
        </div>
      )}

      {generalError && !isLockedOut && (
        <div className="mb-5">
          <Notice variant="danger">{generalError}</Notice>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Registered Phone Number"
          type="tel"
          placeholder="+251 91 123 4567"
          value={formData.phoneNumber}
          error={fieldErrors.phoneNumber}
          badge="[ET-TELECOM]"
          disabled={isLoading || isLockedOut}
          onChange={(e) => onFieldChange('phoneNumber', e.target.value)}
        />

        <Input
          label="Access Password"
          type="password"
          placeholder="••••••••••••"
          value={formData.password}
          error={fieldErrors.password}
          badge="[SEC-KEY]"
          disabled={isLoading || isLockedOut}
          onChange={(e) => onFieldChange('password', e.target.value)}
        />

        <div className="flex items-center justify-between text-xs pt-1">
          <Link
            href="/forgot-password"
            className="text-text-muted hover:text-text-primary underline decoration-dotted font-mono"
          >
            [Forgot Access Key?]
          </Link>
          <span className="text-text-faint font-mono text-[11px]">[OTP-BYPASS: DIRECT]</span>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
            disabled={isLockedOut}
          >
            Authenticate & Open Workspace
          </Button>
        </div>
      </form>

      <div className="mt-6 pt-5 border-t-[1px] border-border text-center text-xs text-text-muted">
        <span>No registered agricultural profile? </span>
        <Link href="/sign-up" className="font-semibold text-primary hover:underline">
          Register Farmer / Officer Account →
        </Link>
      </div>
    </Card>
  )
}
