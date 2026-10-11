'use client'

import React from 'react'
import { QueryProvider } from './queryProvider'
import { AuthProvider } from './authProvider'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>{children}</AuthProvider>
    </QueryProvider>
  )
}
