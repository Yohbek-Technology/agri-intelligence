'use client'

import React from 'react'
import { usePasswordReset } from '../../../src/hooks/use-password-reset'
import { PasswordResetForm } from '../../../src/components/auth/password-reset-form'

export default function ForgotPasswordPage() {
  const {
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
  } = usePasswordReset()

  return (
    <PasswordResetForm
      step={step}
      phoneNumber={phoneNumber}
      code={code}
      newPassword={newPassword}
      confirmPassword={confirmPassword}
      fieldErrors={fieldErrors}
      generalError={generalError}
      isLoading={isLoading}
      isSuccess={isSuccess}
      onPhoneChange={setPhoneNumber}
      onCodeChange={setCode}
      onNewPasswordChange={setNewPassword}
      onConfirmPasswordChange={setConfirmPassword}
      onRequestOtp={handleRequestOtp}
      onConfirmReset={handleConfirmReset}
      onBackToRequest={() => setStep('request')}
    />
  )
}
