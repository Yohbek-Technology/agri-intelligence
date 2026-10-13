'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LockKeyhole } from 'lucide-react'
import { PasswordResetRequestSchema, PhoneUtils } from '@repo/shared'
import { authService } from '@/services/authService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Notice } from '@/components/ui/notice'

function ForgotPasswordContent() {
  const router = useRouter()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [liveError, setLiveError] = useState('')
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const onPhoneChange = (v: string) => {
    setPhoneNumber(v)
    const r = PasswordResetRequestSchema.shape.phoneNumber.safeParse(v)
    setLiveError(r.success ? '' : (r.error.issues[0]?.message ?? ''))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const parseResult = PasswordResetRequestSchema.safeParse({ phoneNumber })
    if (!parseResult.success) {
      setLiveError(parseResult.error.issues[0]?.message ?? 'Invalid phone number.')
      return
    }
    setIsLoading(true)
    setGeneralError(null)
    const result = await authService.requestPasswordReset(parseResult.data)
    setIsLoading(false)
    if (!result.success) {
      setGeneralError(result.error || 'Failed to send recovery code. Ensure the number is registered.')
      return
    }
    // Redirect to reset page with phone pre-filled
    router.push(`/resetPassword?phone=${encodeURIComponent(PhoneUtils.normalize(parseResult.data.phoneNumber))}`)
  }

  return (
    <div className="max-w-md w-full mx-auto space-y-6">
      <div className="flex justify-center">
        <div className="w-14 h-14 rounded-2xl bg-[var(--color-accent-light)] border border-[var(--color-accent)]/30 flex items-center justify-center">
          <LockKeyhole size={28} color="var(--color-accent)" strokeWidth={1.5} />
        </div>
      </div>

      <div className="text-center">
        <h1 className="text-2xl font-bold text-text-primary">Account Recovery</h1>
        <p className="text-sm text-text-muted mt-1">
          We&apos;ll send a 6-digit code to your registered line.
        </p>
      </div>

      {generalError && <Notice type="error" message={generalError} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Registered Phone Number"
          type="tel"
          placeholder="+251911000000"
          value={phoneNumber}
          onChange={(e) => onPhoneChange(e.target.value)}
          error={liveError}
          success={!!(phoneNumber && !liveError)}
          disabled={isLoading}
          hint={!liveError ? 'Format: +251 9... or 09...' : undefined}
        />

        <div className="flex items-center gap-2 text-xs font-mono text-text-muted bg-[var(--color-accent-light)] border border-[var(--color-accent)]/30 rounded-xl px-3 py-2">
          <span>⏱</span>
          <span>OTP expires in 10 minutes. Keep your phone nearby.</span>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
          disabled={!!liveError || !phoneNumber}
        >
          Send Recovery Code →
        </Button>
      </form>

      <p className="text-xs text-text-muted text-center">
        <Link href="/signIn" className="font-mono font-bold text-text-muted hover:text-text-primary transition-colors">
          ← Return to Sign In
        </Link>
      </p>
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-[300px] flex items-center justify-center font-mono text-xs text-text-muted">Loading...</div>}>
      <ForgotPasswordContent />
    </Suspense>
  )
}
