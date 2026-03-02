'use client'

import { useCallback, useState, useEffect, type ChangeEvent } from 'react'
import { cn } from '@/lib/utils'

interface CurrencyInputProps {
  id: string
  value: string
  onChange: (rawValue: string) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  min?: number
  label?: string
}

function formatWithThousands(value: string): string {
  const cleaned = value.replace(/[^\d]/g, '')
  if (!cleaned) return ''
  return Number(cleaned).toLocaleString('es-CO')
}

function stripFormatting(value: string): string {
  return value.replace(/[^\d]/g, '')
}

export function CurrencyInput({
  id,
  value,
  onChange,
  placeholder = '0',
  required = false,
  disabled = false,
  label,
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState(() => formatWithThousands(value))

  useEffect(() => {
    setDisplayValue(formatWithThousands(value))
  }, [value])

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const raw = stripFormatting(event.target.value)
    setDisplayValue(formatWithThousands(raw))
    onChange(raw)
  }, [onChange])

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={id} className="text-sm font-medium leading-none">
          {label}
        </label>
      )}
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground">
          $
        </span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={cn(
            'flex w-full rounded-xl border border-input bg-background py-4 pl-12 pr-4 text-3xl font-bold tracking-tight text-foreground shadow-sm transition-colors',
            'placeholder:text-muted-foreground/40 placeholder:font-normal',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        />
      </div>
    </div>
  )
}
