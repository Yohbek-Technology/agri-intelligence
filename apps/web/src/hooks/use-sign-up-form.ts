'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { PhoneSignUpSchema, PhoneUtils, type PhoneSignUp } from '@repo/shared'
import { authService } from '../lib/auth-service'

const DRAFT_STORAGE_KEY = 'agri_reg_draft'

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

  const setField = useCallback((field: keyof PhoneSignUp, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
    setGeneralError(null)
  }, [])

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault()

      setFieldErrors({})
      setGeneralError(null)

      const validation = PhoneSignUpSchema.safeParse(formData)
      if (!validation.success) {
        const errors: Partial<Record<keyof PhoneSignUp, string>> = {}
        for (const issue of validation.error.issues) {
          const path = issue.path[0] as keyof PhoneSignUp
          if (path && !errors[path]) {
            errors[path] = issue.message
          }
        }
        setFieldErrors(errors)
        return
      }

      setIsLoading(true)

      const normalized = PhoneUtils.normalize(validation.data.phoneNumber)

      const otpResult = await authService.requestOtp({ phoneNumber: normalized })

      setIsLoading(false)

      if (!otpResult.success) {
        setGeneralError(otpResult.error || 'Failed to dispatch verification code.')
        return
      }

      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(
          DRAFT_STORAGE_KEY,
          JSON.stringify({
            phoneNumber: normalized,
            password: validation.data.password,
            name: validation.data.name,
            preferredLanguage: validation.data.preferredLanguage,
          })
        )
      }

      router.push(`/verify-otp?phone=${encodeURIComponent(normalized)}`)
    },
    [formData, router]
  )

  return {
    formData,
    fieldErrors,
    generalError,
    isLoading,
    setField,
    handleSubmit,
  }
}
