'use client'

import React from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { FarmerSidebar } from '@/components/dashboard/FarmerSidebar'

export default function FarmerDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout sidebar={<FarmerSidebar />}>
      {children}
    </DashboardLayout>
  )
}
