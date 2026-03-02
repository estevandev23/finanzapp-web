'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { authService } from '@/features/auth/services/auth.service'
import { setAuthTokens, clearAuthTokens, getStoredToken } from '@/shared/lib/api-client'
import type { LoginRequest, RegisterRequest } from '@/features/auth/types'

interface User {
  id: string
  email: string
  nombre?: string
}

interface TwoFactorPending {
  usuarioId: string
  email: string
  nombre?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  twoFactorPending: TwoFactorPending | null
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  verify2FA: (codigo: string) => Promise<void>
  cancelar2FA: () => void
  logout: () => void
  loginOAuthCallback: (data: {
    requiere2FA: boolean
    token?: string
    refreshToken?: string
    usuarioId?: string
    email?: string
    nombre?: string
  }) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [twoFactorPending, setTwoFactorPending] = useState<TwoFactorPending | null>(null)

  useEffect(() => {
    const token = getStoredToken()
    if (!token) {
      setIsLoading(false)
      return
    }

    const storedUser = localStorage.getItem('finanzapp_user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (data: LoginRequest) => {
    const response = await authService.login(data)
    const authData = response.data

    if (authData.requiere2FA) {
      setTwoFactorPending({
        usuarioId: authData.usuarioId,
        email: authData.email,
        nombre: authData.nombre,
      })
      return
    }

    const { token, refreshToken, usuarioId, email } = authData
    setAuthTokens(token, refreshToken)

    const userData: User = { id: usuarioId, email }
    setUser(userData)
    localStorage.setItem('finanzapp_user', JSON.stringify(userData))
  }, [])

  const verify2FA = useCallback(async (codigo: string) => {
    if (!twoFactorPending) throw new Error('No hay verificacion 2FA pendiente')

    const response = await authService.verify2FA(twoFactorPending.usuarioId, codigo)
    const { token, refreshToken, usuarioId, email, nombre } = response.data

    setAuthTokens(token, refreshToken)
    const userData: User = { id: usuarioId, email, nombre }
    setUser(userData)
    localStorage.setItem('finanzapp_user', JSON.stringify(userData))
    setTwoFactorPending(null)
  }, [twoFactorPending])

  const cancelar2FA = useCallback(() => {
    setTwoFactorPending(null)
  }, [])

  const loginOAuthCallback = useCallback((data: {
    requiere2FA: boolean
    token?: string
    refreshToken?: string
    usuarioId?: string
    email?: string
    nombre?: string
  }) => {
    if (data.requiere2FA && data.usuarioId && data.email) {
      setTwoFactorPending({ usuarioId: data.usuarioId, email: data.email, nombre: data.nombre })
      return
    }

    if (data.token && data.refreshToken && data.usuarioId && data.email) {
      setAuthTokens(data.token, data.refreshToken)
      const userData: User = { id: data.usuarioId, email: data.email, nombre: data.nombre }
      setUser(userData)
      localStorage.setItem('finanzapp_user', JSON.stringify(userData))
    }
  }, [])

  const register = useCallback(async (data: RegisterRequest) => {
    const response = await authService.register(data)
    const { token, refreshToken, usuarioId, email, nombre } = response.data
    setAuthTokens(token, refreshToken)

    const userData: User = { id: usuarioId, email, nombre }
    setUser(userData)
    localStorage.setItem('finanzapp_user', JSON.stringify(userData))
  }, [])

  const logout = useCallback(() => {
    clearAuthTokens()
    localStorage.removeItem('finanzapp_user')
    setUser(null)
    window.location.href = '/login'
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        twoFactorPending,
        login,
        register,
        verify2FA,
        cancelar2FA,
        logout,
        loginOAuthCallback,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}
