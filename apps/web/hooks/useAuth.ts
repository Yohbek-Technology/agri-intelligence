'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  PhoneSignInSchema,
  PhoneSignUpSchema,
  PhoneOtpRequestSchema,
  PhoneOtpVerifySchema,
  PasswordResetRequestSchema,
  PasswordResetConfirmSchema,
  PhoneUtils,
  type UserRole,
  type AppLanguage,
  type PhoneSignIn,
  type PhoneSignUp,
  type PhoneOtpVerify,
  type AuthUser,
} from '@repo/shared'
import { authService } from '@/services/authService'
import { useAuth } from '@/providers/authProvider'

const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION_SECONDS = 15 * 60
const DRAFT_STORAGE_KEY = 'agri_reg_draft'

export function getDashboardPath(role: UserRole | string | null | undefined): string {
  switch (role) {
    case 'farmer':
      return '/farmer'
    case 'da':
      return '/da'
    case 'officer':
    case 'system_admin':
      return '/officer'
    default:
      return '/farmer'
  }
}

export function useAuthSession() {
  const router = useRouter()
  const { user, session, role, isAuthenticated, isLoading, signOut, refetch } = useAuth()

  const handleSignOut = useCallback(async () => {
    await signOut()
    router.push('/signIn')
  }, [signOut, router])

  const navigateToDashboard = useCallback(() => {
    if (role) {
      router.push(getDashboardPath(role))
    }
  }, [role, router])

  return {
    user,
    session,
    role,
    isAuthenticated,
    isLoading,
    dashboardPath: getDashboardPath(role),
    signOut: handleSignOut,
    refetch,
    navigateToDashboard,
  }
}

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
      setLockoutSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [lockoutSecondsRemaining])

  const setField = useCallback(
    (field: keyof PhoneSignIn, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
      setGeneralError(null)
    },
    []
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (lockoutSecondsRemaining > 0) {
        const mins = Math.ceil(lockoutSecondsRemaining / 60)
        setGeneralError(`Security Lockout active. Please wait ${mins} minute(s) before retrying.`)
        return
      }

      const parseResult = PhoneSignInSchema.safeParse(formData)
      if (!parseResult.success) {
        const errors: Partial<Record<keyof PhoneSignIn, string>> = {}
        for (const issue of parseResult.error.issues) {
          const path = issue.path[0] as keyof PhoneSignIn
          if (path && !errors[path]) {
            errors[path] = issue.message
          }
        }
        setFieldErrors(errors)
        return
      }

      setIsLoading(true)
      setGeneralError(null)

      const result = await authService.signIn(parseResult.data)
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

export function useSignUpForm() {
  const router = useRouter()

  const [formData, setFormData] = useState<PhoneSignUp>({
    phoneNumber: '',
    password: '',
    name: '',
    preferredLanguage: 'am',
  })
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof PhoneSignUp, string>>>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const setField = useCallback(
    (field: keyof PhoneSignUp, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
      setGeneralError(null)
    },
    []
  )

  const setLanguage = useCallback((lang: AppLanguage) => {
    setFormData((prev) => ({ ...prev, preferredLanguage: lang }))
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      const parseResult = PhoneSignUpSchema.safeParse(formData)
      if (!parseResult.success) {
        const errors: Partial<Record<keyof PhoneSignUp, string>> = {}
        for (const issue of parseResult.error.issues) {
          const path = issue.path[0] as keyof PhoneSignUp
          if (path && !errors[path]) {
            errors[path] = issue.message
          }
        }
        setFieldErrors(errors)
        return
      }

      setIsLoading(true)
      setGeneralError(null)

      const result = await authService.requestOtp({
        phoneNumber: parseResult.data.phoneNumber,
      })

      setIsLoading(false)

      if (!result.success) {
        setGeneralError(result.error || 'Failed to dispatch verification SMS. Please verify your phone number.')
        return
      }

      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(parseResult.data))
      }

      const encodedPhone = encodeURIComponent(PhoneUtils.normalize(parseResult.data.phoneNumber))
      router.push(`/verifyOtp?phone=${encodedPhone}`)
    },
    [formData, router]
  )

  return {
    formData,
    fieldErrors,
    generalError,
    isLoading,
    setField,
    setLanguage,
    handleSubmit,
  }
}

