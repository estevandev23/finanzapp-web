'use client'

import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { DATE_PRESETS, DATE_PRESET_LABELS, type DatePreset } from '@/shared/lib/date-utils'

export interface FilterOption {
  value: string
  label: string
}

interface ModuleFilterBarProps {
  searchPlaceholder?: string
  search: string
  onSearchChange: (value: string) => void
  datePreset: DatePreset
  onDatePresetChange: (preset: DatePreset) => void
  categoryOptions?: FilterOption[]
  category?: string
  onCategoryChange?: (value: string) => void
  statusOptions?: FilterOption[]
  status?: string
  onStatusChange?: (value: string) => void
  hasActiveFilters: boolean
  onReset: () => void
  totalItems: number
  filteredCount: number
  showDateFilter?: boolean
  className?: string
}

export function ModuleFilterBar({
  searchPlaceholder = 'Buscar...',
  search,
  onSearchChange,
  datePreset,
  onDatePresetChange,
  categoryOptions,
  category,
  onCategoryChange,
  statusOptions,
  status,
  onStatusChange,
  hasActiveFilters,
  onReset,
  totalItems,
  filteredCount,
  showDateFilter = true,
  className,
}: ModuleFilterBarProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {/* Fila superior: búsqueda + selects opcionales */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-8 h-9"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {categoryOptions && onCategoryChange && (
          <Select
            value={category || '__all__'}
            onValueChange={(v) => onCategoryChange(v === '__all__' ? '' : v)}
          >
            <SelectTrigger className="h-9 w-full sm:w-[180px]">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todas las categorías</SelectItem>
              {categoryOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {statusOptions && onStatusChange && (
          <Select
            value={status || '__all__'}
            onValueChange={(v) => onStatusChange(v === '__all__' ? '' : v)}
          >
            <SelectTrigger className="h-9 w-full sm:w-[160px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todos los estados</SelectItem>
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Fila inferior: presets de fecha + contador + botón limpiar */}
      <div className="flex flex-wrap items-center gap-2">
        {showDateFilter && (
          <div className="flex items-center gap-0.5 rounded-lg border bg-muted/40 p-1">
            {DATE_PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => onDatePresetChange(preset)}
                className={cn(
                  'rounded-md px-3 py-1 text-xs font-medium transition-all duration-150',
                  datePreset === preset
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {DATE_PRESET_LABELS[preset]}
              </button>
            ))}
          </div>
        )}

        {hasActiveFilters && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {filteredCount} de {totalItems}
            </span>
            <button
              onClick={onReset}
              className="flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
            >
              <X className="h-3 w-3" />
              Limpiar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
