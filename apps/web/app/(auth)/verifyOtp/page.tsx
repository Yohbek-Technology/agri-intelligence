'use client'

import React, { Suspense } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useOtpVerification, useResendCountdown } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Notice } from '@/components/ui/notice'

const CIRCUMFERENCE = 2 * Math.PI * 36

function ArcTimer({ secondsRemaining, formattedTime }: { secondsRemaining: number; formattedTime: string }) {
  const t = useTranslations('VerifyOtp')
  const offset = CIRCUMFERENCE * (1 - secondsRemaining / 600)
  const strokeColor =
    secondsRemaining > 200 ? 'var(--color-primary)'
    : secondsRemaining > 100 ? 'var(--color-accent)'
    : 'var(--color-danger)'

  return (
    <div className="flex justify-center">
      <svg width="88" height="88" viewBox="0 0 88 88" fill="none">
        <circle cx="44" cy="44" r="36" stroke="var(--color-border)" strokeWidth="5" fill="none" />
        <circle
          cx="44" cy="44" r="36"
          stroke={strokeColor} strokeWidth="5" fill="none" strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE} strokeDashoffset={offset}
          transform="rotate(-90 44 44)"
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease' }}
        />
        <text x="44" y="41" textAnchor="middle" dominantBaseline="middle" fontSize="14" fontFamily="monospace" fontWeight="700" fill="var(--color-text-primary)">
          {formattedTime}
        </text>
        <text x="44" y="57" textAnchor="middle" dominantBaseline="middle" fontSize="8" fontFamily="monospace" fill="var(--color-text-muted)">
          {t('remaining')}
        </text>
      </svg>
    </div>
  )
}

function VerifyOtpContent() {
  const t = useTranslations('VerifyOtp')
  const { digits, phoneNumber, isComplete, isVerifying, error, setDigit, handleKeyDown, handlePaste, handleVerify, setInputRef } = useOtpVerification()
  const { secondsRemaining, formattedTime, canResend, isResending, resendStatus, handleResend } = useResendCountdown(600)

  const maskedPhone = phoneNumber
    ? phoneNumber.slice(0, 4) + phoneNumber.slice(4, -2).replace(/\d/g, '•') + phoneNumber.slice(-2)
    : 'Registered Line'

  return (
    <div className="max-w-md w-full mx-auto space-y-5">
      <div className="flex justify-center mb-4">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect x="8" y="4" width="22" height="38" rx="4" stroke="var(--color-primary)" strokeWidth="1.5" />
          <circle cx="19" cy="38" r="2" stroke="var(--color-primary)" strokeWidth="1.5" />
          <path d="M34 16 Q38 20 34 24" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M37 13 Q43 20 37 27" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />
          <path d="M40 10 Q48 20 40 30" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.3" />
        </svg>
      </div>

      <div className="text-center">
        <h1 className="text-2xl font-bold text-text-primary">{t('title')}</h1>
        <p className="text-sm text-text-muted mt-1 mb-3">{t('subtitle')}</p>
        <span className="inline-flex items-center gap-1.5 font-mono font-bold text-xs px-3.5 py-1.5 rounded-full bg-primary-light text-primary border border-primary/20">
          {maskedPhone}
        </span>
      </div>

      <ArcTimer secondsRemaining={secondsRemaining} formattedTime={formattedTime} />

      {error && <Notice type="error" message={error} />}
      {resendStatus && <Notice type="info" message={resendStatus} />}

      <div className="flex items-center justify-between gap-2 sm:gap-3">
        {digits.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => setInputRef(el, idx)}
            type="text" inputMode="numeric" maxLength={1}
            value={digit} disabled={isVerifying}
            onChange={(e) => setDigit(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={handlePaste}
            className={`w-11 sm:w-12 h-14 sm:h-16 text-center text-xl sm:text-2xl font-mono font-bold rounded-2xl transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 ${
              digit ? 'bg-primary-light text-primary' : 'bg-surface text-text-primary'
            }`}
            style={{ border: digit ? '1.5px solid var(--color-primary)' : '1.5px solid var(--color-border-ui)' }}
          />
        ))}
      </div>

      <div className="flex items-center gap-2 text-xs font-mono text-text-muted bg-surface-subtle rounded-xl px-3 py-2" style={{ border: '1.5px solid var(--color-border-ui)' }}>
        <span>🔒</span>
        <span>{t('securityNote')}</span>
      </div>

      <div className="flex items-center justify-between text-xs font-mono px-1">
        <span className="text-text-muted">{t('resendLabel')}</span>
        {canResend ? (
          <button onClick={() => handleResend(phoneNumber)} disabled={isResending} className="text-accent hover:text-accent-hover font-bold cursor-pointer disabled:opacity-50">
            {isResending ? t('sending') : t('resendNow')}
          </button>
        ) : (
          <span className="font-bold text-text-primary">{formattedTime}</span>
        )}
      </div>

      <Button type="button" variant="primary" size="lg" fullWidth disabled={!isComplete || isVerifying} isLoading={isVerifying} onClick={handleVerify}>
        {t('submit')}
      </Button>

      <div className="text-center">
        <Link href="/signUp" className="text-xs font-mono text-text-muted hover:text-text-primary transition-colors">
          {t('changePhone')}
        </Link>
      </div>
    </div>
  )
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="min-h-[300px] flex items-center justify-center font-mono text-xs text-text-muted">Loading...</div>}>
      <VerifyOtpContent />
    </Suspense>
  )
}
