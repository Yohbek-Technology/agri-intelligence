import React from 'react'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-background">
      <header className="border-b-[1.5px] border-border-strong bg-surface py-3 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between font-mono text-xs">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold tracking-tight text-text-primary uppercase hover:text-primary transition-colors"
          >
            <span className="w-5 h-5 bg-primary text-background flex items-center justify-center text-[10px] rounded-[1px]">
              AG
            </span>
            <span>AgriIntelligence Terminal</span>
          </Link>

          <Link
            href="/"
            className="text-text-muted hover:text-text-primary underline decoration-dotted text-[11px]"
          >
            ← Public Portal
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      <footer className="border-t-[1.5px] border-border bg-surface py-3 px-4 text-center font-mono text-[10px] text-text-faint">
        Autonomous Agricultural Intelligence & Extension System • Adama Municipal Jurisdiction
      </footer>
    </div>
  )
}
