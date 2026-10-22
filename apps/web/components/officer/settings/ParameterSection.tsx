import React from 'react'

interface ParameterSectionProps {
  title: string
  children: React.ReactNode
}

export function ParameterSection({ title, children }: ParameterSectionProps) {
  return (
    <section className="bg-surface rounded-2xl border border-border p-6 space-y-4">
      <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider font-mono">
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {children}
      </div>
    </section>
  )
}
