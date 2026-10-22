'use client'
import { useState, useCallback, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { officerService } from '@/services/officerService'
import { authService } from '@/services/authService'
import { showSuccessToast, showErrorToast } from '@/components/ui/toast'
import {
  createKebeleSchema,
  updateKebeleSchema,
  createStaffSchema,
  updateStaffSchema,
  PhoneUtils,
} from '@repo/shared'
import type {
  KebeleRow,
  StaffRow,
  CreateKebeleInput,
  UpdateKebeleInput,
  CreateStaffInput,
  UpdateStaffInput,
} from '@repo/shared'

// ─── Kebeles ────────────────────────────────────────────────────────────────

export function useKebeles() {
  return useQuery({
    queryKey: ['kebeles'],
    queryFn: async () => {
      const res = await officerService.listKebeles()
      if (!res.success) throw new Error(res.error ?? 'Failed to load kebeles')
      return res.data!
    },
    staleTime: 30_000,
  })
}

export function useCreateKebele() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreateKebeleInput) => {
      const res = await officerService.createKebele(body)
      if (!res.success) throw new Error(res.error ?? 'Failed to create kebele')
      return res.data!
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['kebeles'] }),
  })
}

export function useUpdateKebele() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: UpdateKebeleInput }) => {
      const res = await officerService.updateKebele(id, body)
      if (!res.success) throw new Error(res.error ?? 'Failed to update kebele')
      return res.data!
    },
    onMutate: async ({ id, body }) => {
      await qc.cancelQueries({ queryKey: ['kebeles'] })
      const prev = qc.getQueryData<KebeleRow[]>(['kebeles'])
      qc.setQueryData<KebeleRow[]>(['kebeles'], (old): KebeleRow[] =>
        (old ?? []).map((k): KebeleRow => (k.id === id ? { ...k, ...(body as Partial<KebeleRow>) } : k)),
      )
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['kebeles'], ctx.prev)
    },
    onSettled: () => void qc.invalidateQueries({ queryKey: ['kebeles'] }),
  })
}

export function useDeleteKebele() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await officerService.deleteKebele(id)
      if (!res.success) throw new Error(res.error ?? 'Failed to delete kebele')
      return res.data
    },
    // Optimistic: remove from cache immediately so UI is instant
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['kebeles'] })
      const prev = qc.getQueryData<KebeleRow[]>(['kebeles'])
      qc.setQueryData<KebeleRow[]>(['kebeles'], (old) => old?.filter((k) => k.id !== id) ?? [])
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['kebeles'], ctx.prev)
    },
    onSettled: () => void qc.invalidateQueries({ queryKey: ['kebeles'] }),
  })
}

/** Restore a soft-deleted kebele (undo delete) */
export function useRestoreKebele() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await officerService.restoreKebele(id)
      if (!res.success) throw new Error(res.error ?? 'Failed to restore kebele')
      return res.data!
    },
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ['kebeles'] })
    },
    onError: (_err, _vars, ctx) => {
      void qc.invalidateQueries({ queryKey: ['kebeles'] })
    },
    onSettled: () => void qc.invalidateQueries({ queryKey: ['kebeles'] }),
  })
}

// ─── Staff ───────────────────────────────────────────────────────────────────

export function useStaff() {
  return useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const res = await officerService.listStaff()
      if (!res.success) throw new Error(res.error ?? 'Failed to load staff')
      return res.data!
    },
    staleTime: 30_000,
  })
}

export function useCreateStaff() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreateStaffInput) => {
      const res = await officerService.createStaff(body)
      if (!res.success) throw new Error(res.error ?? 'Failed to create staff member')
      return res.data!
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['staff'] }),
  })
}

