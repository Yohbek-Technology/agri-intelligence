import React from 'react'
import Link from 'next/link'
import { BrandLogo } from '../../components/ui/brandLogo'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface-subtle to-background flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

      <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-2">
        <BrandLogo size="md" />
        <Link
          href="/"
          className="text-xs font-mono font-semibold text-text-muted hover:text-text-primary px-3 py-1.5 rounded-xl border border-border bg-surface shadow-sm transition-all"
        >
          ← Return to Public Portal
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center py-6 sm:py-10 relative z-10">
        {children}
      </main>

      <footer className="w-full max-w-5xl mx-auto py-2 text-center text-[11px] font-mono text-text-muted">
        Autonomous Agricultural Intelligence & Extension System // Adama Jurisdiction
      </footer>
    </div>
  )
}
