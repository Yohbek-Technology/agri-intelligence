import React from 'react'

export interface NoticeProps {
  children: React.ReactNode
  variant?: 'danger' | 'info' | 'warning' | 'success'
  title?: string
  className?: string
}

export function Notice({ children, variant = 'info', title, className = '' }: NoticeProps) {
  const styles = {
    danger: {
      container: 'bg-surface border-danger text-text-primary',
      badge: 'text-danger border-danger',
      prefix: '[ALERT-ERR]',
    },
    warning: {
      container: 'bg-surface border-accent text-text-primary',
      badge: 'text-accent border-accent',
      prefix: '[CAUTION]',
    },
    info: {
      container: 'bg-surface border-primary text-text-primary',
      badge: 'text-primary border-primary',
      prefix: '[SYS-INFO]',
    },
    success: {
      container: 'bg-surface border-primary-subtle text-text-primary',
      badge: 'text-primary-subtle border-primary-subtle',
      prefix: '[CONFIRMED]',
    },
  }[variant]

  return (
    <div className={`border-l-[3px] border-[1px] p-3 sm:p-4 rounded-[2px] ${styles.container} ${className}`}>
      <div className="flex items-start gap-2.5">
        <span className={`font-mono text-[10px] tracking-wider px-1 border-[1px] rounded-[2px] ${styles.badge}`}>
          {styles.prefix}
        </span>
        <div className="flex-1 text-xs">
          {title && <h4 className="font-semibold uppercase tracking-wider mb-0.5">{title}</h4>}
          <div className="text-text-muted leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  )
}
