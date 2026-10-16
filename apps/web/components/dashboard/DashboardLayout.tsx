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
  const closeMobile = useCallback(() => setMobileOpen(false), [])
  const toggleMobile = useCallback(() => setMobileOpen((p) => !p), [])

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-shell">
      <DashboardTopbar user={user} onSignOut={signOut} onMenuToggle={toggleMobile} />

      <div className="flex flex-1 min-h-0 relative overflow-hidden">

        {/* Desktop sidebar */}
        <div className="hidden lg:flex lg:shrink-0 h-full">
          {sidebar}
        </div>

        {/* Mobile backdrop */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={closeMobile} />
        )}

        {/* Mobile drawer */}
        <div className={`fixed top-0 left-0 h-full z-50 lg:hidden transition-transform duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          {/* Clone sidebar with onClose */}
          {React.isValidElement(sidebar)
            ? React.cloneElement(sidebar as React.ReactElement<{ onClose?: () => void }>, { onClose: closeMobile })
            : sidebar
          }
        </div>

        {/* Main content */}
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
