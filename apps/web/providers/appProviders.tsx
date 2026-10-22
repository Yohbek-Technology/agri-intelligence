'use client'

import React from 'react'
import { QueryProvider } from './queryProvider'
import { AuthProvider } from './authProvider'
import { Toaster } from '@/components/ui/toast'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>{children}</AuthProvider>
      <Toaster />
    </QueryProvider>
  )
}
