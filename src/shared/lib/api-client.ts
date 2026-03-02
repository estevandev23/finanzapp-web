import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { ApiResponse } from '@/shared/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window === 'undefined') return config

  const token = localStorage.getItem('finanzapp_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem('finanzapp_refresh_token')
      if (!refreshToken) {
        clearAuthTokens()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, null, {
          headers: { Authorization: `Bearer ${refreshToken}` },
        })

        const newToken = response.data.data.token
        localStorage.setItem('finanzapp_token', newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`

        return apiClient(originalRequest)
      } catch {
        clearAuthTokens()
        window.location.href = '/login'
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)

export function setAuthTokens(token: string, refreshToken: string) {
  localStorage.setItem('finanzapp_token', token)
  localStorage.setItem('finanzapp_refresh_token', refreshToken)
  if (typeof document !== 'undefined') {
    document.cookie = `finanzapp_token=${token}; path=/; max-age=86400`
  }
}

export function clearAuthTokens() {
  localStorage.removeItem('finanzapp_token')
  localStorage.removeItem('finanzapp_refresh_token')
  if (typeof document !== 'undefined') {
    document.cookie = 'finanzapp_token=; path=/; max-age=0'
  }
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('finanzapp_token')
}