export function useUpdateStaff() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: UpdateStaffInput }) => {
      const res = await officerService.updateStaff(id, body)
      if (!res.success) throw new Error(res.error ?? 'Failed to update staff member')
      return res.data!
    },
    onMutate: async ({ id, body }) => {
      await qc.cancelQueries({ queryKey: ['staff'] })
      const prev = qc.getQueryData<StaffRow[]>(['staff'])
      qc.setQueryData<StaffRow[]>(['staff'], (old) =>
        old?.map((s) => (s.id === id ? { ...s, ...body } : s)) ?? [],
      )
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['staff'], ctx.prev)
    },
    onSettled: () => void qc.invalidateQueries({ queryKey: ['staff'] }),
  })
}

export function useDeactivateStaff() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await officerService.deactivateStaff(id)
      if (!res.success) throw new Error(res.error ?? 'Failed to deactivate staff member')
      return res.data
    },
    // Optimistic: mark as banned immediately
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['staff'] })
      const prev = qc.getQueryData<StaffRow[]>(['staff'])
      qc.setQueryData<StaffRow[]>(['staff'], (old) =>
        old?.map((s) => (s.id === id ? { ...s, banned: true } : s)) ?? [],
      )
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['staff'], ctx.prev)
    },
    onSettled: () => void qc.invalidateQueries({ queryKey: ['staff'] }),
  })
}

/** Reactivate a banned staff member (undo deactivate) */
export function useReactivateStaff() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await officerService.reactivateStaff(id)
      if (!res.success) throw new Error(res.error ?? 'Failed to reactivate staff member')
      return res.data
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['staff'] })
      const prev = qc.getQueryData<StaffRow[]>(['staff'])
      qc.setQueryData<StaffRow[]>(['staff'], (old) =>
        old?.map((s) => (s.id === id ? { ...s, banned: false } : s)) ?? [],
      )
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['staff'], ctx.prev)
    },
    onSettled: () => void qc.invalidateQueries({ queryKey: ['staff'] }),
  })
}

// ─── Drawer Form Hooks ───────────────────────────────────────────────────────

