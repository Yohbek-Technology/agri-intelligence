'use client'

import React from 'react'
import { motion } from 'framer-motion'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  fullWidth?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      disabled,
      className = '',
      type = 'button',
      onClick,
      id,
      title,
      form,
      name,
      value,
    },
    ref
  ) => {
    const variantStyles = {
      primary:
        'bg-primary text-[#151A14] hover:bg-primary-hover shadow-md hover:shadow-lg hover:shadow-primary/25 border border-primary-subtle',
      secondary:
        'bg-white text-text-primary hover:bg-surface-subtle border border-border hover:border-border-strong shadow-sm',
      accent:
        'bg-accent text-white hover:bg-accent-hover shadow-md hover:shadow-lg hover:shadow-accent/25 border border-accent-subtle',
      outline:
        'bg-transparent text-text-primary border-2 border-border-strong hover:bg-surface-subtle shadow-sm',
      ghost:
        'bg-transparent text-text-primary hover:bg-surface-subtle border border-transparent',
      danger:
        'bg-danger text-white hover:bg-danger-subtle shadow-md hover:shadow-danger/25 border border-danger-subtle',
    }[variant]

    const sizeStyles = {
      sm: 'h-10 px-4 text-xs rounded-xl gap-1.5',
      md: 'h-12 px-5 text-sm rounded-xl gap-2 min-h-[48px]',
      lg: 'h-14 px-7 text-base rounded-2xl gap-2.5 min-h-[56px]',
    }[size]

    return (
      <motion.button
        ref={ref}
        type={type}
        id={id}
        title={title}
        form={form}
        name={name}
        value={value}
        onClick={onClick}
        whileHover={disabled || isLoading ? undefined : { scale: 1.02 }}
        whileTap={disabled || isLoading ? undefined : { scale: 0.98 }}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center font-medium transition-all select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles} ${sizeStyles} ${
          fullWidth ? 'w-full' : ''
        } ${className}`}
      >
        {isLoading ? (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </motion.button>
    )
  }
)
Button.displayName = 'Button'
