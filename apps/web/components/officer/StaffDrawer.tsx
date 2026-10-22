'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { X, Search, Check } from 'lucide-react'
import { createStaffSchema, updateStaffSchema } from '@repo/shared'
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

const UI_BORDER = '1.5px solid var(--color-border-ui)'

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

  // Form fields
  const [name,        setName]        = useState(initial?.name        ?? '')
  const [username,    setUsername]    = useState('')  // new: username for login
  const [phone,       setPhone]       = useState(initial?.phoneNumber ?? '')
  const [role,        setRole]        = useState<'da' | 'officer'>(initial?.role ?? 'da')
  const [lang,        setLang]        = useState(initial?.preferredLanguage ?? 'am')
  const [password,    setPassword]    = useState('')
  const [assignedIds, setAssignedIds] = useState<string[]>(initial?.assignedKebeleIds ?? [])
  const [kebeleSearch, setKebeleSearch] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

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

  const handleSubmit = useCallback(async () => {
    setValidationError(null)

    const raw = {
      name,
      phoneNumber: phone || undefined,
      role,
      preferredLanguage: lang,
      assignedKebeleIds: role === 'da' ? assignedIds : [],
      ...(mode === 'create' ? { password, username: username || undefined } : {}),
    }

    const schema = mode === 'create' ? createStaffSchema : updateStaffSchema
    const parsed = schema.safeParse(raw)
    if (!parsed.success) {
      setValidationError(parsed.error.issues[0]?.message ?? 'Validation failed')
      return
    }

    await onSubmit(parsed.data)
  }, [name, username, phone, role, lang, assignedIds, password, mode, onSubmit])

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
          className="relative z-10 w-full max-w-lg bg-surface h-full shadow-2xl flex flex-col"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        >
          {/* Header */}
          <header className="flex items-center justify-between px-6 py-5" style={{ borderBottom: UI_BORDER }}>
            <h2 className="text-base font-bold text-text-primary">
              {mode === 'create' ? t('staff_drawer_add') : t('staff_drawer_edit')}
            </h2>
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

            <Input
              label={t('staff_full_name')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Abebe Kebede"
            />

            {/* Username — only for create; staff use phone+username to log in */}
            {mode === 'create' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <Input
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="abebe_kebede"
                  hint="Lowercase letters, numbers, and underscores only"
                  autoCapitalize="none"
                />
              </motion.div>
            )}

            {/* Phone + note that it must be verified */}
            <div className="space-y-1.5">
              <Input
                label={t('staff_phone')}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+251911000000"
                type="tel"
              />
              <p className="text-xs text-text-faint font-mono">
                ℹ The staff member will verify this number via SMS OTP before they can log in.
              </p>
            </div>

            <Select
              label={t('staff_role')}
              value={role}
              onChange={(e) => setRole(e.target.value as 'da' | 'officer')}
              options={[
                { value: 'da',      label: t('staff_role_da') },
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
                onChange={(e) => setPassword(e.target.value)}
                hint={t('staff_password_hint')}
                placeholder="••••••••••"
              />
            )}

            {/* Assigned kebeles — searchable dropdown */}
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

                  {/* Selected kebeles shown as chips */}
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

          {/* Footer */}
          <footer className="px-6 py-5 flex gap-3 justify-end" style={{ borderTop: UI_BORDER }}>
            <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
              {t('cancel')}
            </Button>
            <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>
              {mode === 'create' ? t('create') : t('save')}
            </Button>
          </footer>
        </motion.aside>
      </motion.div>
    </AnimatePresence>
  )
}
