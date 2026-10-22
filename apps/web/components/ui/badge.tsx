'use client'

import React from 'react'

export interface BadgeProps {
  children: React.ReactNode
  variant?: 'primary' | 'accent' | 'danger' | 'success' | 'surface' | 'neutral' | 'warning' | 'default'
  size?: 'sm' | 'md'
  dot?: boolean
}

export function Badge({
  children,
  variant = 'primary',
  size = 'md',
  dot = false,
}: BadgeProps) {
  const variantStyles = {
    primary: 'bg-primary-light text-primary border-primary/25',
    accent: 'bg-accent-light text-accent border-accent/25',
    danger: 'bg-danger-light text-danger border-danger/25',
    success: 'bg-success-light text-success border-success/25',
    warning: 'bg-amber-50 text-amber-700 border-amber-300',
    default: 'bg-surface-subtle text-text-muted border-border',
    surface: 'bg-white text-text-primary border-border shadow-xs',
    neutral: 'bg-surface-subtle text-text-muted border-border',
  }[variant]

  const sizeStyles = {
    sm: 'text-[10px] px-2.5 py-0.5',
    md: 'text-xs px-3 py-1',
  }[size]

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-medium rounded-full border-2 ${variantStyles} ${sizeStyles}`}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      )}
      {children}
    </span>
  )
}
