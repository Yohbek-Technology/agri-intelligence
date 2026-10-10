import type { Metadata } from 'next'
import './globals.css'
import { AppProviders } from '../src/providers/app-providers'

export const metadata: Metadata = {
  title: 'AgriIntelligence — Autonomous Agricultural Intelligence & Extension System',
  description:
    'Highland agricultural operating system for smallholder field telemetry, Gemini disease diagnostics, 7-day micro-weather, and fertilizer distribution.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-text-primary antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
