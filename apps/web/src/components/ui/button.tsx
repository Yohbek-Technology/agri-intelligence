import React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'outline' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
  isLoading?: boolean
  fullWidth?: boolean
}

export function Button({
  children,
  variant = 'primary',
  size = 'default',
  isLoading = false,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-[2px] border-[1.5px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none'

  const sizeStyles = {
    sm: 'min-h-[40px] px-3 py-1.5 text-xs tracking-wide',
    default: 'min-h-[48px] px-5 py-2.5 text-sm tracking-wide',
    lg: 'min-h-[56px] px-7 py-3 text-base tracking-wide',
  }[size]

  const variantStyles = {
    primary:
      'bg-primary text-background border-border-strong hover:bg-primary-hover hover:shadow-[2px_2px_0px_0px_#2E332A] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none',
    secondary:
      'bg-surface text-text-primary border-border-strong hover:bg-surface-subtle hover:shadow-[2px_2px_0px_0px_#2E332A] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none',
    accent:
      'bg-accent text-background border-border-strong hover:bg-accent-hover hover:shadow-[2px_2px_0px_0px_#2E332A] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none',
    danger:
      'bg-danger text-background border-danger-subtle hover:bg-danger-subtle hover:shadow-[2px_2px_0px_0px_#2E332A] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none',
    outline:
      'bg-transparent text-text-primary border-border-strong hover:bg-surface hover:shadow-[2px_2px_0px_0px_#2E332A] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none',
    ghost:
      'bg-transparent text-text-muted border-transparent hover:text-text-primary hover:bg-surface-subtle',
  }[variant]

  const widthStyle = fullWidth ? 'w-full' : ''

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${widthStyle} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full" />
          <span>Processing...</span>
        </span>
      ) : (
        children
      )}
    </button>
  )
}
