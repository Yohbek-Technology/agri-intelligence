'use client'

import { useAuthSession, useRoleGuard } from "@/hooks/useAuth"
import { useTranslations } from "next-intl"

export default function FarmerOverviewPage() {
  const t = useTranslations('Dashboard')
  const { user } = useAuthSession()
  const { isAuthorized, isLoading } = useRoleGuard(['farmer', 'FARMER'])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="text-sm text-text-faint tracking-widest animate-pulse">INITIALISING…</span>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="m-8 p-5 text-sm text-danger bg-danger-light border-2 border-danger rounded-xl">
        Access denied. Your role does not have access to the Farmer workspace.
      </div>
    )
  }

  return (
    <div className="w-full px-2.5 py-3 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-text-primary">
        {t('overview_greeting', { name: user?.name ?? user?.fullName ?? 'Farmer' })}
      </h1>
      <p className="mt-2 text-base text-text-muted">
        {t('overview_subtitle')}
      </p>
    </div>
  )
}
