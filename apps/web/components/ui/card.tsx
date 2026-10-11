'use client'

import React from 'react'
import { Badge } from './badge'

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
    default: 'bg-surface border border-border shadow-md rounded-2xl',
    subtle: 'bg-surface-subtle border border-border rounded-2xl',
    elevated: 'bg-white border border-border/80 shadow-xl rounded-3xl',
    glass: 'glass-panel border border-white/60 shadow-xl rounded-3xl backdrop-blur-md',
  }[variant]

  const glowStyle = glow ? 'ambient-glow-primary' : ''

  return (
    <div className={`p-5 sm:p-6 transition-all ${variantStyles} ${glowStyle} ${className}`} {...props}>
      {children}
    </div>
  )
}

export interface CardHeaderProps {
  title: string
  subtitle?: string
  badge?: string
  action?: React.ReactNode
}

export function CardHeader({ title, subtitle, badge, action }: CardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-5 pb-4 border-b border-border-subtle">
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-base sm:text-lg font-bold text-text-primary tracking-tight font-mono uppercase">
            {title}
          </h2>
          {badge && <Badge variant="primary">{badge}</Badge>}
        </div>
        {subtitle && <p className="text-xs text-text-muted mt-1 font-mono">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}