export function useKebeleForm({
  mode,
  initial,
  onSubmit,
}: {
  mode: 'create' | 'edit'
  initial?: KebeleRow | null
  onSubmit: (data: CreateKebeleInput | UpdateKebeleInput) => Promise<void>
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [boundaryType, setBoundaryType] = useState<'centroid' | 'geojson'>('centroid')
  const [lat, setLat] = useState(initial?.centroidLatitude ?? '')
  const [lng, setLng] = useState(initial?.centroidLongitude ?? '')
  const [radius, setRadius] = useState(String(initial?.radiusMeters ?? ''))
  const [geojsonText, setGeojsonText] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const onNameChange = useCallback((val: string) => {
    setName(val)
    setFieldErrors((p) => (p.name ? { ...p, name: '' } : p))
  }, [])

  const onLatChange = useCallback((val: string) => {
    setLat(val)
    setFieldErrors((p) => (p.lat ? { ...p, lat: '' } : p))
  }, [])

  const onLngChange = useCallback((val: string) => {
    setLng(val)
    setFieldErrors((p) => (p.lng ? { ...p, lng: '' } : p))
  }, [])

  const onRadiusChange = useCallback((val: string) => {
    setRadius(val)
    setFieldErrors((p) => (p.radius ? { ...p, radius: '' } : p))
  }, [])

  const onGeojsonChange = useCallback((val: string) => {
    setGeojsonText(val)
    setFieldErrors((p) => (p.geojson ? { ...p, geojson: '' } : p))
  }, [])

  const handleSubmit = useCallback(async () => {
    setValidationError(null)
    const errs: Record<string, string> = {}

    if (!name.trim() || name.trim().length < 2) {
      errs.name = 'Kebele name must be at least 2 characters.'
    } else if (name.trim().length > 120) {
      errs.name = 'Kebele name must be 120 characters or less.'
    }

    const raw: Record<string, unknown> = { name: name.trim() }

    if (boundaryType === 'centroid') {
      const parsedLat = parseFloat(lat as string)
      const parsedLng = parseFloat(lng as string)
      const parsedRadius = parseInt(radius, 10)

      if (lat === '' || isNaN(parsedLat)) {
        errs.lat = 'Latitude is required.'
      } else if (parsedLat < -90 || parsedLat > 90) {
        errs.lat = 'Latitude must be between -90 and 90.'
      }

      if (lng === '' || isNaN(parsedLng)) {
        errs.lng = 'Longitude is required.'
      } else if (parsedLng < -180 || parsedLng > 180) {
        errs.lng = 'Longitude must be between -180 and 180.'
      }

      if (radius === '' || isNaN(parsedRadius)) {
        errs.radius = 'Radius is required.'
      } else if (parsedRadius <= 0) {
        errs.radius = 'Radius must be a positive integer in meters.'
      }

      if (Object.keys(errs).length > 0) {
        setFieldErrors(errs)
        setValidationError('Please correct the highlighted fields.')
        return
      }

      raw.centroidLatitude = parsedLat
      raw.centroidLongitude = parsedLng
      raw.radiusMeters = parsedRadius
    } else {
      if (!geojsonText.trim()) {
        errs.geojson = 'GeoJSON boundary is required.'
        setFieldErrors(errs)
        setValidationError('Please provide a valid GeoJSON boundary.')
        return
      }
      try {
        const parsedGeo = JSON.parse(geojsonText)
        if (!parsedGeo || typeof parsedGeo !== 'object') {
          throw new Error('Not an object')
        }
        raw.boundary = parsedGeo
      } catch {
        errs.geojson = 'Invalid GeoJSON object format.'
        setFieldErrors(errs)
        setValidationError('Invalid GeoJSON boundary syntax.')
        return
      }
    }

    const schema = mode === 'create' ? createKebeleSchema : updateKebeleSchema
    const parsed = schema.safeParse(raw)
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]
      setValidationError(firstIssue?.message ?? 'Validation failed')
      return
    }

    await onSubmit(parsed.data)
  }, [name, boundaryType, lat, lng, radius, geojsonText, mode, onSubmit])

  const onBoundaryTypeChange = useCallback((type: 'centroid' | 'geojson') => {
    setBoundaryType(type)
    setFieldErrors({})
    setValidationError(null)
  }, [])

  return {
    name,
    boundaryType,
    lat,
    lng,
    radius,
    geojsonText,
    validationError,
    fieldErrors,
    setBoundaryType,
    onBoundaryTypeChange,
    onNameChange,
    onLatChange,
    onLngChange,
    onRadiusChange,
    onGeojsonChange,
    handleSubmit,
  }
}

const ETHIOPIAN_PHONE_REGEX = /^(?:\+251|251|0)[79][0-9]{8}$/
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/

