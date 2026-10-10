'use client'

import React from 'react'
import { useSignUpForm } from '../../../src/hooks/use-sign-up-form'
import { SignUpForm } from '../../../src/components/auth/sign-up-form'

export default function SignUpPage() {
  const {
    formData,
    fieldErrors,
    generalError,
    isLoading,
    setField,
    handleSubmit,
  } = useSignUpForm()

  return (
    <SignUpForm
      formData={formData}
      fieldErrors={fieldErrors}
      generalError={generalError}
      isLoading={isLoading}
      onFieldChange={setField}
      onSubmit={handleSubmit}
    />
  )
}
