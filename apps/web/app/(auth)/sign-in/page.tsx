'use client'

import React from 'react'
import { useSignInForm } from '../../../src/hooks/use-sign-in-form'
import { SignInForm } from '../../../src/components/auth/sign-in-form'

export default function SignInPage() {
  const {
    formData,
    fieldErrors,
    generalError,
    isLoading,
    isLockedOut,
    lockoutMinutesRemaining,
    setField,
    handleSubmit,
  } = useSignInForm()

  return (
    <SignInForm
      formData={formData}
      fieldErrors={fieldErrors}
      generalError={generalError}
      isLoading={isLoading}
      isLockedOut={isLockedOut}
      lockoutMinutesRemaining={lockoutMinutesRemaining}
      onFieldChange={setField}
      onSubmit={handleSubmit}
    />
  )
}