export function useStaffForm({
  mode,
  initial,
  onSubmit,
}: {
  mode: 'create' | 'edit'
  initial?: StaffRow | null
  kebeles: KebeleRow[]
  onSubmit: (data: CreateStaffInput | UpdateStaffInput) => Promise<void>
}) {
  const [step, setStep] = useState<'details' | 'verify_otp'>('details')
  const [name, setName] = useState(initial?.name ?? '')
  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState(initial?.phoneNumber ?? '')
  const [role, setRole] = useState<'da' | 'officer'>(initial?.role ?? 'da')
  const [lang, setLang] = useState(initial?.preferredLanguage ?? 'am')
  const [password, setPassword] = useState('')
  const [assignedIds, setAssignedIds] = useState<string[]>(initial?.assignedKebeleIds ?? [])

  const [otpCode, setOtpCode] = useState('')
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const [validationError, setValidationError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [usernameChecking, setUsernameChecking] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [phoneChecking, setPhoneChecking] = useState(false)
  const [phoneAvailable, setPhoneAvailable] = useState<boolean | null>(null)

  const usernameDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const phoneDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown((p) => (p <= 1 ? 0 : p - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  const handleNameChange = useCallback((val: string) => {
    setName(val)
    setFieldErrors((p) => (p.name ? { ...p, name: '' } : p))
  }, [])

  const handlePasswordChange = useCallback((val: string) => {
    setPassword(val)
    setFieldErrors((p) => (p.password ? { ...p, password: '' } : p))
  }, [])

  const handleUsernameChange = useCallback((val: string) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9_]/g, '')
    setUsername(clean)
    setUsernameAvailable(null)
    setFieldErrors((p) => (p.username ? { ...p, username: '' } : p))

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
        const res = await authService.isUsernameAvailable(clean)
        const avail = res.data?.available ?? false
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
  }, [])

  const handlePhoneChange = useCallback((val: string) => {
    setPhone(val)
    setPhoneAvailable(null)
    setFieldErrors((p) => (p.phone ? { ...p, phone: '' } : p))

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
        const res = await authService.checkPhoneExists(normalized)
        if (res.data?.exists) {
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
  }, [])

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

      try {
        await onSubmit(parsed.data)
      } catch (err: any) {
        setValidationError(err?.message || 'Failed to create staff member.')
      }
    } else {
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

      try {
        await onSubmit(parsed.data)
      } catch (err: any) {
        setValidationError(err?.message || 'Failed to update staff member.')
      }
    }
  }, [name, username, phone, otpCode, role, lang, assignedIds, password, mode, onSubmit])

  return {
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
  }
}

// ─── Management Hook for Territory / Staff Page ──────────────────────────────

export type KebeleDrawerState =
  | { open: false }
  | { open: true; mode: 'create' }
  | { open: true; mode: 'edit'; row: KebeleRow }

export type StaffDrawerState =
  | { open: false }
  | { open: true; mode: 'create' }
  | { open: true; mode: 'edit'; row: StaffRow }

