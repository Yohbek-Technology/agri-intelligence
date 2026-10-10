import React, { forwardRef } from 'react'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: SelectOption[]
  error?: string
  badge?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, options, error, badge, className = '', id, ...props },
  ref
) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className="w-full space-y-1.5">
      {(label || badge) && (
        <div className="flex items-center justify-between text-xs">
          {label && (
            <label htmlFor={selectId} className="font-medium text-text-primary uppercase tracking-wider text-[11px]">
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
        <select
          id={selectId}
          ref={ref}
          className={`w-full min-h-[48px] px-3.5 py-2.5 text-sm bg-surface text-text-primary border-[1.5px] ${
            error ? 'border-danger' : 'border-border focus:border-border-strong'
          } rounded-[2px] transition-all duration-150 focus:outline-none focus:bg-background focus:shadow-[2px_2px_0px_0px_#2E332A] cursor-pointer appearance-none ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-text-muted">
          <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>

      {error && (
        <p className="text-xs font-mono text-danger flex items-center gap-1 mt-1">
          <span>[!]</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  )
})