export function useOtpVerification() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refetch } = useAuth()

  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [error, setError] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState<boolean>(false)

  const [registrationDraft] = useState<PhoneSignUp | null>(() => {
    if (typeof window === 'undefined') return null
    const stored = window.sessionStorage.getItem(DRAFT_STORAGE_KEY)
    if (!stored) return null
    try {
      return JSON.parse(stored) as PhoneSignUp
    } catch {
      return null
    }
  })

  const [phoneNumber] = useState<string>(() => {
    const queryPhone = searchParams.get('phone') || ''
    if (typeof window === 'undefined') return queryPhone
    const stored = window.sessionStorage.getItem(DRAFT_STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as PhoneSignUp
        return parsed.phoneNumber || queryPhone
      } catch {
        return queryPhone
      }
    }
    return queryPhone
  })

  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  const setDigit = useCallback((index: number, val: string) => {
    const cleaned = val.replace(/[^0-9]/g, '')
    if (!cleaned && val !== '') return

    setDigits((prev) => {
      const next = [...prev]
      next[index] = cleaned.slice(-1)
      return next
    })
    setError(null)

    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }, [])

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
    },
    [digits]
  )

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain').replace(/[^0-9]/g, '')
    if (!text) return

    const chars = text.slice(0, 6).split('')
    setDigits((prev) => {
      const next = [...prev]
      chars.forEach((c, i) => {
        if (i < 6) next[i] = c
      })
      return next
    })
    setError(null)

    const nextIndex = Math.min(chars.length, 5)
    inputRefs.current[nextIndex]?.focus()
  }, [])

  const code = digits.join('')
  const isComplete = code.length === 6

  const handleVerify = useCallback(async () => {
    if (!isComplete) {
      setError('Please provide all 6 digits of the verification code.')
      return
    }

    if (!phoneNumber) {
      setError('Phone number is missing. Please restart registration.')
      return
    }

    setIsVerifying(true)
    setError(null)

    const payload: PhoneOtpVerify = {
      phoneNumber,
      code,
      password: registrationDraft?.password || '',
      name: registrationDraft?.name || '',
      preferredLanguage: registrationDraft?.preferredLanguage || 'am',
    }

    const validation = PhoneOtpVerifySchema.safeParse(payload)
    if (!validation.success) {
      setIsVerifying(false)
      setError(validation.error.issues[0]?.message || 'Verification payload invalid.')
      return
    }

    const result = await authService.verifyOtpAndSignUp(validation.data)
    setIsVerifying(false)

    if (!result.success) {
      setError(result.error || 'Verification failed. Please retry.')
      return
    }

    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(DRAFT_STORAGE_KEY)
    }

    await refetch()

    const user = (result.data as { user?: AuthUser } | undefined)?.user
    const targetPath = getDashboardPath(user?.role)
    router.push(targetPath)
  }, [code, isComplete, phoneNumber, registrationDraft, refetch, router])

  const setInputRef = useCallback((el: HTMLInputElement | null, idx: number) => {
    inputRefs.current[idx] = el
  }, [])

  return {
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
  }
}

export function useResendCountdown(initialSeconds = 600) {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(initialSeconds)
  const [isResending, setIsResending] = useState<boolean>(false)
  const [resendStatus, setResendStatus] = useState<string | null>(null)

  useEffect(() => {
    if (secondsRemaining <= 0) return
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [secondsRemaining])

  const minutes = Math.floor(secondsRemaining / 60)
  const seconds = secondsRemaining % 60
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  const canResend = secondsRemaining === 0

  const handleResend = useCallback(
    async (phoneNumber: string) => {
      if (!canResend || !phoneNumber) return

      const parseResult = PhoneOtpRequestSchema.safeParse({ phoneNumber })
      if (!parseResult.success) {
        setResendStatus(parseResult.error.issues[0]?.message || 'Invalid phone format.')
        return
      }

      setIsResending(true)
      setResendStatus(null)

      const result = await authService.requestOtp(parseResult.data)
      setIsResending(false)

      if (result.success) {
        setSecondsRemaining(initialSeconds)
        setResendStatus('New 6-digit verification code sent successfully via SMS.')
      } else {
        setResendStatus(result.error || 'Failed to dispatch verification code.')
      }
    },
    [canResend, initialSeconds]
  )

  return {
    secondsRemaining,
    formattedTime,
    canResend,
    isResending,
    resendStatus,
    handleResend,
  }
}

export function usePasswordReset() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [step, setStep] = useState<'request' | 'confirm'>('request')
  const [phoneNumber, setPhoneNumber] = useState<string>(() => searchParams.get('phone') || '')
  const [code, setCode] = useState<string>('')
  const [newPassword, setNewPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleRequestSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      const parseResult = PasswordResetRequestSchema.safeParse({ phoneNumber })
      if (!parseResult.success) {
        setFieldErrors({ phoneNumber: parseResult.error.issues[0]?.message || 'Invalid phone number.' })
        return
      }

      setIsLoading(true)
      setGeneralError(null)
      setFieldErrors({})

      const result = await authService.requestPasswordReset(parseResult.data)
      setIsLoading(false)

      if (!result.success) {
        setGeneralError(result.error || 'Failed to send recovery code. Ensure the number is registered.')
        return
      }

      setSuccessMessage('Recovery code dispatched via SMS. Enter code and new password.')
      setStep('confirm')
    },
    [phoneNumber]
  )

  const handleConfirmSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (newPassword !== confirmPassword) {
        setFieldErrors({ confirmPassword: 'Passwords do not match.' })
        return
      }

      const parseResult = PasswordResetConfirmSchema.safeParse({
        phoneNumber,
        code,
        newPassword,
      })

      if (!parseResult.success) {
        const errors: Record<string, string> = {}
        for (const issue of parseResult.error.issues) {
          const path = String(issue.path[0])
          if (!errors[path]) errors[path] = issue.message
        }
        setFieldErrors(errors)
        return
      }

      setIsLoading(true)
      setGeneralError(null)
      setFieldErrors({})

      const result = await authService.resetPassword(parseResult.data)
      setIsLoading(false)

      if (!result.success) {
        setGeneralError(result.error || 'Password reset failed. Verify your code and retry.')
        return
      }

      setSuccessMessage('Password reset successfully! Active sessions revoked. Redirecting to sign in...')
      setTimeout(() => {
        router.push('/signIn')
      }, 1500)
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
    successMessage,
    isLoading,
    setPhoneNumber,
    setCode,
    setNewPassword,
    setConfirmPassword,
    setStep,
    handleRequestSubmit,
    handleConfirmSubmit,
  }
}

export function useRoleGuard(allowedRoles: UserRole[]) {
  const router = useRouter()
  const { user, role, isAuthenticated, isLoading } = useAuth()

  const isRolePermitted = Boolean(role && allowedRoles.includes(role))

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.replace('/signIn')
      return
    }

    if (role && !allowedRoles.includes(role)) {
      router.replace(getDashboardPath(role))
    }
  }, [isLoading, isAuthenticated, role, allowedRoles, router])

  return {
    isAuthorized: isRolePermitted,
    isLoading,
    user,
    role,
  }
}
