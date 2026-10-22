'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useKebeleManagement } from '@/hooks/useKebeles'
import { KebeleDrawer } from '@/components/officer/KebeleDrawer'
import { StaffDrawer } from '@/components/officer/StaffDrawer'
import { ListSkeleton } from '@/components/ui/skeleton'
import { MapPin, Edit, Trash2, Plus, Users, UserX, UserCheck } from 'lucide-react'

const UI_BORDER = '2px solid var(--color-border-ui)'
const SHADOW = '0 1px 2px rgba(0,0,0,0.03)'

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.055 } } }
const item = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.22 } } }

export default function TerritoryStaffPage() {
  const t = useTranslations('OfficerPages')

  const {
    activeTab,
    setActiveTab,
    kebeles,
    staffList,
    kebelesLoading,
    staffLoading,
    kebelesError,
    staffError,
    kebeleDrawer,
    staffDrawer,
    setKebeleDrawer,
    setStaffDrawer,
    handleKebeleSubmit,
    handleDeleteKebele,
    handleStaffSubmit,
    handleDeactivate,
    handleReactivate,
    isReactivating,
    isDeactivating,
    isKebeleSubmitting,
    isStaffSubmitting,
    kebeleDrawerError,
    staffDrawerError,
  } = useKebeleManagement()

  return (
    <div className="px-2.5 py-3 sm:p-6 lg:p-8 w-full space-y-4 sm:space-y-6">

      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
      >
        <h1 className="text-2xl font-bold text-text-primary">{t('kebeles_title')}</h1>
        <p className="text-sm text-text-muted mt-1">{t('kebeles_subtitle')}</p>
      </motion.div>

      {/* Tab bar + Add button */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, delay: 0.06 }}
        className="flex items-center justify-between gap-2 sm:gap-4"
        style={{ borderBottom: UI_BORDER }}
      >
        <div className="flex gap-1">
          {(['kebeles', 'staff'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={[
                'px-2.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium border-b-2 cursor-pointer transition-colors whitespace-nowrap',
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text-primary',
              ].join(' ')}
            >
              {tab === 'kebeles' ? t('kebeles_panel') : t('staff_panel')}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.button
            key={activeTab}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.15 }}
            type="button"
            onClick={() => {
              if (activeTab === 'kebeles') setKebeleDrawer({ open: true, mode: 'create' })
              else setStaffDrawer({ open: true, mode: 'create' })
            }}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 mb-0.5 rounded-xl text-xs sm:text-sm font-medium text-white bg-primary hover:bg-primary-hover transition-colors cursor-pointer whitespace-nowrap shadow-sm"
          >
            <Plus size={15} />
            {activeTab === 'kebeles' ? t('kebeles_add') : t('staff_add')}
          </motion.button>
        </AnimatePresence>
      </motion.div>

      {/* Tab content */}
      <AnimatePresence mode="wait">

        {/* ── KEBELES TAB ──────────────────────────────────────────────── */}
        {activeTab === 'kebeles' && (
          <motion.div
            key="kebeles"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {kebelesError && (
              <div className="p-4 bg-danger-light rounded-xl text-sm text-danger mb-4" style={{ border: UI_BORDER }}>
                {kebelesError}
              </div>
            )}

            <div
              className="bg-surface rounded-xl overflow-hidden"
              style={{ border: UI_BORDER, boxShadow: SHADOW }}
            >
              <div className="px-3.5 py-2.5 sm:px-5 sm:py-3.5" style={{ borderBottom: UI_BORDER }}>
                <span className="text-sm font-semibold text-text-primary">
                  {kebelesLoading ? '—' : `${kebeles.length} kebele${kebeles.length !== 1 ? 's' : ''}`}
                </span>
              </div>

              <div className="p-2.5 sm:p-4">
                {kebelesLoading ? (
                  <ListSkeleton rows={5} />
                ) : kebeles.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-14 text-text-muted text-sm space-y-2"
                  >
                    <MapPin className="mx-auto opacity-25" size={36} />
                    <p>{t('kebeles_no_data')}</p>
                  </motion.div>
                ) : (
                  <motion.ul variants={stagger} initial="hidden" animate="visible">
                    {kebeles.map((k, i) => (
                      <motion.li
                        key={k.id}
                        variants={item}
                        layout
                        className="flex items-center justify-between py-2.5 sm:py-3 gap-2 sm:gap-4"
                        style={i < kebeles.length - 1 ? { borderBottom: UI_BORDER } : {}}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center shrink-0">
                            <MapPin size={15} className="text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-text-primary truncate">{k.name}</p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              {k.boundary ? (
                                <span className="text-[10px] font-mono text-primary bg-primary-light px-2 py-0.5 rounded-full" style={{ border: UI_BORDER }}>
                                  {t('kebeles_multipolygon')}
                                </span>
                              ) : k.centroidLatitude ? (
                                <span className="text-xs text-text-faint font-mono">
                                  {Number(k.centroidLatitude).toFixed(4)}, {Number(k.centroidLongitude).toFixed(4)}
                                </span>
                              ) : null}
                              {k.radiusMeters ? (
                                <span className="text-xs text-text-faint">{k.radiusMeters}m radius</span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => setKebeleDrawer({ open: true, mode: 'edit', row: k })}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-subtle transition-colors cursor-pointer"
                            aria-label="Edit kebele"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteKebele(k)}
                            disabled={isKebeleSubmitting}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-danger hover:bg-danger-light transition-colors cursor-pointer disabled:opacity-40"
                            aria-label="Delete kebele"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </motion.li>
                    ))}
                  </motion.ul>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── STAFF TAB ────────────────────────────────────────────────── */}
        {activeTab === 'staff' && (
          <motion.div
            key="staff"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {staffError && (
              <div className="p-4 bg-danger-light rounded-xl text-sm text-danger mb-4" style={{ border: UI_BORDER }}>
                {staffError}
              </div>
            )}

            <div
              className="bg-surface rounded-xl overflow-hidden"
              style={{ border: UI_BORDER, boxShadow: SHADOW }}
            >
              <div className="px-3.5 py-2.5 sm:px-5 sm:py-3.5" style={{ borderBottom: UI_BORDER }}>
                <span className="text-sm font-semibold text-text-primary">
                  {staffLoading ? '—' : `${staffList.length} member${staffList.length !== 1 ? 's' : ''}`}
                </span>
              </div>

              <div className="p-2.5 sm:p-4">
                {staffLoading ? (
                  <ListSkeleton rows={5} />
                ) : staffList.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-14 text-text-muted text-sm space-y-2"
                  >
                    <Users className="mx-auto opacity-25" size={36} />
                    <p>{t('staff_no_data')}</p>
                  </motion.div>
                ) : (
                  <motion.ul variants={stagger} initial="hidden" animate="visible">
                    {staffList.map((m, i) => (
                      <motion.li
                        key={m.id}
                        variants={item}
                        layout
                        className="flex items-center justify-between py-2.5 sm:py-3 gap-2 sm:gap-4"
                        style={i < staffList.length - 1 ? { borderBottom: UI_BORDER } : {}}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-text-primary truncate">{m.name}</p>
                            <span
                              className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${
                                m.role === 'da' ? 'bg-accent-light text-accent' : 'bg-primary-light text-primary'
                              }`}
                              style={{ border: UI_BORDER }}
                            >
                              {m.role.toUpperCase()}
                            </span>
                            {m.banned && (
                              <span
                                className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-danger-light text-danger whitespace-nowrap"
                                style={{ border: UI_BORDER }}
                              >
                                {t('staff_inactive')}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-text-muted mt-0.5">
                            {m.phoneNumber ?? '—'} · {m.preferredLanguage.toUpperCase()}
                          </p>
                          {m.assignedKebeleIds.length > 0 && (
                            <p className="text-xs text-text-faint mt-0.5">
                              {m.assignedKebeleIds.length > 1
                                ? t('staff_kebeles_assigned', { count: m.assignedKebeleIds.length })
                                : t('staff_kebele_assigned')}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => setStaffDrawer({ open: true, mode: 'edit', row: m })}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-subtle transition-colors cursor-pointer"
                            aria-label="Edit staff"
                          >
                            <Edit size={14} />
                          </button>
                          {m.banned ? (
                            <button
                              type="button"
                              onClick={() => handleReactivate(m.id)}
                              disabled={isReactivating}
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-success hover:bg-success-light transition-colors cursor-pointer disabled:opacity-40"
                              aria-label="Reactivate"
                            >
                              <UserCheck size={14} />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleDeactivate(m)}
                              disabled={isDeactivating}
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-danger hover:bg-danger-light transition-colors cursor-pointer disabled:opacity-40"
                              aria-label="Deactivate"
                            >
                              <UserX size={14} />
                            </button>
                          )}
                        </div>
                      </motion.li>
                    ))}
                  </motion.ul>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drawers */}
      <AnimatePresence>
        {kebeleDrawer.open && (
          <KebeleDrawer
            mode={kebeleDrawer.mode}
            initial={kebeleDrawer.mode === 'edit' ? kebeleDrawer.row : null}
            onClose={() => setKebeleDrawer({ open: false })}
            onSubmit={handleKebeleSubmit}
            isSubmitting={isKebeleSubmitting}
            error={kebeleDrawerError}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {staffDrawer.open && (
          <StaffDrawer
            mode={staffDrawer.mode}
            initial={staffDrawer.mode === 'edit' ? staffDrawer.row : null}
            kebeles={kebeles}
            onClose={() => setStaffDrawer({ open: false })}
            onSubmit={handleStaffSubmit}
            isSubmitting={isStaffSubmitting}
            error={staffDrawerError}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
