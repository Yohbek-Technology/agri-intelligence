'use client'

import { useState, useCallback } from 'react'
import type { StaffRow, KebeleRow } from '@repo/shared'
import { createStaffSchema, updateStaffSchema } from '@repo/shared'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Notice } from '@/components/ui/notice'

type DrawerMode = 'create' | 'edit'

interface StaffDrawerProps {
  mode: DrawerMode
  initial?: StaffRow | null
  kebeles: KebeleRow[]
  onClose: () => void
  onSubmit: (data: Record<string, unknown>) => Promise<void>
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
  const [name, setName]               = useState(initial?.name ?? '')
  const [phone, setPhone]             = useState(initial?.phoneNumber ?? '')
  const [role, setRole]               = useState<'da' | 'officer'>(initial?.role ?? 'da')
  const [lang, setLang]               = useState(initial?.preferredLanguage ?? 'am')
  const [assignedIds, setAssignedIds] = useState<string[]>(initial?.assignedKebeleIds ?? [])
  const [password, setPassword]       = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  const toggleKebele = useCallback((id: string) => {
    setAssignedIds((prev) =>
      prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id]
    )
  }, [])

  const handleSubmit = useCallback(async () => {
    setValidationError(null)

    const raw: Record<string, unknown> = {
      name,
      phoneNumber: phone,
      role,
      preferredLanguage: lang,
      assignedKebeleIds: role === 'da' ? assignedIds : [],
    }
    if (mode === 'create') raw.password = password

    const schema = mode === 'create' ? createStaffSchema : updateStaffSchema
    const parsed = schema.safeParse(raw)
    if (!parsed.success) {
      setValidationError(parsed.error.issues[0]?.message ?? 'Validation failed')
      return
    }

    await onSubmit(raw)
  }, [name, phone, role, lang, assignedIds, password, mode, onSubmit])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end" aria-modal="true" role="dialog">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} aria-hidden="true" />
      <aside className="relative z-10 w-full max-w-md bg-surface h-full shadow-2xl flex flex-col overflow-y-auto">
        <header className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-base font-semibold text-text-primary">
            {mode === 'create' ? 'Add Staff Member' : 'Edit Staff Member'}
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary cursor-pointer" aria-label="Close">
            ✕
          </button>
        </header>
        <div className="flex-1 p-5 space-y-4">
          {(error ?? validationError) && (
            <Notice type="error" message={error ?? validationError ?? ''} />
          )}
          <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+251XXXXXXXXX" />

          <Select
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value as 'da' | 'officer')}
            options={[
              { value: 'da', label: 'Development Agent (DA)' },
              { value: 'officer', label: 'Officer' },
            ]}
          />

          <Select
            label="Preferred Language"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            options={[
              { value: 'am', label: 'Amharic (አማርኛ)' },
              { value: 'om', label: 'Oromo (Afaan Oromoo)' },
              { value: 'ti', label: 'Tigrinya (ትግርኛ)' },
              { value: 'en', label: 'English' },
            ]}
          />

          {mode === 'create' && (
            <Input
              label="Temporary Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              hint="Minimum 10 characters"
            />
          )}

          {role === 'da' && kebeles.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-text-primary uppercase tracking-wider font-mono">
                Assigned Kebeles
              </p>
              <div className="max-h-48 overflow-y-auto space-y-1 border border-border rounded-xl p-3">
                {kebeles.map((k) => (
                  <label key={k.id} className="flex items-center gap-3 cursor-pointer py-1">
                    <input
                      type="checkbox"
                      checked={assignedIds.includes(k.id)}
                      onChange={() => toggleKebele(k.id)}
                      className="accent-primary w-4 h-4"
                    />
                    <span className="text-sm text-text-primary">{k.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
        <footer className="p-5 border-t border-border flex gap-3 justify-end">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>
            {mode === 'create' ? 'Create' : 'Save'}
          </Button>
        </footer>
      </aside>
    </div>
  )
}
