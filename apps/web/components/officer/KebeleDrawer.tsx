'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { X } from 'lucide-react'
import { createKebeleSchema, updateKebeleSchema } from '@repo/shared'
import type { KebeleRow, CreateKebeleInput, UpdateKebeleInput } from '@repo/shared'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Notice } from '@/components/ui/notice'

const UI_BORDER = '2px solid var(--color-border-ui)'

type DrawerMode   = 'create' | 'edit'
type BoundaryType = 'centroid' | 'geojson'

interface KebeleDrawerProps {
  mode: DrawerMode
  initial?: KebeleRow | null
  onClose: () => void
  onSubmit: (data: CreateKebeleInput | UpdateKebeleInput) => Promise<void>
  isSubmitting: boolean
  error?: string | null
}

export function KebeleDrawer({
  mode,
  initial,
  onClose,
  onSubmit,
  isSubmitting,
  error,
}: KebeleDrawerProps) {
  const t = useTranslations('OfficerPages')

  const [name, setName]                       = useState(initial?.name ?? '')
  const [boundaryType, setBoundaryType]       = useState<BoundaryType>('centroid')
  const [lat, setLat]                         = useState(initial?.centroidLatitude ?? '')
  const [lng, setLng]                         = useState(initial?.centroidLongitude ?? '')
  const [radius, setRadius]                   = useState(String(initial?.radiusMeters ?? ''))
  const [geojsonText, setGeojsonText]         = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors]         = useState<Record<string, string>>({})

  const onNameChange = (val: string) => {
    setName(val)
    if (fieldErrors.name) setFieldErrors((p) => ({ ...p, name: '' }))
  }

  const onLatChange = (val: string) => {
    setLat(val)
    if (fieldErrors.lat) setFieldErrors((p) => ({ ...p, lat: '' }))
  }

  const onLngChange = (val: string) => {
    setLng(val)
    if (fieldErrors.lng) setFieldErrors((p) => ({ ...p, lng: '' }))
  }

  const onRadiusChange = (val: string) => {
    setRadius(val)
    if (fieldErrors.radius) setFieldErrors((p) => ({ ...p, radius: '' }))
  }

  const onGeojsonChange = (val: string) => {
    setGeojsonText(val)
    if (fieldErrors.geojson) setFieldErrors((p) => ({ ...p, geojson: '' }))
  }

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

      raw.centroidLatitude  = parsedLat
      raw.centroidLongitude = parsedLng
      raw.radiusMeters      = parsedRadius
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
        errs.geojson = t('kebele_geojson_invalid')
        setFieldErrors(errs)
        setValidationError(t('kebele_geojson_invalid'))
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
  }, [name, boundaryType, lat, lng, radius, geojsonText, mode, onSubmit, t])

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
          <header
            className="flex items-center justify-between px-6 py-5"
            style={{ borderBottom: UI_BORDER }}
          >
            <h2 className="text-base font-bold text-text-primary">
              {mode === 'create' ? t('kebele_drawer_add') : t('kebele_drawer_edit')}
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
              label={t('kebele_name')}
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="e.g. Kebele 01"
              error={fieldErrors.name}
            />

            {/* Boundary type toggle */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-text-primary uppercase tracking-wider font-mono">
                {t('kebele_boundary_type')}
              </p>
              <div className="flex gap-3">
                {(['centroid', 'geojson'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setBoundaryType(type)
                      setFieldErrors({})
                      setValidationError(null)
                    }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer whitespace-nowrap"
                    style={{
                      background: boundaryType === type ? 'var(--color-primary)' : 'var(--color-surface-subtle)',
                      color: boundaryType === type ? '#fff' : 'var(--color-text-muted)',
                      border: boundaryType === type ? '2px solid var(--color-primary)' : UI_BORDER,
                    }}
                  >
                    {type === 'centroid' ? t('kebele_centroid') : t('kebele_geojson')}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {boundaryType === 'centroid' ? (
                <motion.div
                  key="centroid"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="grid grid-cols-2 gap-4"
                >
                  <Input
                    label={t('kebele_latitude')}
                    type="number"
                    min={-90} max={90} step={0.0001}
                    value={lat}
                    onChange={(e) => onLatChange(e.target.value)}
                    placeholder="8.5411"
                    error={fieldErrors.lat}
                  />
                  <Input
                    label={t('kebele_longitude')}
                    type="number"
                    min={-180} max={180} step={0.0001}
                    value={lng}
                    onChange={(e) => onLngChange(e.target.value)}
                    placeholder="39.2704"
                    error={fieldErrors.lng}
                  />
                  <div className="col-span-2">
                    <Input
                      label={t('kebele_radius_label')}
                      type="number"
                      min={100}
                      value={radius}
                      onChange={(e) => onRadiusChange(e.target.value)}
                      placeholder="5000"
                      error={fieldErrors.radius}
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="geojson"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-1.5"
                >
                  <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider font-mono">
                    GeoJSON MultiPolygon
                  </label>
                  <textarea
                    className={`w-full bg-surface text-text-primary text-xs rounded-xl p-3 min-h-[200px] focus:outline-none focus:ring-2 font-mono resize-none ${
                      fieldErrors.geojson ? 'border-2 border-danger focus:ring-danger/20' : 'focus:ring-primary/15'
                    }`}
                    style={{ border: fieldErrors.geojson ? undefined : UI_BORDER }}
                    value={geojsonText}
                    onChange={(e) => onGeojsonChange(e.target.value)}
                    placeholder={t('kebele_geojson_placeholder')}
                    aria-label="GeoJSON MultiPolygon"
                  />
                  {fieldErrors.geojson && (
                    <p className="text-xs font-medium text-danger flex items-center gap-1 font-mono">
                      <span>⚠</span> {fieldErrors.geojson}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <footer
            className="px-6 py-5 flex gap-3 justify-end"
            style={{ borderTop: UI_BORDER }}
          >
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

