'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthSession } from '../src/hooks/use-auth-session'
import { HeroSection } from '../src/components/landing/hero-section'
import { RegionalWeatherBar } from '../src/components/landing/regional-weather-bar'
import { CapabilitiesGrid } from '../src/components/landing/capabilities-grid'
import { SystemStatusBanner } from '../src/components/landing/system-status-banner'

export default function LandingPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading, dashboardPath, role } = useAuthSession()

  useEffect(() => {
    if (!isLoading && isAuthenticated && dashboardPath) {
      router.push(dashboardPath)
    }
  }, [isLoading, isAuthenticated, dashboardPath, router])

  return (
    <main className="min-h-screen flex flex-col justify-between bg-background">
      <div>
        <HeroSection
          isAuthenticated={isAuthenticated}
          dashboardPath={dashboardPath}
          role={role}
        />
        <RegionalWeatherBar />
        <CapabilitiesGrid />
      </div>
      <SystemStatusBanner />
    </main>
  )
}
