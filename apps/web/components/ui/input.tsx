'use client'

import React from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  success?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, success, leftIcon, rightIcon, id, className = '', ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-text-primary uppercase tracking-wider font-mono"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-text-muted pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full bg-surface text-text-primary text-sm rounded-xl border transition-all placeholder:text-text-faint min-h-[48px] focus:outline-none ${
              leftIcon ? 'pl-10' : 'pl-3.5'
            } ${rightIcon ? 'pr-10' : 'pr-3.5'} ${
              error
                ? 'border-danger focus:ring-2 focus:ring-danger/20'
                : success
                ? 'border-[var(--color-success)] focus:ring-2 focus:ring-[var(--color-success)]/20'
                : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/15'
            } ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 text-text-muted flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs font-medium text-danger flex items-center gap-1 font-mono">
            <span>⚠</span> {error}
          </p>
        ) : hint ? (
          <p className="text-xs text-text-muted font-mono">{hint}</p>
        ) : null}
      </div>
    )
  }
)
Input.displayName = 'Input'
