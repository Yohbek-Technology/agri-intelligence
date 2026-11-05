'use client'

import React, { useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Bell, CloudLightning, Stethoscope,
  MessageSquare, Megaphone, CheckCircle, AlertTriangle,
} from 'lucide-react'

const UI_BORDER = '2px solid var(--color-border-ui)'

export type NotificationKind = 'alert' | 'diagnosis' | 'message' | 'announcement' | 'success' | 'warning'

export interface Notification {
  id: string
  kind: NotificationKind
  title: string
  body: string
  time: string
  read: boolean
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', kind: 'alert',        title: 'Extreme Weather Alert',  body: 'Heavy downpour forecast for Adama tomorrow. Postpone spray window.',           time: '2m ago',  read: false },
  { id: '2', kind: 'diagnosis',    title: 'Diagnosis Ready',        body: 'Stripe rust detected on PLT-01. Immediate fungicide window open.',              time: '18m ago', read: false },
  { id: '3', kind: 'message',      title: 'DA Tsegaye replied',     body: 'Your grievance #GRV-04 has been assigned. Field visit scheduled.',              time: '1h ago',  read: false },
  { id: '4', kind: 'announcement', title: 'NPS Fertilizer Available',body: 'Adama depot has received 2,400 kg NPS. Contact your DA to request.',           time: '3h ago',  read: true  },
  { id: '5', kind: 'success',      title: 'Yield Gap Analysis Done',body: 'Your PLT-02 result is ready. Top cause: delayed 2nd Urea top-dress.',           time: '5h ago',  read: true  },
  { id: '6', kind: 'warning',      title: 'Sync Pending',           body: '4 field logs are waiting to sync. Connect to WiFi to upload.',                  time: '1d ago',  read: true  },
]

const KIND_META: Record<NotificationKind, { icon: React.ReactNode; bg: string; color: string }> = {
  alert:        { icon: <CloudLightning size={15} />, bg: 'bg-danger-light',   color: 'text-danger'    },
  diagnosis:    { icon: <Stethoscope size={15} />,    bg: 'bg-primary-light',  color: 'text-primary'   },
  message:      { icon: <MessageSquare size={15} />,  bg: 'bg-accent-light',   color: 'text-accent'    },
  announcement: { icon: <Megaphone size={15} />,      bg: 'bg-surface-subtle', color: 'text-text-muted'},
  success:      { icon: <CheckCircle size={15} />,    bg: 'bg-success-light',  color: 'text-success'   },
  warning:      { icon: <AlertTriangle size={15} />,  bg: 'bg-accent-light',   color: 'text-accent'    },
}

interface Props {
  open: boolean
  onClose: () => void
  anchorRef: React.RefObject<HTMLElement | null>
}

export function NotificationPanel({ open, onClose, anchorRef }: Props) {
  const t = useTranslations('Dashboard')
  const panelRef = useRef<HTMLDivElement>(null)
  const unread = MOCK_NOTIFICATIONS.filter((n) => !n.read).length
  const [, setTick] = React.useState(0)

  useEffect(() => {
    function handleOutside(e: MouseEvent | TouchEvent) {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        anchorRef.current && !anchorRef.current.contains(e.target as Node)
      ) {
        onClose()
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleOutside)
      document.addEventListener('touchstart', handleOutside, { passive: true })
      const handleResize = () => setTick((t) => t + 1)
      window.addEventListener('resize', handleResize)
      window.addEventListener('scroll', handleResize, true)
      return () => {
        document.removeEventListener('mousedown', handleOutside)
        document.removeEventListener('touchstart', handleOutside)
        window.removeEventListener('resize', handleResize)
        window.removeEventListener('scroll', handleResize, true)
      }
    }
  }, [open, onClose, anchorRef])

  const getStyle = (): React.CSSProperties => {
    if (typeof window === 'undefined') return {}
    const vw = window.innerWidth
    const isMobile = vw < 640
    const margin = isMobile ? 8 : 12
    const panelWidth = Math.min(380, vw - margin * 2)

    let top = 60
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect()
      top = rect.bottom + 8
    }

    let left: number
    if (isMobile) {
      // On mobile screens, center or clamp horizontally with safe margins
      // so the popup is completely on-screen and never clipped at either edge
      left = Math.max(margin, Math.min(Math.floor((vw - panelWidth) / 2), vw - panelWidth - margin))
    } else if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect()
      left = rect.right - panelWidth
      if (left + panelWidth > vw - margin) left = vw - panelWidth - margin
      if (left < margin) left = margin
    } else {
      left = Math.max(margin, vw - panelWidth - margin)
    }

    return {
      position: 'fixed',
      top,
      left,
      width: panelWidth,
      maxWidth: `calc(100vw - ${margin * 2}px)`,
      maxHeight: `calc(100vh - ${top + 16}px)`,
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: 8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.97 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="z-[999] bg-surface rounded-2xl shadow-2xl overflow-hidden"
          style={{ ...getStyle(), border: UI_BORDER }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: UI_BORDER }}>
            <div className="flex items-center gap-2.5">
              <Bell size={16} className="text-text-muted" />
              <span className="text-base font-semibold text-text-primary">{t('notifications')}</span>
              {unread > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-danger text-white text-[10px] font-bold">
                  {unread}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer text-text-faint hover:text-text-primary hover:bg-surface-subtle transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {/* List */}
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 60px)', scrollbarWidth: 'none' }}>
            {MOCK_NOTIFICATIONS.map((n, i) => {
              const meta = KIND_META[n.kind]
              return (
                <div
                  key={n.id}
                  className={`flex gap-3 px-5 py-4 cursor-pointer transition-colors hover:bg-surface-subtle ${
                    !n.read ? 'bg-primary-light/30' : ''
                  }`}
                  style={i < MOCK_NOTIFICATIONS.length - 1 ? { borderBottom: UI_BORDER } : {}}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${meta.bg} ${meta.color}`}>
                    {meta.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold leading-tight ${n.read ? 'text-text-muted' : 'text-text-primary'}`}>
                        {n.title}
                      </p>
                      <span className="text-xs text-text-faint shrink-0 mt-0.5">{n.time}</span>
                    </div>
                    <p className="text-sm text-text-muted mt-0.5 leading-snug line-clamp-2">{n.body}</p>
                  </div>
                  {!n.read && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                </div>
              )
            })}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 bg-surface-subtle" style={{ borderTop: UI_BORDER }}>
            <button
              type="button"
              className="w-full text-sm text-text-muted hover:text-primary font-medium text-center cursor-pointer transition-colors"
            >
              {t('markAllRead')}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
