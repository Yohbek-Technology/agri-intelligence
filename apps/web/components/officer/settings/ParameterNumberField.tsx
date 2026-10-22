import React from 'react'
import { Input } from '@/components/ui/input'

interface ParameterNumberFieldProps {
  label: string
  value: number | undefined
  onChange: (value: number | undefined) => void
  unit?: string
  min?: number
  max?: number
  step?: number
  readOnly?: boolean
  error?: string
  hint?: string
}

export function ParameterNumberField({
  label,
  value,
  onChange,
  unit,
  min,
  max,
  step = 1,
  readOnly = false,
  error,
  hint,
}: ParameterNumberFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    if (v === '') {
      onChange(undefined)
    } else {
      const n = parseFloat(v)
      if (!isNaN(n)) onChange(n)
    }
  }

  return (
    <Input
      label={unit ? `${label} (${unit})` : label}
      type="number"
      value={value ?? ''}
      onChange={handleChange}
      min={min}
      max={max}
      step={step}
      readOnly={readOnly}
      disabled={readOnly}
      error={error}
      hint={hint}
    />
  )
}
