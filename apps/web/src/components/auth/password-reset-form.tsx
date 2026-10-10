import React from 'react'
import Link from 'next/link'
import { Card, CardHeader } from '../ui/card'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Notice } from '../ui/notice'

export interface PasswordResetFormProps {
  step: 'request' | 'confirm'
  phoneNumber: string
  code: string
  newPassword: string
  confirmPassword: string
  fieldErrors: Record<string, string>
  generalError: string | null
  isLoading: boolean
  isSuccess: boolean
  onPhoneChange: (val: string) => void
  onCodeChange: (val: string) => void
  onNewPasswordChange: (val: string) => void
  onConfirmPasswordChange: (val: string) => void
  onRequestOtp: (e: React.FormEvent) => void
  onConfirmReset: (e: React.FormEvent) => void
  onBackToRequest: () => void
}

export function PasswordResetForm({
  step,
  phoneNumber,
  code,
  newPassword,
  confirmPassword,
  fieldErrors,
  generalError,
  isLoading,
  isSuccess,
  onPhoneChange,
  onCodeChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onRequestOtp,
  onConfirmReset,
  onBackToRequest,
}: PasswordResetFormProps) {
  return (
    <Card className="w-full max-w-md mx-auto shadow-none">
      <CardHeader
        title="Credential Recovery"
        subtitle={
          step === 'request'
            ? 'Dispatch emergency password recovery code via SMS'
            : `Set new access key for ${phoneNumber}`
        }
        badge="[RECOVERY-SYS]"
      />

      {isSuccess && (
        <div className="mb-5">
          <Notice variant="success" title="Access Key Updated">
            Password has been reset successfully. Existing device sessions revoked. Redirecting to sign in...
          </Notice>
        </div>
      )}

      {generalError && (
        <div className="mb-5">
          <Notice variant="danger">{generalError}</Notice>
        </div>
      )}

      {step === 'request' && !isSuccess && (
        <form onSubmit={onRequestOtp} className="space-y-4">
          <Input
            label="Registered Phone Number"
            type="tel"
            placeholder="+251 91 123 4567"
            value={phoneNumber}
            error={fieldErrors.phoneNumber}
            badge="[ET-TELECOM]"
            disabled={isLoading}
            onChange={(e) => onPhoneChange(e.target.value)}
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
            >
              Dispatch Recovery OTP →
            </Button>
          </div>
        </form>
      )}

      {step === 'confirm' && !isSuccess && (
        <form onSubmit={onConfirmReset} className="space-y-4">
          <Input
            label="6-Digit SMS Recovery Code"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="123456"
            value={code}
            error={fieldErrors.code}
            badge="[CODE-SEC]"
            disabled={isLoading}
            onChange={(e) => onCodeChange(e.target.value)}
          />

          <Input
            label="New Access Password"
            type="password"
            placeholder="Minimum 10 characters"
            value={newPassword}
            error={fieldErrors.newPassword}
            hint="Uppercase, lowercase, and number required"
            badge="[NEW-KEY]"
            disabled={isLoading}
            onChange={(e) => onNewPasswordChange(e.target.value)}
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Repeat new password"
            value={confirmPassword}
            error={fieldErrors.confirmPassword}
            badge="[MATCH-CHK]"
            disabled={isLoading}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
          />

          <div className="pt-2 space-y-2">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
            >
              Reset Key & Revoke Sessions →
            </Button>

            <Button
              type="button"
              variant="outline"
              fullWidth
              disabled={isLoading}
              onClick={onBackToRequest}
            >
              ← Use Different Phone Number
            </Button>
          </div>
        </form>
      )}

      <div className="mt-6 pt-5 border-t-[1px] border-border text-center text-xs text-text-muted">
        <Link href="/sign-in" className="font-semibold text-primary hover:underline">
          Return to Terminal Sign-In →
        </Link>
      </div>
    </Card>
  )
}
