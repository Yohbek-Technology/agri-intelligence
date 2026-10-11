'use client'

import React, { Suspense } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useOtpVerification, useResendCountdown } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Notice } from '@/components/ui/notice'
import { BrandLogo } from '@/components/ui/brandLogo'

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
    formattedTime,
    canResend,
    isResending,
    resendStatus,
    handleResend,
  } = useResendCountdown(600)

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
            SMS Verification
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            6-digit security token dispatched to:
          </p>
          <div className="inline-block mt-2 font-mono font-bold text-xs sm:text-sm px-3.5 py-1 rounded-full bg-primary-light text-primary border border-primary/20">
            {phoneNumber || 'Registered Line'}
          </div>
        </div>

        {error && (
          <div className="mb-4">
            <Notice type="error" message={error} />
          </div>
        )}

        {resendStatus && (
          <div className="mb-4">
            <Notice type="info" message={resendStatus} />
          </div>
        )}

        <div className="flex items-center justify-between gap-2 sm:gap-3 my-4">
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
              className="w-11 sm:w-13 h-14 sm:h-16 text-center text-xl sm:text-2xl font-mono font-bold bg-white border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl transition-all shadow-sm focus:outline-none disabled:opacity-50"
            />
          ))}
        </div>

        <div className="flex items-center justify-between text-xs font-mono my-4 px-1">
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

        <Button
          type="button"
          variant="primary"
          size="lg"
          fullWidth
          disabled={!isComplete || isVerifying}
          isLoading={isVerifying}
          onClick={handleVerify}
        >
          Verify & Activate Workspace
        </Button>

        <div className="mt-6 pt-5 border-t border-border-subtle text-center">
          <Link
            href="/signUp"
            className="text-xs font-mono text-text-muted hover:text-text-primary transition-colors"
          >
            ← Change phone number
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="min-h-[300px] flex items-center justify-center font-mono text-xs text-text-muted">Loading...</div>}>
      <VerifyOtpContent />
    </Suspense>
  )
}