export function useKebeleManagement() {
  const t = useTranslations('OfficerPages')
  const qc = useQueryClient()

  const [activeTab, setActiveTab] = useState<'kebeles' | 'staff'>('kebeles')
  const [kebeleDrawer, setKebeleDrawer] = useState<KebeleDrawerState>({ open: false })
  const [staffDrawer, setStaffDrawer] = useState<StaffDrawerState>({ open: false })

  const kebelesQ = useKebeles()
  const staffQ = useStaff()
  const createKeb = useCreateKebele()
  const updateKeb = useUpdateKebele()
  const deleteKeb = useDeleteKebele()
  const restoreKeb = useRestoreKebele()
  const createStaff = useCreateStaff()
  const updateStaff = useUpdateStaff()
  const deactivate = useDeactivateStaff()
  const reactivate = useReactivateStaff()

  const kebeles = kebelesQ.data ?? []
  const staffList = staffQ.data ?? []
  const isLoading = activeTab === 'kebeles' ? kebelesQ.isLoading : staffQ.isLoading

  const handleKebeleSubmit = useCallback(
    async (data: CreateKebeleInput | UpdateKebeleInput) => {
      try {
        if (kebeleDrawer.open && kebeleDrawer.mode === 'edit') {
          await updateKeb.mutateAsync({ id: kebeleDrawer.row.id, body: data as UpdateKebeleInput })
          showSuccessToast(t('toast_kebele_updated'))
        } else {
          await createKeb.mutateAsync(data as CreateKebeleInput)
          showSuccessToast(t('toast_kebele_created'))
        }
        setKebeleDrawer({ open: false })
      } catch (err) {
        showErrorToast(err instanceof Error ? err.message : 'Failed to save kebele')
      }
    },
    [kebeleDrawer, updateKeb, createKeb, t]
  )

  const handleDeleteKebele = useCallback(
    (row: KebeleRow) => {
      const snapshot = qc.getQueryData<KebeleRow[]>(['kebeles'])
      let undid = false
      deleteKeb.mutate(row.id, {
        onSuccess: () => {
          if (!undid) {
            showSuccessToast(t('toast_kebele_deleted'), {
              label: t('undo'),
              onUndo: () => {
                undid = true
                if (snapshot) qc.setQueryData(['kebeles'], snapshot)
                restoreKeb.mutate(row.id, {
                  onSuccess: () => showSuccessToast('Kebele restored'),
                  onError: (err) => {
                    void qc.invalidateQueries({ queryKey: ['kebeles'] })
                    showErrorToast(err instanceof Error ? err.message : 'Could not restore kebele')
                  },
                })
              },
            })
          }
        },
        onError: (err) => showErrorToast(err instanceof Error ? err.message : 'Failed to delete'),
      })
    },
    [qc, deleteKeb, restoreKeb, t]
  )

  const handleStaffSubmit = useCallback(
    async (data: CreateStaffInput | UpdateStaffInput) => {
      try {
        if (staffDrawer.open && staffDrawer.mode === 'edit') {
          await updateStaff.mutateAsync({ id: staffDrawer.row.id, body: data as UpdateStaffInput })
          showSuccessToast(t('toast_staff_updated'))
        } else {
          await createStaff.mutateAsync(data as CreateStaffInput)
          showSuccessToast(t('toast_staff_created'))
        }
        setStaffDrawer({ open: false })
      } catch (err) {
        showErrorToast(err instanceof Error ? err.message : 'Failed to save staff')
        throw err
      }
    },
    [staffDrawer, updateStaff, createStaff, t]
  )

  const handleDeactivate = useCallback(
    (row: StaffRow) => {
      const snapshot = qc.getQueryData<StaffRow[]>(['staff'])
      let undid = false
      deactivate.mutate(row.id, {
        onSuccess: () => {
          if (!undid) {
            showSuccessToast(t('toast_staff_deactivated'), {
              label: t('undo'),
              onUndo: () => {
                undid = true
                if (snapshot) qc.setQueryData(['staff'], snapshot)
                reactivate.mutate(row.id, {
                  onSuccess: () => showSuccessToast('Staff member reactivated'),
                  onError: () => {
                    void qc.invalidateQueries({ queryKey: ['staff'] })
                    showErrorToast('Could not reactivate')
                  },
                })
              },
            })
          }
        },
        onError: (err) => showErrorToast(err instanceof Error ? err.message : 'Failed to deactivate'),
      })
    },
    [qc, deactivate, reactivate, t]
  )

  const handleReactivate = useCallback(
    (id: string) => {
      reactivate.mutate(id, {
        onSuccess: () => showSuccessToast('Staff member reactivated'),
        onError: (e) => showErrorToast(e instanceof Error ? e.message : 'Failed to reactivate'),
      })
    },
    [reactivate]
  )

  return {
    activeTab,
    setActiveTab,
    kebeles,
    staffList,
    isLoading,
    kebelesLoading: kebelesQ.isLoading,
    staffLoading: staffQ.isLoading,
    kebelesError: kebelesQ.error?.message ?? null,
    staffError: staffQ.error?.message ?? null,
    kebeleDrawer,
    staffDrawer,
    setKebeleDrawer,
    setStaffDrawer,
    handleKebeleSubmit,
    handleDeleteKebele,
    handleStaffSubmit,
    handleDeactivate,
    handleReactivate,
    isReactivating: reactivate.isPending,
    isDeactivating: deactivate.isPending,
    isKebeleSubmitting: createKeb.isPending || updateKeb.isPending,
    isStaffSubmitting: createStaff.isPending || updateStaff.isPending,
    kebeleDrawerError: kebeleDrawer.open && kebeleDrawer.mode === 'edit' ? (updateKeb.error?.message ?? null) : (createKeb.error?.message ?? null),
    staffDrawerError: staffDrawer.open && staffDrawer.mode === 'edit' ? (updateStaff.error?.message ?? null) : (createStaff.error?.message ?? null),
  }
}
