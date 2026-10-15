'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Bell, ChevronDown, User, Settings, LogOut, Menu } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { BrandLogo } from '@/components/ui/brandLogo'
import { LocaleSwitcher } from '@/components/ui/localeSwitcher'
import { NotificationPanel } from '@/components/dashboard/NotificationPanel'
import type { AuthUser } from '@repo/shared'

interface Props {
  user: AuthUser | null | undefined
  onSignOut: () => void
  onMenuToggle: () => void
}

export function FarmerTopbar({ user, onSignOut, onMenuToggle }: Props) {
  const t = useTranslations('Dashboard')
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const bellRef = useRef<HTMLButtonElement>(null)

  const initials  = user?.name?.charAt(0).toUpperCase() ?? 'F'
  const shortName = user?.name?.split(' ')[0] ?? 'Farmer'
  const phone     = user?.phoneNumber ?? '—'

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  return (
    <header className="flex items-center justify-between px-4 h-14 shrink-0 w-full z-30 bg-transparent">

      {/* Left: logo only */}
      <div className="flex items-center">
        <BrandLogo size="xs" showSubtitle={false} className="py-0" />
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">

        {/* Language switcher — desktop only, moved to sidebar on mobile */}
        <div className="hidden lg:block">
          <LocaleSwitcher />
        </div>

        {/* Bell + notification panel */}
        <div className="relative overflow-visible">
          <button
            ref={bellRef}
            type="button"
            onClick={() => { setNotifOpen((p) => !p); setProfileOpen(false) }}
            className="relative w-9 h-9 flex items-center justify-center cursor-pointer rounded-lg
              bg-shell-hover border border-shell-border text-on-shell
              hover:bg-shell-active hover:text-on-shell-strong transition-colors overflow-visible"
            aria-label={t('notifications')}
          >
            <Bell size={17} />
            <span className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 min-w-[16px] h-4 px-1 text-[9px] font-mono font-bold
              flex items-center justify-center bg-danger text-white rounded-md z-10">
              3
            </span>
          </button>
          <NotificationPanel
            open={notifOpen}
            onClose={() => setNotifOpen(false)}
            anchorRef={bellRef}
          />
        </div>

        {/* Profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => { setProfileOpen((p) => !p); setNotifOpen(false) }}
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 cursor-pointer rounded-lg
              bg-shell-hover border border-shell-border
              hover:bg-shell-active transition-colors"
          >
            <div className="w-7 h-7 flex items-center justify-center text-xs font-mono
              font-bold shrink-0 rounded-md bg-primary text-primary-light">
              {initials}
            </div>
            <div className="hidden sm:block leading-none text-left">
              <div className="text-sm font-semibold text-on-shell-strong leading-tight">
                {shortName}
              </div>
              <div className="text-xs font-mono text-on-shell-faint leading-tight mt-[1px]">
                {phone}
              </div>
            </div>
            <ChevronDown
              size={13}
              className="text-on-shell-faint transition-transform duration-150 hidden sm:block"
              style={{ transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.13 }}
                className="absolute right-0 mt-1.5 w-52 py-1 z-50
                  bg-surface border border-border rounded-xl shadow-xl"
              >
                <div className="px-4 py-3 border-b border-border">
                  <div className="text-sm font-semibold text-text-primary">{user?.name ?? 'Farmer'}</div>
                  <div className="text-xs font-mono mt-0.5 text-text-muted">{phone}</div>
                </div>

                <button
                  type="button"
                  onClick={() => setProfileOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 cursor-pointer
                    text-text-muted hover:bg-surface-subtle transition-colors"
                >
                  <User size={15} />
                  <span className="text-sm font-medium">Profile &amp; Consent</span>
                </button>

                <button
                  type="button"
                  onClick={() => setProfileOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 cursor-pointer
                    text-text-muted hover:bg-surface-subtle transition-colors"
                >
                  <Settings size={15} />
                  <span className="text-sm font-medium">Settings</span>
                </button>

                <div className="my-1 border-t border-border" />

                <button
                  type="button"
                  onClick={() => { setProfileOpen(false); onSignOut() }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 cursor-pointer
                    text-danger hover:bg-danger-light transition-colors"
                >
                  <LogOut size={15} />
                  <span className="text-sm font-medium">{t('signOut')}</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile sidebar toggle — rightmost, mobile only */}
        <button
          type="button"
          onClick={onMenuToggle}
          className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg cursor-pointer
            bg-shell-hover border border-shell-border text-on-shell hover:bg-shell-active transition-colors"
          aria-label="Open menu"
        >
          <Menu size={17} />
        </button>

      </div>
    </header>
  )
}
