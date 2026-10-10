import React from 'react'

export interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`bg-surface border-[1.5px] border-border rounded-[2px] p-5 sm:p-7 transition-all duration-150 ${className}`}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  title,
  subtitle,
  badge,
  action,
}: {
  title: string
  subtitle?: string
  badge?: string
  action?: React.ReactNode
}) {
  return (
    <div className="pb-4 mb-5 border-b-[1px] border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <div>
        <div className="flex items-center gap-2">
          {badge && (
            <span className="font-mono text-[10px] text-text-muted px-1.5 py-0.5 bg-surface-subtle border-[1px] border-border rounded-[2px]">
              {badge}
            </span>
          )}
          <h2 className="text-base sm:text-lg font-semibold tracking-tight text-text-primary uppercase font-mono">
            {title}
          </h2>
        </div>
        {subtitle && <p className="text-xs text-text-muted mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
