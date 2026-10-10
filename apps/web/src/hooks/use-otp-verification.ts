'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PhoneOtpVerifySchema, PhoneUtils, type PhoneSignUp, type AuthUser } from '@repo/shared'
import { authService } from '../lib/auth-service'
import { useAuth } from '../providers/auth-provider'
import { getDashboardPath } from './use-auth-session'

const DRAFT_STORAGE_KEY = 'agri_reg_draft'

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
      } else if (e.key === 'ArrowLeft' && index > 0) {
        inputRefs.current[index - 1]?.focus()
      } else if (e.key === 'ArrowRight' && index < 5) {
        inputRefs.current[index + 1]?.focus()
      }
    },
    [digits]
  )

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6)
    if (!pasted) return

    const newDigits = ['', '', '', '', '', '']
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i]!
    }
    setDigits(newDigits)
    setError(null)

    const nextFocus = Math.min(pasted.length, 5)
    inputRefs.current[nextFocus]?.focus()
  }, [])

  const code = digits.join('')
  const isComplete = code.length === 6

  const handleVerify = useCallback(async () => {
    if (!isComplete) {
      setError('Please enter all 6 digits of the verification code.')
      return
    }

    if (!phoneNumber) {
      setError('Phone number is missing. Please restart registration.')
      return
    }

    setError(null)
    setIsVerifying(true)

    const payload = {
      phoneNumber: PhoneUtils.normalize(phoneNumber),
      code,
      password: registrationDraft?.password,
      name: registrationDraft?.name,
      preferredLanguage: registrationDraft?.preferredLanguage,
    }

    const validation = PhoneOtpVerifySchema.safeParse(payload)
    if (!validation.success) {
      setError(validation.error.issues[0]?.message || 'Invalid verification submission.')
      setIsVerifying(false)
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
