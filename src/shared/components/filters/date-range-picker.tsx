'use client'

import { useState } from 'react'
import { CalendarIcon } from 'lucide-react'
import type { DateRange as DayPickerRange } from 'react-day-picker'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { DateRange } from '@/shared/lib/date-utils'

interface DateRangePickerProps {
  value: DateRange | null
  onChange: (range: DateRange | null) => void
  className?: string
  placeholder?: string
  disabled?: boolean
}

function toDateObjects(range: DateRange | null): DayPickerRange | undefined {
  if (!range) return undefined
  return {
    from: range.start ? parseISO(range.start) : undefined,
    to: range.end ? parseISO(range.end) : undefined,
  }
}

function toStringRange(range: DayPickerRange | undefined): DateRange | null {
  if (!range?.from) return null
  const start = format(range.from, 'yyyy-MM-dd')
  const end = range.to ? format(range.to, 'yyyy-MM-dd') : start
  return { start, end }
}

function formatLabel(range: DateRange | null, placeholder: string): string {
  if (!range) return placeholder
  const from = parseISO(range.start)
  const to = parseISO(range.end)
  if (range.start === range.end) {
    return format(from, 'dd MMM yyyy', { locale: es })
  }
  return `${format(from, 'dd MMM', { locale: es })} — ${format(to, 'dd MMM yyyy', { locale: es })}`
}

export function DateRangePicker({
  value,
  onChange,
  className,
  placeholder = 'Seleccionar rango',
  disabled = false,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false)

  function handleSelect(range: DayPickerRange | undefined) {
    const next = toStringRange(range)
    onChange(next)
    // Cerrar el popover solo cuando hay rango completo (from y to)
    if (next && next.start !== next.end) {
      setOpen(false)
    }
  }

  const label = formatLabel(value, placeholder)
  const hasValue = !!value

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            'h-9 justify-start gap-2 text-sm font-normal',
            !hasValue && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span>{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={toDateObjects(value)}
          onSelect={handleSelect}
          numberOfMonths={2}
          disabled={{ after: new Date() }}
          locale={es}
          captionLayout="label"
        />
      </PopoverContent>
    </Popover>
  )
}
