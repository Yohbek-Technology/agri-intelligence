'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { X, ArrowLeft, ShieldCheck, RefreshCw } from 'lucide-react'
import { PhoneUtils } from '@repo/shared'
import type {
  KebeleRow,
  StaffRow,
  CreateStaffInput,
  UpdateStaffInput,
} from '@repo/shared'
import { useStaffForm } from '@/hooks/useKebeles'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Notice } from '@/components/ui/notice'

const UI_BORDER = '2px solid var(--color-border-ui)'

type DrawerMode = 'create' | 'edit'

interface StaffDrawerProps {
  mode: DrawerMode
  initial?: StaffRow | null
  kebeles: KebeleRow[]
  onClose: () => void
  onSubmit: (data: CreateStaffInput | UpdateStaffInput) => Promise<void>
  isSubmitting: boolean
  error?: string | null
}

export function StaffDrawer({
  mode,
  initial,
  kebeles,
  onClose,
  onSubmit,
  isSubmitting,
  error,
}: StaffDrawerProps) {
  const t = useTranslations('OfficerPages')

  const {
    step,
    setStep,
    name,
    username,
    phone,
    role,
    lang,
    password,
    assignedIds,
    otpCode,
    isSendingOtp,
    resendCooldown,
    validationError,
    fieldErrors,
    usernameChecking,
    usernameAvailable,
    phoneChecking,
    phoneAvailable,
    setRole,
    setLang,
    setOtpCode,
    setAssignedIds,
    handleNameChange,
    handlePasswordChange,
    handleUsernameChange,
    handlePhoneChange,
    handleRequestOtp,
    handleFinalSubmit,
  } = useStaffForm({ mode, initial, kebeles, onSubmit })

  const displayError = error ?? validationError

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-end"
        aria-modal="true"
        role="dialog"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="fixed inset-0 bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Panel */}
        <motion.aside
          className="relative z-10 w-full max-w-lg bg-surface h-full shadow-lg flex flex-col"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        >
          {/* Header */}
          <header className="flex items-center justify-between px-6 py-5" style={{ borderBottom: UI_BORDER }}>
            <div className="flex items-center gap-3">
              {step === 'verify_otp' && (
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-subtle transition-colors cursor-pointer"
                  title="Back to details"
                >
                  <ArrowLeft size={16} />
                </button>
              )}
              <h2 className="text-base font-bold text-text-primary">
                {mode === 'edit'
                  ? t('staff_drawer_edit')
                  : step === 'verify_otp'
                  ? 'Verify Staff Phone'
                  : t('staff_drawer_add')}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-subtle transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </header>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            <AnimatePresence>
              {displayError && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <Notice type="error" message={displayError} />
                </motion.div>
              )}
            </AnimatePresence>

            {step === 'details' ? (
              <div className="space-y-4">
                <Input
                  label={t('staff_full_name')}
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Abebe Kebede"
                  error={fieldErrors.name}
                />

                {/* Username with live check */}
                {mode === 'create' && (
                  <Input
                    label="Username"
                    value={username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    placeholder="abebe_kebede"
                    hint={
                      usernameChecking
                        ? 'Checking availability…'
                        : usernameAvailable === true && !fieldErrors.username
                        ? '✓ Username is available'
                        : 'Lowercase letters, numbers, and underscores only'
                    }
                    error={fieldErrors.username}
                    success={usernameAvailable === true && !fieldErrors.username}
                    autoCapitalize="none"
                  />
                )}

                {/* Phone input with 09 and +251 support and live check */}
                <div className="space-y-1.5">
                  <Input
                    label={t('staff_phone')}
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="0911223344 or +251911223344"
                    type="tel"
                    hint={
                      phoneChecking
                        ? 'Verifying phone…'
                        : phoneAvailable === true && !fieldErrors.phone
                        ? '✓ Phone number is valid & available'
                        : 'Accepts 09... or +251... format'
                    }
                    error={fieldErrors.phone}
                    success={phoneAvailable === true && !fieldErrors.phone}
                  />
                  {mode === 'create' && (
                    <p className="text-xs text-text-faint font-mono">
                      ℹ A 6-digit SMS OTP code will be dispatched to verify this phone number before registration.
                    </p>
                  )}
                </div>

                <Select
                  label={t('staff_role')}
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'da' | 'officer')}
                  options={[
                    { value: 'da', label: t('staff_role_da') },
                    { value: 'officer', label: t('staff_role_officer') },
                  ]}
                />

                <Select
                  label={t('staff_language')}
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  options={[
                    { value: 'am', label: t('staff_lang_am') },
                    { value: 'om', label: t('staff_lang_om') },
                    { value: 'en', label: t('staff_lang_en') },
                  ]}
                />

                {mode === 'create' && (
                  <Input
                    label={t('staff_password')}
                    type="password"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    hint={t('staff_password_hint')}
                    placeholder="••••••••••"
                    error={fieldErrors.password}
                  />
                )}

                {/* Assigned kebele */}
                <AnimatePresence>
                  {role === 'da' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <Select
                        label={t('staff_assigned_kebeles')}
                        value={assignedIds[0] ?? ''}
                        onChange={(e) => {
                          const val = e.target.value
                          setAssignedIds(val ? [val] : [])
                        }}
                        options={[
                          { value: '', label: kebeles.length === 0 ? 'No kebeles available' : 'Select kebele...' },
                          ...kebeles.map((k) => ({ value: k.id, label: k.name })),
                        ]}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* Step 2: OTP Verification */
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="p-4 rounded-2xl bg-surface-subtle flex items-start gap-3.5" style={{ border: UI_BORDER }}>
                  <ShieldCheck size={28} className="text-primary shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-text-primary">
                      SMS Verification Code Sent
                    </p>
                    <p className="text-xs text-text-muted">
                      We sent a 6-digit confirmation code to{' '}
                      <span className="font-mono font-semibold text-text-primary">
                        {PhoneUtils.normalize(phone.trim())}
                      </span>
                      . Please enter the code below to complete registration.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider font-mono">
                    6-Digit SMS Code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="••••••"
                    className="w-full text-center text-2xl tracking-[0.4em] font-mono py-3 rounded-xl bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    style={{ border: UI_BORDER }}
                    autoFocus
                  />
                  <p className="text-xs text-text-faint font-mono text-center">
                    Enter the code received on the staff member&apos;s phone
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('details')}
                    className="text-xs font-medium text-text-muted hover:text-text-primary cursor-pointer flex items-center gap-1.5"
                  >
                    <ArrowLeft size={14} /> Back to edit info
                  </button>

                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    disabled={resendCooldown > 0 || isSendingOtp}
                    className="text-xs font-medium text-primary hover:underline cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:no-underline"
                  >
                    <RefreshCw size={12} className={isSendingOtp ? 'animate-spin' : ''} />
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <footer className="px-6 py-5 flex gap-3 justify-end" style={{ borderTop: UI_BORDER }}>
            <Button variant="secondary" onClick={onClose} disabled={isSubmitting || isSendingOtp}>
              {t('cancel')}
            </Button>

            {mode === 'edit' ? (
              <Button variant="primary" onClick={handleFinalSubmit} isLoading={isSubmitting}>
                {t('save')}
              </Button>
            ) : step === 'details' ? (
              <Button
                variant="primary"
                onClick={handleRequestOtp}
                isLoading={isSendingOtp}
                disabled={usernameChecking || phoneChecking}
              >
                Send Verification Code
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleFinalSubmit}
                isLoading={isSubmitting}
                disabled={otpCode.length !== 6}
              >
                Verify & Register Staff
              </Button>
            )}
          </footer>
        </motion.aside>
      </motion.div>
    </AnimatePresence>
  )
}
