import { apiClient } from '@/shared/lib/api-client'
import type { ApiResponse } from '@/shared/types'
import type { Inversion, InversionRequest, RegistrarRetornoRequest, EstadoInversion } from '../types'

export const inversionesService = {
  crear(data: InversionRequest): Promise<ApiResponse<Inversion>> {
    return apiClient.post<ApiResponse<Inversion>>('/inversiones', data).then(res => res.data)
  },

  obtenerTodas(estado?: EstadoInversion): Promise<ApiResponse<Inversion[]>> {
    const params = estado ? { estado } : {}
    return apiClient.get<ApiResponse<Inversion[]>>('/inversiones', { params }).then(res => res.data)
  },

  obtenerPorId(id: string): Promise<ApiResponse<Inversion>> {
    return apiClient.get<ApiResponse<Inversion>>(`/inversiones/${id}`).then(res => res.data)
  },

  registrarRetorno(id: string, data: RegistrarRetornoRequest): Promise<ApiResponse<Inversion>> {
    return apiClient.post<ApiResponse<Inversion>>(`/inversiones/${id}/retorno`, data).then(res => res.data)
  },

  eliminar(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/inversiones/${id}`).then(res => res.data)
  },
}
