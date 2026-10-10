'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  PasswordResetRequestSchema,
  PasswordResetConfirmSchema,
  PhoneUtils,
} from '@repo/shared'
import { authService } from '../lib/auth-service'

export function usePasswordReset() {
  const router = useRouter()

  const [step, setStep] = useState<'request' | 'confirm'>('request')
  const [phoneNumber, setPhoneNumber] = useState<string>('')
  const [code, setCode] = useState<string>('')
  const [newPassword, setNewPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)

  const handleRequestOtp = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault()

      setFieldErrors({})
      setGeneralError(null)

      const validation = PasswordResetRequestSchema.safeParse({ phoneNumber })
      if (!validation.success) {
        setFieldErrors({ phoneNumber: validation.error.issues[0]?.message || 'Invalid phone number' })
        return
      }

      setIsLoading(true)

      const normalized = PhoneUtils.normalize(validation.data.phoneNumber)
      const result = await authService.requestPasswordReset({ phoneNumber: normalized })

      setIsLoading(false)

      if (!result.success) {
        setGeneralError(result.error || 'Failed to dispatch recovery code.')
        return
      }

      setPhoneNumber(normalized)
      setStep('confirm')
    },
    [phoneNumber]
  )

  const handleConfirmReset = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault()

      setFieldErrors({})
      setGeneralError(null)

      const payload = {
        phoneNumber: PhoneUtils.normalize(phoneNumber),
        code,
        newPassword,
        confirmPassword,
      }

      const validation = PasswordResetConfirmSchema.safeParse(payload)
      if (!validation.success) {
        const errors: Record<string, string> = {}
        for (const issue of validation.error.issues) {
          const path = issue.path[0] as string
          if (path && !errors[path]) {
            errors[path] = issue.message
          }
        }
        setFieldErrors(errors)
        return
      }

      setIsLoading(true)

      const result = await authService.resetPassword(validation.data)

      setIsLoading(false)

      if (!result.success) {
        setGeneralError(result.error || 'Password reset failed.')
        return
      }

      setIsSuccess(true)
      setTimeout(() => {
        router.push('/sign-in')
      }, 2000)
    },
    [phoneNumber, code, newPassword, confirmPassword, router]
  )

  return {
    step,
    phoneNumber,
    code,
    newPassword,
    confirmPassword,
    fieldErrors,
    generalError,
    isLoading,
    isSuccess,
    setPhoneNumber,
    setCode,
    setNewPassword,
    setConfirmPassword,
    handleRequestOtp,
    handleConfirmReset,
    setStep,
  }
}
