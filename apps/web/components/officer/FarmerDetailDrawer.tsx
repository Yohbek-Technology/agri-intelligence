'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { X, User, MapPin } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { RegistryFarmerItem } from '@repo/shared'

interface FarmerDetailDrawerProps {
  farmer: RegistryFarmerItem | null
  onClose: () => void
  onReassignDa?: (farmerId: string) => void
}

export function FarmerDetailDrawer({
  farmer,
  onClose,
  onReassignDa,
}: FarmerDetailDrawerProps) {
  const t = useTranslations('Phase2.registry')
  const tDa = useTranslations('Phase2.da')
  const tFarmer = useTranslations('Phase2.farmer')
  const tPlots = useTranslations('Phase2.plots')

  if (!farmer) return null

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
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-primary text-white">
              <User size={20} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-mono uppercase tracking-tight text-text-primary">
                  {farmer.fullName}
                </h2>
                <span
                  className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md border ${
                    farmer.isVerified
                      ? 'bg-success-light text-success border-success/30'
                      : 'bg-amber-50 text-amber-800 border-amber-300'
                  }`}
                >
                  {farmer.isVerified ? tDa('verified') : tDa('pending')}
                </span>
              </div>
              <p className="text-xs text-text-muted font-mono mt-0.5">
                {tFarmer('local_id')}: {farmer.localIdNumber} • {t('col_kebele')}: {farmer.kebeleName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-white border border-border-ui transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-5 sm:p-6 space-y-6 flex-1">
          {/* Identity & Extension Overview */}
          <div
            className="p-4 rounded-xl bg-surface-subtle space-y-2.5 text-xs font-mono"
            style={{ border: '2px solid var(--color-border-ui)' }}
          >
            <div className="flex justify-between">
              <span className="text-text-muted">{tDa('phone_number')}:</span>
              <span className="text-text-primary font-bold">
                {farmer.phoneNumber ?? tDa('has_no_phone')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">{t('col_da')}:</span>
              <span className="text-text-primary font-bold">
                {farmer.assignedDaName ?? t('unassigned')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">{t('total_cultivated_area')}:</span>
              <span className="text-primary font-bold">
                {farmer.totalAreaDisplay} {farmer.displayUnit} ({farmer.totalAreaHectares} Ha)
              </span>
            </div>
          </div>

          {/* Registered Parcels Breakdown */}
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted mb-3">
              {t('registered_parcels_count', { count: farmer.plots.length })}
            </h3>

            {farmer.plots.length === 0 ? (
              <div className="p-6 text-center text-xs font-mono text-text-faint bg-surface-subtle rounded-xl border border-border-ui">
                {t('no_parcels_registered')}
              </div>
            ) : (
              <div className="space-y-3">
                {farmer.plots.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl bg-white border-2 border-border-ui space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold font-mono uppercase text-text-primary">
                        {p.name}
                      </h4>
                      <span className="text-xs font-mono font-bold text-primary">
                        {p.displayArea} {p.displayUnit}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 text-[11px] font-mono text-text-muted">
                      {p.soilClass && (
                        <span className="px-2 py-0.5 rounded-md bg-surface-subtle border border-border-ui">
                          {p.soilClass.replace('_', ' ')}
                        </span>
                      )}
                      {p.drainage && (
                        <span className="px-2 py-0.5 rounded-md bg-surface-subtle border border-border-ui">
                          {p.drainage.replace('_', ' ')}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-md bg-surface-subtle border border-border-ui">
                        {p.agroZone.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-text-faint flex items-center gap-1.5 pt-1">
                      <MapPin size={12} className="text-text-faint" />
                      {tPlots('centroid_gps')} {p.centroidLatitude.toFixed(5)}, {p.centroidLongitude.toFixed(5)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-surface-subtle border-t-2 border-border-ui flex items-center justify-end gap-3">
          {onReassignDa && (
            <button
              type="button"
              onClick={() => {
                onClose()
                onReassignDa(farmer.id)
              }}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-mono font-bold uppercase transition-colors cursor-pointer shadow-xs"
            >
              {t('reassign_da_btn')}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
