'use client'

import React from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { DaSidebar } from '@/components/dashboard/DaSidebar'

export default function DaDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout sidebar={<DaSidebar />}>
      {children}
    </DashboardLayout>
  )
}
