'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Navigation, CheckCircle2, AlertTriangle, Mountain, Layers, Droplets } from 'lucide-react'
import type {
  CreatePlotInput,
  AreaUnit,
  SoilClass,
  DrainageClass,
  CropRow,
  GeoResolutionResult,
} from '@repo/shared'

interface PlotDrawerProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreatePlotInput) => void
  crops: CropRow[]
  isLoading: boolean
  gpsLoading: boolean
  onAcquireGps: () => void
  onResolveCoords: (lat: number, lng: number) => Promise<GeoResolutionResult | null>
  geoResolution: GeoResolutionResult | null
  errors?: Record<string, string[]>
  farmerName?: string
}

export function PlotDrawer({
  open,
  onClose,
  onSubmit,
  crops,
  isLoading,
  gpsLoading,
  onAcquireGps,
  onResolveCoords,
  geoResolution,
  errors = {},
  farmerName,
}: PlotDrawerProps) {
  const tPlots = useTranslations('Phase2.plots')
  const tSoil = useTranslations('Phase2.soil')
  const [name, setName] = useState('')
  const [areaValue, setAreaValue] = useState<number>(1)
  const [areaUnit, setAreaUnit] = useState<AreaUnit>('timad')
  const [lat, setLat] = useState<number>(8.54)
  const [lng, setLng] = useState<number>(39.27)
  const [soilClass, setSoilClass] = useState<SoilClass>('beda_nitisol')
  const [drainage, setDrainage] = useState<DrainageClass>('moderate')
  const [plannedCropId, setPlannedCropId] = useState<string>('')
  const [plannedSeasonYear, setPlannedSeasonYear] = useState<number>(new Date().getFullYear())

  // Trigger geo-resolution when coordinates change after debounce
  useEffect(() => {
    if (open && lat && lng) {
      const timer = setTimeout(() => {
        onResolveCoords(lat, lng)
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [lat, lng, open, onResolveCoords])

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      name,
      areaValue: Number(areaValue),
      areaUnit,
      centroid: {
        lat: Number(lat),
        lng: Number(lng),
        accuracyMeters: 10,
      },
      soilClass,
      drainage,
      plannedCropId: plannedCropId ? plannedCropId : null,
      plannedSeasonYear: plannedCropId ? Number(plannedSeasonYear) : null,
    })
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="w-full max-w-xl h-full bg-surface shadow-2xl flex flex-col border-l-2 border-border-ui overflow-y-auto"
      >
        {/* Drawer Header */}
        <div className="p-5 sm:p-6 bg-surface-subtle border-b-2 border-border-ui flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold font-mono uppercase tracking-tight text-text-primary">
              {tPlots('register_title')}
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              {farmerName ? tPlots('register_for', { name: farmerName }) : tPlots('register_subtitle')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-white border border-border-ui transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 flex-1">
          {/* Parcel Name */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-text-muted mb-1.5">
              {tPlots('parcel_name')}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={tPlots('parcel_name_placeholder')}
              className="w-full px-3.5 py-2.5 text-sm bg-white rounded-xl border-2 border-border-ui focus:border-primary outline-hidden"
            />
            {errors.name && <p className="text-xs text-danger mt-1">{errors.name[0]}</p>}
          </div>

          {/* Land Area and Unit Switcher */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-text-muted mb-1.5">
              {tPlots('area_measurement')}
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="any"
                min="0.01"
                max="1000"
                required
                value={areaValue}
                onChange={(e) => setAreaValue(parseFloat(e.target.value))}
                placeholder="1.0"
                className="flex-1 px-3.5 py-2.5 text-sm bg-white rounded-xl border-2 border-border-ui focus:border-primary outline-hidden font-mono font-bold"
              />
              <div className="flex rounded-xl p-1 bg-surface-subtle border-2 border-border-ui">
                {(['timad', 'kert', 'hectare'] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setAreaUnit(u)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                      areaUnit === u
                        ? 'bg-primary text-white shadow-xs'
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
            {errors.areaValue && (
              <p className="text-xs text-danger mt-1">{errors.areaValue[0]}</p>
            )}
          </div>

          {/* Centroid Coordinates & PostGIS Geo-Resolution */}
          <div className="p-4 rounded-xl bg-surface-subtle border-2 border-border-ui space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-text-primary">
                {tPlots('gps_coordinates')}
              </span>
              <button
                type="button"
                onClick={onAcquireGps}
                disabled={gpsLoading}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold uppercase bg-white border border-border-ui hover:border-primary text-text-primary transition-colors cursor-pointer disabled:opacity-50"
              >
                <Navigation size={12} className={gpsLoading ? 'animate-spin' : 'text-primary'} />
                {gpsLoading ? tPlots('acquiring_gps') : tPlots('capture_gps')}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] font-mono uppercase text-text-muted">{tPlots('latitude')}</span>
                <input
                  type="number"
                  step="any"
                  required
                  value={lat}
                  onChange={(e) => setLat(parseFloat(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-border-ui font-mono outline-hidden"
                />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-text-muted">{tPlots('longitude')}</span>
                <input
                  type="number"
                  step="any"
                  required
                  value={lng}
                  onChange={(e) => setLng(parseFloat(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-border-ui font-mono outline-hidden"
                />
              </div>
            </div>

            {/* Geo-Resolution Results & Boundary Validation */}
            {geoResolution && (
              <div
                className={`p-3 rounded-lg border text-xs font-mono space-y-1 ${
                  geoResolution.isInJurisdiction
                    ? 'bg-success-light/60 border-success/30 text-success'
                    : 'bg-danger-light border-danger/40 text-danger'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  {geoResolution.isInJurisdiction ? (
                    <>
                      <CheckCircle2 size={13} />
                      {tPlots('within_jurisdiction')}
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={13} />
                      {tPlots('outside_jurisdiction')}
                    </>
                  )}
                </div>
                <div className="text-[11px] text-text-muted flex flex-wrap gap-x-3">
                  <span>Kebele: {geoResolution.kebeleName ?? 'Unresolved'}</span>
                  <span>Elevation: {geoResolution.elevationMeters}m</span>
                  <span>Derived Zone: {geoResolution.agroZoneDerived}</span>
                </div>
              </div>
            )}
          </div>

          {/* Soil Classification Selector */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-text-muted mb-1.5">
              {tPlots('soil_class_label')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { id: 'koticha_vertisol', label: tSoil('koticha_label'), desc: tSoil('koticha_desc'), color: '#1F1E1D' },
                { id: 'beda_nitisol', label: tSoil('beda_label'), desc: tSoil('beda_desc'), color: '#8A3C23' },
                { id: 'sandy', label: tSoil('sandy_label'), desc: tSoil('sandy_desc'), color: '#C2A374' },
                { id: 'clay', label: tSoil('clay_label'), desc: tSoil('clay_desc'), color: '#5C4033' },
                { id: 'loam', label: tSoil('loam_label'), desc: tSoil('loam_desc'), color: '#3B2D21' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSoilClass(s.id as SoilClass)}
                  className={`flex items-start gap-2.5 p-3 rounded-xl border-2 text-left cursor-pointer transition-all ${
                    soilClass === s.id
                      ? 'border-primary bg-primary-light/40 shadow-xs'
                      : 'border-border-ui bg-white hover:border-text-faint'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full mt-0.5 shrink-0"
                    style={{ backgroundColor: s.color }}
                  />
                  <div>
                    <p className="text-xs font-bold text-text-primary font-mono">{s.label}</p>
                    <p className="text-[10px] text-text-muted line-clamp-1">{s.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            {errors.soilClass && <p className="text-xs text-danger mt-1">{errors.soilClass[0]}</p>}
          </div>

          {/* Drainage Class Selector */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-text-muted mb-1.5">
              {tPlots('drainage_label')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'waterlogs', label: tSoil('waterlogs_label'), badge: tSoil('waterlogs_badge') },
                { id: 'moderate', label: tSoil('moderate_label'), badge: tSoil('moderate_badge') },
                { id: 'free_draining', label: tSoil('free_draining_label'), badge: tSoil('free_draining_badge') },
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDrainage(d.id as DrainageClass)}
                  className={`p-2.5 rounded-xl border-2 text-center cursor-pointer transition-all ${
                    drainage === d.id
                      ? 'border-primary bg-primary-light text-primary font-bold shadow-xs'
                      : 'border-border-ui bg-white text-text-muted hover:border-text-faint'
                  }`}
                >
                  <p className="text-xs font-mono">{d.label}</p>
                  <p className="text-[9px] uppercase tracking-wider text-text-faint mt-0.5">{d.badge}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Planned Crop Linkage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-text-muted mb-1.5">
                {tPlots('planned_crop_label')}
              </label>
              <select
                value={plannedCropId}
                onChange={(e) => setPlannedCropId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white rounded-xl border-2 border-border-ui focus:border-primary outline-hidden"
              >
                <option value="">{tPlots('no_crop_planned')}</option>
                {crops.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameEn} ({c.nameAm ?? c.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-text-muted mb-1.5">
                {tPlots('target_season')}
              </label>
              <input
                type="number"
                min="2020"
                max="2035"
                value={plannedSeasonYear}
                onChange={(e) => setPlannedSeasonYear(parseInt(e.target.value))}
                className="w-full px-3.5 py-2 text-xs bg-white rounded-xl border-2 border-border-ui focus:border-primary outline-hidden font-mono"
              />
            </div>
          </div>

          {/* Drawer Actions */}
          <div className="pt-4 border-t border-border-ui flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border-2 border-border-ui text-xs font-mono uppercase font-bold text-text-muted hover:bg-surface-subtle transition-colors cursor-pointer"
            >
              {tPlots('cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading || (geoResolution !== null && !geoResolution.isInJurisdiction)}
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-mono uppercase font-bold tracking-wider transition-colors cursor-pointer disabled:opacity-50 shadow-md"
            >
              {isLoading ? tPlots('saving') : tPlots('save_parcel')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
