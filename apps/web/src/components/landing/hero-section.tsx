import React from 'react'
import Link from 'next/link'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'

export interface HeroSectionProps {
  isAuthenticated: boolean
  dashboardPath: string
  role?: string | null
}

export function HeroSection({
  isAuthenticated,
  dashboardPath,
  role,
}: HeroSectionProps) {
  return (
    <section className="py-12 sm:py-20 border-b-[1.5px] border-border-strong bg-surface">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-4">
          <Badge variant="primary">[OPERATING SYSTEM: HIGH-VERTISOL]</Badge>
          <Badge variant="accent">[ADAMA MUNICIPAL JURISDICTION]</Badge>
          <Badge variant="surface">[SMS + CREDENTIAL GATEWAY]</Badge>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold uppercase font-mono tracking-tight text-text-primary leading-[1.1] mb-6">
          Autonomous Agricultural Intelligence & Extension System
        </h1>

        <p className="text-base sm:text-lg text-text-muted max-w-3xl leading-relaxed mb-8">
          A highland agricultural operating system unifying smallholder field telemetry, multimodal Gemini pest diagnostics, 7-day micro-weather intelligence, and municipal fertilizer distribution for the Adama agricultural basin.
        </p>

        {isAuthenticated ? (
          <div className="p-4 bg-background border-[2px] border-primary rounded-[2px] inline-flex flex-col sm:flex-row items-center gap-4 text-left">
            <div>
              <span className="font-mono text-xs font-bold text-primary uppercase block">
                [ACTIVE TERMINAL SESSION DETECTED]
              </span>
              <p className="text-xs text-text-muted font-mono">
                Authenticated as: <span className="font-bold text-text-primary uppercase">{role || 'User'}</span>
              </p>
            </div>
            <Link href={dashboardPath}>
              <Button variant="primary" className="font-mono text-xs uppercase whitespace-nowrap">
                Enter Role Workspace →
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center sm:justify-start">
            <Link href="/sign-in" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" fullWidth className="font-mono text-sm uppercase">
                Terminal Sign-In →
              </Button>
            </Link>
            <Link href="/sign-up" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" fullWidth className="font-mono text-sm uppercase">
                Register New Farm Profile
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
