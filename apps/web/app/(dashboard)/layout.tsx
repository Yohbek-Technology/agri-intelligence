'use client'

import React from 'react'
import { useAuthSession } from '../../src/hooks/use-auth-session'
import { DashboardHeader } from '../../src/components/dashboard/dashboard-header'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, role, signOut } = useAuthSession()

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <div>
        <DashboardHeader
          userName={user?.name}
          phoneNumber={user?.phoneNumber}
          role={role || 'user'}
          onSignOut={signOut}
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </main>
      </div>

      <footer className="border-t-[1.5px] border-border bg-surface py-3 px-4 text-center font-mono text-[10px] text-text-faint">
        Autonomous Agricultural Intelligence & Extension System • Active Session Guard
      </footer>
    </div>
  )
}
