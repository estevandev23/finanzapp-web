'use client'

import { useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface OtpInputProps {
  digits: string[]
  onChange: (digits: string[]) => void
  onComplete?: (code: string) => void
  disabled?: boolean
  autoFocus?: boolean
}

export function OtpInput({ digits, onChange, onComplete, disabled, autoFocus = true }: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (autoFocus) inputRefs.current[0]?.focus()
  }, [autoFocus])

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return

    const newDigits = [...digits]
    newDigits[index] = value.slice(-1)
    onChange(newDigits)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    if (newDigits.every((d) => d !== '') && index === 5) {
      onComplete?.(newDigits.join(''))
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      const newDigits = pasted.split('')
      onChange(newDigits)
      inputRefs.current[5]?.focus()
      onComplete?.(pasted)
    }
  }

  return (
    <div className="flex justify-center gap-3" onPaste={handlePaste}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          disabled={disabled}
          className={cn(
            'h-14 w-12 rounded-lg border-2 bg-background text-center text-2xl font-bold tabular-nums transition-colors focus:outline-none',
            digit ? 'border-primary text-primary' : 'border-input text-foreground',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        />
      ))}
    </div>
  )
}
