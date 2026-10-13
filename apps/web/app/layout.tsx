import type { Metadata } from 'next'
import { AppProviders } from '../providers/appProviders'
import './globals.css'

export const metadata: Metadata = {
  title: 'AgriIntel | Autonomous Agricultural Extension Operating System',
  description:
    'Autonomous Agricultural Intelligence and Extension Operating System for Highland Vertisol Agronomy, Adama Woreda Municipal Extension Branch.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-background text-text-primary min-h-screen antialiased flex flex-col">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
