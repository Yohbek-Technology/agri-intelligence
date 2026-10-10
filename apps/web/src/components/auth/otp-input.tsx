import React from 'react'

export interface OtpInputProps {
  digits: string[]
  onChangeDigit: (index: number, value: string) => void
  onKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void
  onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void
  setInputRef: (el: HTMLInputElement | null, idx: number) => void
  disabled?: boolean
  error?: boolean
}

export function OtpInput({
  digits,
  onChangeDigit,
  onKeyDown,
  onPaste,
  setInputRef,
  disabled = false,
  error = false,
}: OtpInputProps) {
  return (
    <div className="flex items-center justify-between gap-1.5 sm:gap-2.5">
      {digits.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => setInputRef(el, idx)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          disabled={disabled}
          autoFocus={idx === 0}
          onChange={(e) => onChangeDigit(idx, e.target.value)}
          onKeyDown={(e) => onKeyDown(idx, e)}
          onPaste={onPaste}
          className={`w-11 sm:w-14 h-14 sm:h-16 text-center text-xl sm:text-2xl font-mono font-bold bg-surface text-text-primary border-[2px] ${
            error ? 'border-danger' : digit ? 'border-border-strong bg-background' : 'border-border'
          } rounded-[2px] transition-all duration-150 focus:border-border-strong focus:bg-background focus:outline-none focus:shadow-[2px_2px_0px_0px_#2E332A] disabled:opacity-50`}
        />
      ))}
    </div>
  )
}
