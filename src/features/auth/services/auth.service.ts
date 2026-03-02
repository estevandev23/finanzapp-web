import { apiClient } from '@/shared/lib/api-client'
import type { ApiResponse, AuthResponse } from '@/shared/types'
import type { LoginRequest, RegisterRequest } from '../types'

export const authService = {
  login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data).then(res => res.data)
  },

  register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data).then(res => res.data)
  },

  verify2FA(usuarioId: string, codigo: string): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<ApiResponse<AuthResponse>>('/auth/verify-2fa', { usuarioId, codigo }).then(res => res.data)
  },

  forgotPassword(email: string): Promise<ApiResponse<{ tieneTelefono: boolean }>> {
    return apiClient.post<ApiResponse<{ tieneTelefono: boolean }>>('/auth/forgot-password', { email }).then(res => res.data)
  },

  forgotPasswordSms(email: string): Promise<ApiResponse<null>> {
    return apiClient.post<ApiResponse<null>>('/auth/forgot-password/sms', { email }).then(res => res.data)
  },

  verifyRecoveryCode(email: string, codigo: string): Promise<ApiResponse<null>> {
    return apiClient.post<ApiResponse<null>>('/auth/verify-recovery-code', { email, codigo }).then(res => res.data)
  },

  resetPassword(email: string, codigo: string, nuevaPassword: string): Promise<ApiResponse<null>> {
    return apiClient.post<ApiResponse<null>>('/auth/reset-password', { email, codigo, nuevaPassword }).then(res => res.data)
  },

  refreshToken(token: string): Promise<ApiResponse<AuthResponse>> {
    return apiClient
      .post<ApiResponse<AuthResponse>>('/auth/refresh', null, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => res.data)
  },
}
