'use client'

import React from 'react'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: Array<{ value: string; label: string }>
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, id, className = '', ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold text-text-primary uppercase tracking-wider font-mono"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`w-full bg-surface text-text-primary text-sm rounded-xl min-h-[48px] px-3.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all cursor-pointer ${className}`}
          style={{
            border: error
              ? '2px solid var(--color-danger)'
              : '2px solid var(--color-border-ui)',
          }}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-xs font-medium text-danger font-mono">
            <span>⚠</span> {error}
          </p>
        )}
      </div>
    )
  }
)
Select.displayName = 'Select'
