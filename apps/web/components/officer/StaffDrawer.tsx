'use client'

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { X, Search, Check, ArrowLeft, ShieldCheck, RefreshCw } from 'lucide-react'
import { createStaffSchema, updateStaffSchema, PhoneUtils } from '@repo/shared'
import type {
  KebeleRow,
  StaffRow,
  CreateStaffInput,
  UpdateStaffInput,
} from '@repo/shared'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Notice } from '@/components/ui/notice'
import { authService } from '@/services/authService'

const UI_BORDER = '2px solid var(--color-border-ui)'
const ETHIOPIAN_PHONE_REGEX = /^(?:\+251|251|0)[79][0-9]{8}$/
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/

type DrawerMode = 'create' | 'edit'
type Step = 'details' | 'verify_otp'

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

  // Steps
  const [step, setStep] = useState<Step>('details')

  // Form fields
  const [name, setName] = useState(initial?.name ?? '')
  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState(initial?.phoneNumber ?? '')
  const [role, setRole] = useState<'da' | 'officer'>(initial?.role ?? 'da')
  const [lang, setLang] = useState(initial?.preferredLanguage ?? 'am')
  const [password, setPassword] = useState('')
  const [assignedIds, setAssignedIds] = useState<string[]>(initial?.assignedKebeleIds ?? [])
  const [kebeleSearch, setKebeleSearch] = useState('')

  // OTP Verification state
  const [otpCode, setOtpCode] = useState('')
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  // Validation & Live checks
  const [validationError, setValidationError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [usernameChecking, setUsernameChecking] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [phoneChecking, setPhoneChecking] = useState(false)
  const [phoneAvailable, setPhoneAvailable] = useState<boolean | null>(null)

  const usernameDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const phoneDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown((p) => (p <= 1 ? 0 : p - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  // Filter kebeles by search
  const filteredKebeles = useMemo(
    () => kebeles.filter((k) => k.name.toLowerCase().includes(kebeleSearch.toLowerCase())),
    [kebeles, kebeleSearch],
  )

  const toggleKebele = useCallback((id: string) => {
    setAssignedIds((prev) =>
      prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id],
    )
  }, [])

  // Live username availability check
  const handleUsernameChange = useCallback((val: string) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9_]/g, '')
    setUsername(clean)
    setUsernameAvailable(null)

    if (fieldErrors.username) {
      setFieldErrors((p) => ({ ...p, username: '' }))
    }

    if (!clean) return

    if (!USERNAME_REGEX.test(clean)) {
      setFieldErrors((p) => ({
        ...p,
        username: 'Username must be 3-30 characters with letters, numbers, or underscores.',
      }))
      if (usernameDebounceRef.current) clearTimeout(usernameDebounceRef.current)
      return
    }

    if (usernameDebounceRef.current) clearTimeout(usernameDebounceRef.current)
    usernameDebounceRef.current = setTimeout(async () => {
      setUsernameChecking(true)
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000'}/api/auth/is-username-available`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: clean }),
          }
        )
        const data = (await res.json()) as { available?: boolean }
        const avail = data?.available ?? false
        setUsernameAvailable(avail)
        if (!avail) {
          setFieldErrors((p) => ({ ...p, username: 'Username is already taken.' }))
        } else {
          setFieldErrors((p) => ({ ...p, username: '' }))
        }
      } catch {
        setUsernameAvailable(null)
      } finally {
        setUsernameChecking(false)
      }
    }, 350)
  }, [fieldErrors.username])

  // Live phone check & normalization
  const handlePhoneChange = useCallback((val: string) => {
    setPhone(val)
    setPhoneAvailable(null)

    if (fieldErrors.phone) {
      setFieldErrors((p) => ({ ...p, phone: '' }))
    }

    const clean = val.trim()
    if (!clean) return

    if (!ETHIOPIAN_PHONE_REGEX.test(clean)) {
      setFieldErrors((p) => ({
        ...p,
        phone: 'Enter a valid Ethiopian phone number (e.g. 0911223344 or +251911223344).',
      }))
      if (phoneDebounceRef.current) clearTimeout(phoneDebounceRef.current)
      return
    }

    const normalized = PhoneUtils.normalize(clean)

    if (phoneDebounceRef.current) clearTimeout(phoneDebounceRef.current)
    phoneDebounceRef.current = setTimeout(async () => {
      setPhoneChecking(true)
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000'}/api/v1/auth/check-phone?phone=${encodeURIComponent(normalized)}`
        )
        const data = (await res.json()) as { exists?: boolean }
        if (data.exists) {
          setPhoneAvailable(false)
          setFieldErrors((p) => ({ ...p, phone: 'This phone number is already registered in the system.' }))
        } else {
          setPhoneAvailable(true)
          setFieldErrors((p) => ({ ...p, phone: '' }))
        }
      } catch {
        setPhoneAvailable(null)
      } finally {
        setPhoneChecking(false)
      }
    }, 350)
  }, [fieldErrors.phone])

  // Dispatch SMS OTP
  const handleRequestOtp = useCallback(async () => {
    setValidationError(null)
    const errs: Record<string, string> = {}

    if (!name.trim() || name.trim().length < 2) {
      errs.name = 'Full name must be at least 2 characters.'
    }

    if (mode === 'create') {
      if (!username.trim() || !USERNAME_REGEX.test(username)) {
        errs.username = 'Valid username is required (3-30 letters, numbers, or underscores).'
      } else if (usernameAvailable === false) {
        errs.username = 'Username is already taken.'
      }

      if (!password || password.length < 10) {
        errs.password = 'Temporary password must be at least 10 characters.'
      }
    }

    const cleanPhone = phone.trim()
    if (!cleanPhone || !ETHIOPIAN_PHONE_REGEX.test(cleanPhone)) {
      errs.phone = 'Valid Ethiopian phone number is required (+2519... or 09...).'
    } else if (phoneAvailable === false) {
      errs.phone = 'This phone number is already registered.'
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs)
      setValidationError('Please fix the highlighted errors before proceeding.')
      return
    }

    const normalizedPhone = PhoneUtils.normalize(cleanPhone)

    // Request OTP via auth service
    setIsSendingOtp(true)
    try {
      const res = await authService.requestOtp({ phoneNumber: normalizedPhone })
      if (!res.success) {
        setValidationError(res.error || 'Failed to dispatch verification SMS. Please check the phone number.')
        return
      }

      setStep('verify_otp')
      setResendCooldown(60)
      setOtpCode('')
    } catch (err: any) {
      setValidationError(err?.message || 'Error sending SMS OTP.')
    } finally {
      setIsSendingOtp(false)
    }
  }, [name, username, usernameAvailable, password, phone, phoneAvailable, mode])

  // Final submit
  const handleFinalSubmit = useCallback(async () => {
    setValidationError(null)
    const cleanPhone = phone.trim()
    const normalizedPhone = PhoneUtils.normalize(cleanPhone)

    if (mode === 'create') {
      if (!otpCode || !/^[0-9]{6}$/.test(otpCode)) {
        setValidationError('Please enter the 6-digit SMS verification code.')
        return
      }

      const payload: CreateStaffInput = {
        name: name.trim(),
        username: username.toLowerCase().trim(),
        phoneNumber: normalizedPhone,
        otpCode,
        role,
        preferredLanguage: lang as any,
        assignedKebeleIds: role === 'da' ? assignedIds : [],
        password,
      }

      const parsed = createStaffSchema.safeParse(payload)
      if (!parsed.success) {
        setValidationError(parsed.error.issues[0]?.message ?? 'Validation failed')
        return
      }

      await onSubmit(parsed.data)
    } else {
      // Edit mode: directly submit update
      const payload: UpdateStaffInput = {
        name: name.trim() || undefined,
        phoneNumber: cleanPhone ? normalizedPhone : undefined,
        role,
        preferredLanguage: lang as any,
        assignedKebeleIds: role === 'da' ? assignedIds : [],
      }

      const parsed = updateStaffSchema.safeParse(payload)
      if (!parsed.success) {
        setValidationError(parsed.error.issues[0]?.message ?? 'Validation failed')
        return
      }

      await onSubmit(parsed.data)
    }
  }, [name, username, phone, otpCode, role, lang, assignedIds, password, mode, onSubmit])

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
                  onChange={(e) => {
                    setName(e.target.value)
                    if (fieldErrors.name) setFieldErrors((p) => ({ ...p, name: '' }))
                  }}
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
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: '' }))
                    }}
                    hint={t('staff_password_hint')}
                    placeholder="••••••••••"
                    error={fieldErrors.password}
                  />
                )}

                {/* Assigned kebeles */}
                <AnimatePresence>
                  {role === 'da' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2 overflow-hidden"
                    >
                      <p className="text-xs font-semibold text-text-primary uppercase tracking-wider font-mono">
                        {t('staff_assigned_kebeles')}
                      </p>

                      {/* Selected kebeles chips */}
                      {assignedIds.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {assignedIds.map((id) => {
                            const keb = kebeles.find((k) => k.id === id)
                            if (!keb) return null
                            return (
                              <motion.span
                                key={id}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-primary-light text-primary cursor-pointer hover:bg-danger-light hover:text-danger transition-colors"
                                style={{ border: UI_BORDER }}
                                onClick={() => toggleKebele(id)}
                                title="Click to remove"
                              >
                                {keb.name}
                                <X size={10} />
                              </motion.span>
                            )
                          })}
                        </div>
                      )}

                      {/* Search input */}
                      <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Search kebeles…"
                          value={kebeleSearch}
                          onChange={(e) => setKebeleSearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                          style={{ border: UI_BORDER }}
                        />
                      </div>

                      {/* Kebele list */}
                      {kebeles.length > 0 ? (
                        <div
                          className="max-h-48 overflow-y-auto rounded-xl"
                          style={{ border: UI_BORDER }}
                        >
                          {filteredKebeles.length === 0 ? (
                            <p className="text-xs text-text-faint text-center py-6">No kebeles match your search</p>
                          ) : (
                            filteredKebeles.map((k, i) => {
                              const selected = assignedIds.includes(k.id)
                              return (
                                <button
                                  key={k.id}
                                  type="button"
                                  onClick={() => toggleKebele(k.id)}
                                  className={[
                                    'w-full flex items-center justify-between px-3 py-2.5 text-sm transition-colors cursor-pointer text-left',
                                    selected ? 'bg-primary-light text-primary' : 'hover:bg-surface-subtle text-text-primary',
                                  ].join(' ')}
                                  style={i < filteredKebeles.length - 1 ? { borderBottom: UI_BORDER } : {}}
                                >
                                  <span>{k.name}</span>
                                  {selected && <Check size={14} className="shrink-0" />}
                                </button>
                              )
                            })
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-text-faint font-mono">No kebeles defined yet. Add kebeles first.</p>
                      )}
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
