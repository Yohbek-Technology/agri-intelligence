'use client'

import React from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { OfficerSidebar } from '@/components/dashboard/OfficerSidebar'

export default function OfficerDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout sidebar={<OfficerSidebar />}>
      {children}
    </DashboardLayout>
  )
}
