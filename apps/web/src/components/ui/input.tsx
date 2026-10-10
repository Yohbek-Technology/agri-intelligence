import React, { forwardRef } from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  badge?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, badge, className = '', id, ...props },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className="w-full space-y-1.5">
      {(label || badge) && (
        <div className="flex items-center justify-between text-xs">
          {label && (
            <label htmlFor={inputId} className="font-medium text-text-primary uppercase tracking-wider text-[11px]">
              {label}
            </label>
          )}
          {badge && (
            <span className="font-mono text-[10px] text-text-muted px-1.5 py-0.5 bg-surface border-[1px] border-border rounded-[2px]">
              {badge}
            </span>
          )}
        </div>
      )}

      <div className="relative">
        <input
          id={inputId}
          ref={ref}
          className={`w-full min-h-[48px] px-3.5 py-2.5 text-sm bg-surface text-text-primary placeholder:text-text-faint border-[1.5px] ${
            error ? 'border-danger' : 'border-border focus:border-border-strong'
          } rounded-[2px] transition-all duration-150 focus:outline-none focus:bg-background focus:shadow-[2px_2px_0px_0px_#2E332A] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
          {...props}
        />
      </div>

      {error && (
        <p className="text-xs font-mono text-danger flex items-center gap-1 mt-1">
          <span>[!]</span>
          <span>{error}</span>
        </p>
      )}

      {!error && hint && <p className="text-xs text-text-muted mt-1">{hint}</p>}
    </div>
  )
})
