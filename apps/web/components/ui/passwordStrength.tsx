'use client'

import React from 'react'

const PASSWORD_COMPLEXITY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{10,}$/

interface PasswordStrengthProps {
  password: string
}

function getStrength(password: string): 'weak' | 'medium' | 'strong' {
  if (PASSWORD_COMPLEXITY_REGEX.test(password)) return 'strong'
  if (password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password)) return 'medium'
  return 'weak'
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password || password.length === 0) return null

  const strength = getStrength(password)

  const segments = [
    {
      active: true,
      color:
        strength === 'weak'
          ? 'bg-[var(--color-danger)]'
          : strength === 'medium'
          ? 'bg-[var(--color-accent)]'
          : 'bg-[var(--color-success)]',
    },
    {
      active: strength !== 'weak',
      color: strength === 'medium' ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-success)]',
    },
    {
      active: strength === 'strong',
      color: 'bg-[var(--color-success)]',
    },
  ]

  const label = strength === 'weak' ? 'Weak' : strength === 'medium' ? 'Medium' : 'Strong'
  const labelColor =
    strength === 'weak'
      ? 'text-[var(--color-danger)]'
      : strength === 'medium'
      ? 'text-[var(--color-accent)]'
      : 'text-[var(--color-success)]'

  return (
    <div className="w-full space-y-1.5">
      <div className="flex gap-1">
        {segments.map((seg, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${
              seg.active ? seg.color : 'bg-[var(--color-border)]'
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-mono font-semibold mt-1 ${labelColor}`}>{label} password</p>
    </div>
  )
}
