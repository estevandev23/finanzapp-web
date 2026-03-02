import { apiClient } from '@/shared/lib/api-client'
import type { ApiResponse } from '@/shared/types'
import type { UsuarioProfile, UsuarioUpdateRequest, PasswordChangeRequest } from '../types'

export const perfilService = {
  obtenerPerfil(): Promise<ApiResponse<UsuarioProfile>> {
    return apiClient.get<ApiResponse<UsuarioProfile>>('/usuarios/perfil').then(res => res.data)
  },

  actualizarPerfil(data: UsuarioUpdateRequest): Promise<ApiResponse<UsuarioProfile>> {
    return apiClient.put<ApiResponse<UsuarioProfile>>('/usuarios/perfil', data).then(res => res.data)
  },

  cambiarPassword(data: PasswordChangeRequest): Promise<ApiResponse<void>> {
    return apiClient.put<ApiResponse<void>>('/usuarios/password', data).then(res => res.data)
  },

  toggle2FA(activar: boolean): Promise<ApiResponse<UsuarioProfile>> {
    return apiClient.post<ApiResponse<UsuarioProfile>>(`/usuarios/2fa/toggle?activar=${activar}`).then(res => res.data)
  },

  enviarSmsVerificacion(): Promise<ApiResponse<{ verificacionId: string; telefono: string }>> {
    return apiClient.post<ApiResponse<{ verificacionId: string; telefono: string }>>('/verificacion/sms/enviar').then(res => res.data)
  },

  verificarSms(codigo: string): Promise<ApiResponse<{ telefonoVerificado: boolean }>> {
    return apiClient.post<ApiResponse<{ telefonoVerificado: boolean }>>(`/verificacion/sms/verificar?codigo=${codigo}`).then(res => res.data)
  },
}
