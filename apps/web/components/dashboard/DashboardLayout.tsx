'use client'

import React, { useState, useCallback } from 'react'
import { DashboardTopbar } from '@/components/dashboard/DashboardTopbar'
import { AiAssistantPopup } from '@/components/ai/aiAssistantPopup'
import { useAuthSession } from '@/hooks/useAuth'

interface Props {
  children: React.ReactNode
  sidebar: React.ReactNode
}

export function DashboardLayout({ children, sidebar }: Props) {
  const { user, signOut } = useAuthSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const closeMobile  = useCallback(() => setMobileOpen(false), [])
  const toggleMobile = useCallback(() => setMobileOpen((p) => !p), [])

  return (
    <div className="flex flex-col h-screen h-[100dvh] overflow-hidden bg-shell">
      <DashboardTopbar user={user} onSignOut={signOut} onMenuToggle={toggleMobile} />

      {/* flex-1 so this row fills the remaining height */}
      <div className="flex flex-1 min-h-0 relative">

        {/* Desktop sidebar — does NOT use shrink-0 so flex allows it to naturally
            influence the main area width as it animates.
            The aside itself controls its own width via transition. */}
        <div className="hidden lg:flex h-full">
          {sidebar}
        </div>

        {/* Mobile backdrop */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={closeMobile}
          />
        )}

        {/* Mobile drawer */}
        <div
          className={`fixed top-0 left-0 h-full z-50 lg:hidden transition-transform duration-300 ease-in-out
            ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          {React.isValidElement(sidebar)
            ? React.cloneElement(
                sidebar as React.ReactElement<{ onClose?: () => void }>,
                { onClose: closeMobile },
              )
            : sidebar}
        </div>

        {/* Main content — flex-1 fills ALL remaining width after the sidebar.
            When sidebar collapses from 260px → 60px the extra 200px
            automatically flows into this element. */}
        <main
          className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden bg-surface pb-20"
          style={{ borderRadius: '14px 14px 0 0', marginTop: '8px' }}
        >
          {children}
        </main>
      </div>

      <AiAssistantPopup />
    </div>
  )
}
