'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Label } from '@/components/ui/label'

interface DatePickerProps {
  id?: string
  label?: string
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export function DatePicker({
  id,
  label,
  value,
  onChange,
  placeholder = 'Seleccionar fecha',
  disabled,
}: DatePickerProps) {
  const selectedDate = value ? new Date(value + 'T00:00:00') : undefined

  function handleSelect(date: Date | undefined) {
    if (!date) {
      onChange('')
      return
    }
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    onChange(`${year}-${month}-${day}`)
  }

  return (
    <div className="space-y-2">
      {label && <Label htmlFor={id}>{label}</Label>}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            disabled={disabled}
            className={cn(
              'w-full justify-start text-left font-normal',
              !value && 'text-muted-foreground',
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate
              ? format(selectedDate, 'PPP', { locale: es })
              : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            locale={es}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
