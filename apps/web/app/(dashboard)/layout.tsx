'use client'

import React from 'react'
import { useAuthSession } from '@/hooks/useAuth'
import { DashboardNavbar } from '@/components/navigation/dashboardNavbar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, role, signOut } = useAuthSession()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardNavbar
        userName={user?.name}
        phoneNumber={user?.phoneNumber}
        role={role || 'farmer'}
        onSignOut={signOut}
      />
      <main className="flex-1 pb-16">{children}</main>
    </div>
  )
}
