'use client'

import { useState, useCallback } from 'react'
import type { KebeleRow } from '@repo/shared'
import { createKebeleSchema, updateKebeleSchema } from '@repo/shared'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Notice } from '@/components/ui/notice'

type DrawerMode = 'create' | 'edit'
type BoundaryType = 'centroid' | 'geojson'

interface KebeleDrawerProps {
  mode: DrawerMode
  initial?: KebeleRow | null
  onClose: () => void
  onSubmit: (data: Record<string, unknown>) => Promise<void>
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
  const [name, setName]                     = useState(initial?.name ?? '')
  const [boundaryType, setBoundaryType]     = useState<BoundaryType>('centroid')
  const [lat, setLat]                       = useState(initial?.centroidLatitude ?? '')
  const [lng, setLng]                       = useState(initial?.centroidLongitude ?? '')
  const [radius, setRadius]                 = useState(String(initial?.radiusMeters ?? ''))
  const [geojsonText, setGeojsonText]       = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleSubmit = useCallback(async () => {
    setValidationError(null)

    const raw: Record<string, unknown> = { name }
    if (boundaryType === 'centroid') {
      raw.centroidLatitude  = parseFloat(lat as string)
      raw.centroidLongitude = parseFloat(lng as string)
      raw.radiusMeters      = parseInt(radius, 10)
    } else {
      try {
        raw.boundary = JSON.parse(geojsonText) as unknown
      } catch {
        setValidationError('GeoJSON is not valid JSON.')
        return
      }
    }

    const schema = mode === 'create' ? createKebeleSchema : updateKebeleSchema
    const parsed = schema.safeParse(raw)
    if (!parsed.success) {
      setValidationError(parsed.error.issues[0]?.message ?? 'Validation failed')
      return
    }

    await onSubmit(raw)
  }, [name, boundaryType, lat, lng, radius, geojsonText, mode, onSubmit])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end" aria-modal="true" role="dialog">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} aria-hidden="true" />
      <aside className="relative z-10 w-full max-w-md bg-surface h-full shadow-2xl flex flex-col overflow-y-auto">
        <header className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-base font-semibold text-text-primary">
            {mode === 'create' ? 'Add Kebele' : 'Edit Kebele'}
          </h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </header>
        <div className="flex-1 p-5 space-y-4">
          {(error ?? validationError) && (
            <Notice type="error" message={error ?? validationError ?? ''} />
          )}
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />

          <div className="space-y-2">
            <p className="text-xs font-semibold text-text-primary uppercase tracking-wider font-mono">Boundary Type</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setBoundaryType('centroid')}
                className={`flex-1 py-2 rounded-xl text-sm border font-medium transition-colors cursor-pointer ${
                  boundaryType === 'centroid'
                    ? 'bg-primary text-white border-primary'
                    : 'bg-surface-subtle text-text-muted border-border'
                }`}
              >
                Centroid + Radius
              </button>
              <button
                type="button"
                onClick={() => setBoundaryType('geojson')}
                className={`flex-1 py-2 rounded-xl text-sm border font-medium transition-colors cursor-pointer ${
                  boundaryType === 'geojson'
                    ? 'bg-primary text-white border-primary'
                    : 'bg-surface-subtle text-text-muted border-border'
                }`}
              >
                GeoJSON
              </button>
            </div>
          </div>

          {boundaryType === 'centroid' ? (
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Latitude"
                type="number"
                min={-90} max={90} step={0.0001}
                value={lat}
                onChange={(e) => setLat(e.target.value)}
              />
              <Input
                label="Longitude"
                type="number"
                min={-180} max={180} step={0.0001}
                value={lng}
                onChange={(e) => setLng(e.target.value)}
              />
              <div className="col-span-2">
                <Input
                  label="Radius (meters)"
                  type="number"
                  min={100}
                  value={radius}
                  onChange={(e) => setRadius(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider font-mono mb-1.5">
                GeoJSON MultiPolygon
              </label>
              <textarea
                className="w-full bg-surface text-text-primary text-xs rounded-xl border border-border p-3 min-h-[200px] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 font-mono"
                value={geojsonText}
                onChange={(e) => setGeojsonText(e.target.value)}
                placeholder='{ "type": "MultiPolygon", "coordinates": [...] }'
                aria-label="GeoJSON MultiPolygon"
              />
            </div>
          )}
        </div>
        <footer className="p-5 border-t border-border flex gap-3 justify-end">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
          >
            {mode === 'create' ? 'Create' : 'Save'}
          </Button>
        </footer>
      </aside>
    </div>
  )
}
