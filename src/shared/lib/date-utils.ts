export type DatePreset = 'all' | 'week' | 'month' | 'year' | 'custom'

export interface DateRange {
  start: string
  end: string
}

export const DATE_PRESET_LABELS: Record<DatePreset, string> = {
  all: 'Todo',
  week: 'Esta semana',
  month: 'Este mes',
  year: 'Este año',
  custom: 'Personalizado',
}

export const DATE_PRESETS: DatePreset[] = ['all', 'week', 'month', 'year', 'custom']

function toYMD(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function getDateRangeForPreset(preset: DatePreset, customRange?: DateRange | null): DateRange | null {
  if (preset === 'all') return null
  if (preset === 'custom') return customRange ?? null

  const now = new Date()
  const end = toYMD(now)

  let startDate: Date

  switch (preset) {
    case 'week': {
      startDate = new Date(now)
      const day = startDate.getDay()
      const diff = day === 0 ? 6 : day - 1
      startDate.setDate(startDate.getDate() - diff)
      break
    }
    case 'month': {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    }
    case 'year': {
      startDate = new Date(now.getFullYear(), 0, 1)
      break
    }
  }

  return { start: toYMD(startDate!), end }
}

export function isDateInRange(dateStr: string, range: DateRange): boolean {
  return dateStr >= range.start && dateStr <= range.end
}

export function getPresetLabel(preset: DatePreset): string {
  return DATE_PRESET_LABELS[preset]
}

export function getTodayYMD(): string {
  return toYMD(new Date())
}
