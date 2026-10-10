import React from 'react'

export interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'primary' | 'accent' | 'danger' | 'surface'
  className?: string
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variantStyles = {
    default: 'bg-surface text-text-primary border-border',
    primary: 'bg-primary text-background border-border-strong',
    accent: 'bg-accent text-background border-border-strong',
    danger: 'bg-danger text-background border-danger-subtle',
    surface: 'bg-surface-subtle text-text-muted border-border',
  }[variant]

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-mono tracking-wider uppercase border-[1px] rounded-[2px] ${variantStyles} ${className}`}
    >
      {children}
    </span>
  )
}
