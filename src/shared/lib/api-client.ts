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

let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

function onTokenRefreshed(newToken: string) {
  refreshSubscribers.forEach((cb) => cb(newToken))
  refreshSubscribers = []
}

function subscribeToRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb)
}

function forceLogout() {
  clearAuthTokens()
  if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
    window.location.href = '/login?expired=true'
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem('finanzapp_refresh_token')
      if (!refreshToken) {
        forceLogout()
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeToRefresh((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            resolve(apiClient(originalRequest))
          })
        })
      }

      isRefreshing = true

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, null, {
          headers: { Authorization: `Bearer ${refreshToken}` },
        })

        const newToken = response.data.data.token
        localStorage.setItem('finanzapp_token', newToken)
        document.cookie = `finanzapp_token=${newToken}; path=/; max-age=86400`
        originalRequest.headers.Authorization = `Bearer ${newToken}`

        onTokenRefreshed(newToken)
        isRefreshing = false

        return apiClient(originalRequest)
      } catch {
        isRefreshing = false
        refreshSubscribers = []
        forceLogout()
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
  localStorage.removeItem('finanzapp_user')
  if (typeof document !== 'undefined') {
    document.cookie = 'finanzapp_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  }
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('finanzapp_token')
}
