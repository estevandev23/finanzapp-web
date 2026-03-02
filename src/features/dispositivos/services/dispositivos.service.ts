import { apiClient } from '@/shared/lib/api-client'
import type { ApiResponse } from '@/shared/types'
import type { Dispositivo, DispositivoRequest } from '../types'

export const dispositivosService = {
  crearDispositivo(data: DispositivoRequest): Promise<ApiResponse<Dispositivo>> {
    return apiClient.post<ApiResponse<Dispositivo>>('/dispositivos', data).then(res => res.data)
  },

  verificarDispositivo(numeroWhatsapp: string, codigo: string): Promise<ApiResponse<Dispositivo>> {
    return apiClient
      .post<ApiResponse<Dispositivo>>('/dispositivos/verificar', null, {
        params: { numeroWhatsapp, codigo },
      })
      .then(res => res.data)
  },

  obtenerDispositivos(): Promise<ApiResponse<Dispositivo[]>> {
    return apiClient.get<ApiResponse<Dispositivo[]>>('/dispositivos').then(res => res.data)
  },

  obtenerDispositivoPorId(id: string): Promise<ApiResponse<Dispositivo>> {
    return apiClient.get<ApiResponse<Dispositivo>>(`/dispositivos/${id}`).then(res => res.data)
  },

  generarNuevoCodigo(id: string): Promise<ApiResponse<Dispositivo>> {
    return apiClient
      .post<ApiResponse<Dispositivo>>(`/dispositivos/${id}/nuevo-codigo`)
      .then(res => res.data)
  },

  desactivarDispositivo(id: string): Promise<ApiResponse<Dispositivo>> {
    return apiClient
      .patch<ApiResponse<Dispositivo>>(`/dispositivos/${id}/desactivar`)
      .then(res => res.data)
  },

  eliminarDispositivo(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/dispositivos/${id}`).then(res => res.data)
  },
}
