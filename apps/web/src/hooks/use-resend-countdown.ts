'use client'

import { useState, useEffect, useCallback } from 'react'
import { authService } from '../lib/auth-service'

const INITIAL_COUNTDOWN_SECONDS = 600

export function useResendCountdown(initialSeconds: number = INITIAL_COUNTDOWN_SECONDS) {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(initialSeconds)
  const [isResending, setIsResending] = useState<boolean>(false)
  const [resendError, setResendError] = useState<string | null>(null)
  const [resendSuccess, setResendSuccess] = useState<boolean>(false)

  useEffect(() => {
    if (secondsRemaining <= 0) return

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [secondsRemaining])

  const resetCountdown = useCallback((seconds: number = initialSeconds) => {
    setSecondsRemaining(seconds)
    setResendSuccess(false)
    setResendError(null)
  }, [initialSeconds])

  const resendCode = useCallback(
    async (phoneNumber: string) => {
      if (secondsRemaining > 0 || isResending) return

      setIsResending(true)
      setResendError(null)
      setResendSuccess(false)

      const result = await authService.requestOtp({ phoneNumber })

      setIsResending(false)

      if (!result.success) {
        setResendError(result.error || 'Failed to dispatch new OTP code.')
      } else {
        setResendSuccess(true)
        setSecondsRemaining(initialSeconds)
      }
    },
    [secondsRemaining, isResending, initialSeconds]
  )

  const minutes = Math.floor(secondsRemaining / 60)
  const seconds = secondsRemaining % 60
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  return {
    secondsRemaining,
    formattedTime,
    canResend: secondsRemaining === 0 && !isResending,
    isResending,
    resendError,
    resendSuccess,
    resetCountdown,
    resendCode,
  }
}
