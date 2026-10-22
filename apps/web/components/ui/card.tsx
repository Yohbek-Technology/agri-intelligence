'use client'

import React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle' | 'elevated' | 'glass'
  glow?: boolean
}

export function Card({
  children,
  variant = 'default',
  glow = false,
  className = '',
  ...props
}: CardProps) {
  const variantStyles = {
    default:  'bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.03)] rounded-2xl',
    subtle:   'bg-surface-subtle rounded-2xl',
    elevated: 'bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] rounded-2xl',
    glass:    'glass-panel border border-white/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] rounded-2xl backdrop-blur-md',
  }[variant]

  const glowStyle = glow ? 'ambient-glow-primary' : ''

  const borderStyle = variant !== 'glass'
    ? { border: '1.5px solid var(--color-border-ui)' }
    : {}

  return (
    <div
      className={`p-5 sm:p-6 transition-all ${variantStyles} ${glowStyle} ${className}`}
      style={borderStyle}
      {...props}
    >
      {children}
    </div>
  )
}

export interface CardHeaderProps {
  title: string
  subtitle?: string
  badge?: React.ReactNode
  action?: React.ReactNode
}

export function CardHeader({ title, subtitle, badge, action }: CardHeaderProps) {
  return (
    <div
      className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-5 pb-4"
      style={{ borderBottom: '1.5px solid var(--color-border-ui)' }}
    >
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-base sm:text-lg font-bold text-text-primary tracking-tight font-mono uppercase">
            {title}
          </h2>
          {badge}
        </div>
        {subtitle && <p className="text-xs text-text-muted mt-1 font-mono">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}
