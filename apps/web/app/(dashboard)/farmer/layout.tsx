'use client'

import React, { useState, useCallback } from 'react'
import { FarmerSidebar } from '@/components/dashboard/FarmerSidebar'
import { FarmerTopbar } from '@/components/dashboard/FarmerTopbar'
import { AiAssistantPopup } from '@/components/ai/aiAssistantPopup'
import { useAuthSession } from '@/hooks/useAuth'

export default function FarmerDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuthSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const closeMobile = useCallback(() => setMobileOpen(false), [])
  const toggleMobile = useCallback(() => setMobileOpen((p) => !p), [])

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-shell">

      {/* Topbar — always full width on top */}
      <FarmerTopbar user={user} onSignOut={signOut} onMenuToggle={toggleMobile} />

      {/* Body */}
      <div className="flex flex-1 min-h-0 relative overflow-hidden">

        {/* ── Desktop sidebar — always visible ── */}
        <div className="hidden lg:flex lg:shrink-0 h-full">
          <FarmerSidebar />
        </div>

        {/* ── Mobile drawer overlay ── */}
        {/* Backdrop */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={closeMobile}
          />
        )}
        {/* Drawer panel — slides in from left, sits under topbar via top-0 + h-full */}
        <div
          className={`
            fixed top-0 left-0 h-full z-50 lg:hidden
            transition-transform duration-300 ease-in-out
            ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <FarmerSidebar onClose={closeMobile} />
        </div>

        {/* Main content card */}
        <main
          className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden bg-surface"
          style={{ borderRadius: '14px 14px 0 0', marginTop: '8px' }}
        >
          {children}
        </main>
      </div>

      <AiAssistantPopup />
    </div>
  )
}
