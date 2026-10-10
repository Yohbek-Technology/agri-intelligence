'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PhoneSignInSchema, type PhoneSignIn, type AuthUser } from '@repo/shared'
import { authService } from '../lib/auth-service'
import { useAuth } from '../providers/auth-provider'
import { getDashboardPath } from './use-auth-session'

const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION_SECONDS = 15 * 60

export function useSignInForm() {
  const router = useRouter()
  const { refetch } = useAuth()

  const [formData, setFormData] = useState<PhoneSignIn>({
    phoneNumber: '',
    password: '',
  })

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof PhoneSignIn, string>>>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [failedAttempts, setFailedAttempts] = useState<number>(0)
  const [lockoutSecondsRemaining, setLockoutSecondsRemaining] = useState<number>(0)

  useEffect(() => {
    if (lockoutSecondsRemaining <= 0) return

    const timer = setInterval(() => {
      setLockoutSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [lockoutSecondsRemaining])

  const setField = useCallback((field: keyof PhoneSignIn, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
    setGeneralError(null)
  }, [])

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault()

      if (lockoutSecondsRemaining > 0) {
        setGeneralError(`Security lockout in effect. Wait ${Math.ceil(lockoutSecondsRemaining / 60)} minutes.`)
        return
      }

      setFieldErrors({})
      setGeneralError(null)

      const validation = PhoneSignInSchema.safeParse(formData)
      if (!validation.success) {
        const errors: Partial<Record<keyof PhoneSignIn, string>> = {}
        for (const issue of validation.error.issues) {
          const path = issue.path[0] as keyof PhoneSignIn
          if (path && !errors[path]) {
            errors[path] = issue.message
          }
        }
        setFieldErrors(errors)
        return
      }

      setIsLoading(true)

      const result = await authService.signIn(validation.data)

      setIsLoading(false)

      if (!result.success) {
        const nextFailed = failedAttempts + 1
        setFailedAttempts(nextFailed)

        if (nextFailed >= MAX_ATTEMPTS) {
          setLockoutSecondsRemaining(LOCKOUT_DURATION_SECONDS)
          setGeneralError('Account temporarily locked after 5 failed attempts. Please retry in 15 minutes.')
        } else {
          const remaining = MAX_ATTEMPTS - nextFailed
          setGeneralError(`${result.error} (${remaining} attempts remaining before 15m lockout)`)
        }
        return
      }

      setFailedAttempts(0)
      await refetch()

      const user = (result.data as { user?: AuthUser } | undefined)?.user
      const targetPath = getDashboardPath(user?.role)
      router.push(targetPath)
    },
    [formData, lockoutSecondsRemaining, failedAttempts, refetch, router]
  )

  const isLockedOut = lockoutSecondsRemaining > 0
  const lockoutMinutesRemaining = Math.ceil(lockoutSecondsRemaining / 60)

  return {
    formData,
    fieldErrors,
    generalError,
    isLoading,
    isLockedOut,
    lockoutMinutesRemaining,
    setField,
    handleSubmit,
  }
}
