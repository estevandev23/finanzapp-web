'use client'

import { useState, useMemo } from 'react'
import { getDateRangeForPreset, isDateInRange, type DatePreset } from '@/shared/lib/date-utils'

export interface ModuleFiltersConfig<T> {
  getSearchableText: (item: T) => string
  getDate?: (item: T) => string | undefined
  getCategory?: (item: T) => string | undefined
  getStatus?: (item: T) => string | undefined
}

export function useModuleFilters<T>(data: T[] | null | undefined, config: ModuleFiltersConfig<T>) {
  const [search, setSearch] = useState('')
  const [datePreset, setDatePreset] = useState<DatePreset>('all')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('')

  const filteredData = useMemo(() => {
    if (!data) return []

    let result = data as T[]

    if (search.trim()) {
      const term = search.toLowerCase().trim()
      result = result.filter((item) =>
        config.getSearchableText(item).toLowerCase().includes(term)
      )
    }

    if (datePreset !== 'all' && config.getDate) {
      const range = getDateRangeForPreset(datePreset)
      if (range) {
        result = result.filter((item) => {
          const dateStr = config.getDate!(item)
          return dateStr ? isDateInRange(dateStr, range) : false
        })
      }
    }

    if (category && config.getCategory) {
      result = result.filter((item) => config.getCategory!(item) === category)
    }

    if (status && config.getStatus) {
      result = result.filter((item) => config.getStatus!(item) === status)
    }

    return result
  }, [data, search, datePreset, category, status, config])

  function resetFilters() {
    setSearch('')
    setDatePreset('all')
    setCategory('')
    setStatus('')
  }

  const hasActiveFilters =
    search.trim() !== '' || datePreset !== 'all' || category !== '' || status !== ''

  return {
    search,
    setSearch,
    datePreset,
    setDatePreset,
    category,
    setCategory,
    status,
    setStatus,
    filteredData,
    resetFilters,
    hasActiveFilters,
    totalItems: data?.length ?? 0,
    filteredCount: filteredData.length,
  }
}
