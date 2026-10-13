'use client'

import React, { Suspense } from 'react'
import Link from 'next/link'
import { useOtpVerification, useResendCountdown } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Notice } from '@/components/ui/notice'

const CIRCUMFERENCE = 2 * Math.PI * 36 // ≈ 226.19

function ArcTimer({ secondsRemaining, formattedTime }: { secondsRemaining: number; formattedTime: string }) {
  const offset = CIRCUMFERENCE * (1 - secondsRemaining / 600)
  const strokeColor =
    secondsRemaining > 200
      ? 'var(--color-primary)'
      : secondsRemaining > 100
      ? 'var(--color-accent)'
      : 'var(--color-danger)'

  return (
    <div className="flex justify-center">
      <svg width="88" height="88" viewBox="0 0 88 88" fill="none">
        {/* Background circle */}
        <circle cx="44" cy="44" r="36" stroke="var(--color-border)" strokeWidth="5" fill="none" />
        {/* Progress arc */}
        <circle
          cx="44"
          cy="44"
          r="36"
          stroke={strokeColor}
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          transform="rotate(-90 44 44)"
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease' }}
        />
        {/* Time text */}
        <text
          x="44"
          y="41"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="14"
          fontFamily="monospace"
          fontWeight="700"
          fill="var(--color-text-primary)"
        >
          {formattedTime}
        </text>
        <text
          x="44"
          y="57"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="8"
          fontFamily="monospace"
          fill="var(--color-text-muted)"
        >
          remaining
        </text>
      </svg>
    </div>
  )
}

function VerifyOtpContent() {
  const {
    digits,
    phoneNumber,
    isComplete,
    isVerifying,
    error,
    setDigit,
    handleKeyDown,
    handlePaste,
    handleVerify,
    setInputRef,
  } = useOtpVerification()

  const {
    secondsRemaining,
    formattedTime,
    canResend,
    isResending,
    resendStatus,
    handleResend,
  } = useResendCountdown(600)

  // Mask middle digits: show first 4, mask, show last 2
  const maskedPhone = phoneNumber
    ? phoneNumber.slice(0, 4) + phoneNumber.slice(4, -2).replace(/\d/g, '•') + phoneNumber.slice(-2)
    : 'Registered Line'

  return (
    <div className="max-w-md w-full mx-auto space-y-5">
      {/* Phone SVG illustration */}
      <div className="flex justify-center mb-4">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Phone body */}
          <rect x="8" y="4" width="22" height="38" rx="4" stroke="var(--color-primary)" strokeWidth="1.5" />
          <circle cx="19" cy="38" r="2" stroke="var(--color-primary)" strokeWidth="1.5" />
          {/* Signal arcs */}
          <path d="M34 16 Q38 20 34 24" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M37 13 Q43 20 37 27" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />
          <path d="M40 10 Q48 20 40 30" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.3" />
        </svg>
      </div>

      {/* Heading */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-text-primary">Confirm Your Line</h1>
        <p className="text-sm text-text-muted mt-1 mb-3">Enter the 6-digit code sent to:</p>
        <span className="inline-flex items-center gap-1.5 font-mono font-bold text-xs px-3.5 py-1.5 rounded-full bg-primary-light text-primary border border-primary/20">
          {maskedPhone}
        </span>
      </div>

      {/* SVG arc countdown timer */}
      <ArcTimer secondsRemaining={secondsRemaining} formattedTime={formattedTime} />

      {/* Error / resend status */}
      {error && <Notice type="error" message={error} />}
      {resendStatus && <Notice type="info" message={resendStatus} />}

      {/*
        OTP digit inputs — intentional divergence from the shared Input component.
        These are raw <input> elements rather than <Input /> because:
          1. useOtpVerification exposes setInputRef(el, idx) which needs a direct
             HTMLInputElement ref — not the forwarded ref from the Input wrapper.
          2. OTP boxes need a square aspect-ratio layout inside a flex row;
             the Input wrapper's `w-full space-y-1.5` outer div prevents this.
          3. No label, error, or hint slots are needed for individual digit cells.
        If the shared Input gains an `otp` variant that removes the wrapper div,
        migrate here. Token usage (border-primary, bg-primary-light, etc.) mirrors
        the shared component so color/theme changes still apply.
      */}
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        {digits.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => setInputRef(el, idx)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            disabled={isVerifying}
            onChange={(e) => setDigit(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={handlePaste}
            data-filled={!!digit}
            className={`w-11 sm:w-12 h-14 sm:h-16 text-center text-xl sm:text-2xl font-mono font-bold rounded-2xl border-2 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 ${
              digit
                ? 'border-primary bg-primary-light text-primary'
                : 'border-border bg-surface text-text-primary'
            }`}
          />
        ))}
      </div>

      {/* Security note */}
      <div className="flex items-center gap-2 text-xs font-mono text-text-muted bg-[var(--color-surface-subtle)] border border-[var(--color-border)] rounded-xl px-3 py-2">
        <span>🔒</span>
        <span>Code expires in 10 minutes. Do not share it.</span>
      </div>

      {/* Resend row */}
      <div className="flex items-center justify-between text-xs font-mono px-1">
        <span className="text-text-muted">Resend code in:</span>
        {canResend ? (
          <button
            onClick={() => handleResend(phoneNumber)}
            disabled={isResending}
            className="text-accent hover:text-accent-hover font-bold cursor-pointer disabled:opacity-50"
          >
            {isResending ? 'Sending...' : 'Resend Code Now'}
          </button>
        ) : (
          <span className="font-bold text-text-primary">{formattedTime}</span>
        )}
      </div>

      {/* Verify button */}
      <Button
        type="button"
        variant="primary"
        size="lg"
        fullWidth
        disabled={!isComplete || isVerifying}
        isLoading={isVerifying}
        onClick={handleVerify}
      >
        Verify &amp; Activate
      </Button>

      {/* Back link */}
      <div className="text-center">
        <Link
          href="/signUp"
          className="text-xs font-mono text-text-muted hover:text-text-primary transition-colors"
        >
          ← Change phone number
        </Link>
      </div>
    </div>
  )
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[300px] flex items-center justify-center font-mono text-xs text-text-muted">
          Loading...
        </div>
      }
    >
      <VerifyOtpContent />
    </Suspense>
  )
}
