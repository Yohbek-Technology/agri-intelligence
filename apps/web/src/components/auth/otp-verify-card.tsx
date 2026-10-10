import React from 'react'
import Link from 'next/link'
import { Card, CardHeader } from '../ui/card'
import { Button } from '../ui/button'
import { Notice } from '../ui/notice'
import { OtpInput } from './otp-input'

export interface OtpVerifyCardProps {
  digits: string[]
  phoneNumber: string
  isComplete: boolean
  isVerifying: boolean
  error: string | null
  countdownFormatted: string
  canResend: boolean
  isResending: boolean
  resendSuccess: boolean
  resendError: string | null
  onChangeDigit: (index: number, val: string) => void
  onKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void
  onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void
  setInputRef: (el: HTMLInputElement | null, idx: number) => void
  onVerify: () => void
  onResend: () => void
}

export function OtpVerifyCard({
  digits,
  phoneNumber,
  isComplete,
  isVerifying,
  error,
  countdownFormatted,
  canResend,
  isResending,
  resendSuccess,
  resendError,
  onChangeDigit,
  onKeyDown,
  onPaste,
  setInputRef,
  onVerify,
  onResend,
}: OtpVerifyCardProps) {
  return (
    <Card className="w-full max-w-md mx-auto shadow-none">
      <CardHeader
        title="Telecom Verification"
        subtitle={`Dispatched SMS security code to ${phoneNumber || 'registered phone'}`}
        badge="[OTP-SEC]"
      />

      {error && (
        <div className="mb-5">
          <Notice variant="danger">{error}</Notice>
        </div>
      )}

      {resendSuccess && (
        <div className="mb-5">
          <Notice variant="success" title="Code Dispatched">
            A fresh 6-digit verification code was transmitted via SMS.
          </Notice>
        </div>
      )}

      {resendError && (
        <div className="mb-5">
          <Notice variant="danger">{resendError}</Notice>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-xs font-mono text-text-muted mb-2 text-center uppercase tracking-wider">
            [ENTER 6-DIGIT NUMERIC SECURITY CODE]
          </label>
          <OtpInput
            digits={digits}
            disabled={isVerifying}
            error={Boolean(error)}
            onChangeDigit={onChangeDigit}
            onKeyDown={onKeyDown}
            onPaste={onPaste}
            setInputRef={setInputRef}
          />
        </div>

        <div className="p-3 bg-surface-subtle border-[1px] border-border rounded-[2px] flex items-center justify-between text-xs font-mono">
          <span className="text-text-muted">Resend Countdown:</span>
          <span className="font-bold text-text-primary">[{countdownFormatted}]</span>
        </div>

        <div className="space-y-2.5">
          <Button
            type="button"
            variant="primary"
            fullWidth
            disabled={!isComplete || isVerifying}
            isLoading={isVerifying}
            onClick={onVerify}
          >
            Verify & Activate Account →
          </Button>

          <Button
            type="button"
            variant="outline"
            fullWidth
            disabled={!canResend || isResending}
            isLoading={isResending}
            onClick={onResend}
          >
            {canResend ? 'Resend 6-Digit SMS Code' : `Resend Available in ${countdownFormatted}`}
          </Button>
        </div>

        <div className="pt-3 border-t-[1px] border-border text-center text-xs">
          <Link href="/sign-up" className="text-text-muted hover:text-text-primary underline font-mono">
            ← Alter Phone Number or Restart
          </Link>
        </div>
      </div>
    </Card>
  )
}
