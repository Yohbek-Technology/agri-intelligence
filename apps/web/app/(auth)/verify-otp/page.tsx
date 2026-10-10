'use client'

import React, { Suspense } from 'react'
import { useOtpVerification } from '../../../src/hooks/use-otp-verification'
import { useResendCountdown } from '../../../src/hooks/use-resend-countdown'
import { OtpVerifyCard } from '../../../src/components/auth/otp-verify-card'

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
    resendSuccess,
    resendError,
    resendCode,
  } = useResendCountdown()

  return (
    <OtpVerifyCard
      digits={digits}
      phoneNumber={phoneNumber}
      isComplete={isComplete}
      isVerifying={isVerifying}
      error={error}
      countdownFormatted={formattedTime}
      canResend={canResend}
      isResending={isResending}
      resendSuccess={resendSuccess}
      resendError={resendError}
      onChangeDigit={setDigit}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      setInputRef={setInputRef}
      onVerify={handleVerify}
      onResend={() => resendCode(phoneNumber)}
    />
  )
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center font-mono text-xs text-text-muted">
          [INITIALIZING TELECOM VERIFICATION CONSOLE...]
        </div>
      }
    >
      <VerifyOtpContent />
    </Suspense>
  )
}
