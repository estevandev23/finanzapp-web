'use client'

import { useState, useEffect, useCallback } from 'react'

interface UseAsyncDataOptions<T> {
  initialData?: T
  autoFetch?: boolean
}

interface UseAsyncDataReturn<T> {
  data: T | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useAsyncData<T>(
  fetcher: () => Promise<{ data: T }>,
  options: UseAsyncDataOptions<T> = {}
): UseAsyncDataReturn<T> {
  const { initialData = null, autoFetch = true } = options
  const [data, setData] = useState<T | null>(initialData)
  const [isLoading, setIsLoading] = useState(autoFetch)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetcher()
      setData(response.data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [fetcher])

  useEffect(() => {
    if (autoFetch) {
      refetch()
    }
  }, [autoFetch, refetch])

  return { data, isLoading, error, refetch }
}
