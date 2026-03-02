import { apiClient } from '@/shared/lib/api-client'
import type { ApiResponse } from '@/shared/types'
import type { Ahorro, AhorroRequest } from '../types'

export const ahorrosService = {
  crearAhorro(data: AhorroRequest): Promise<ApiResponse<Ahorro>> {
    return apiClient.post<ApiResponse<Ahorro>>('/ahorros', data).then(res => res.data)
  },

  obtenerAhorros(): Promise<ApiResponse<Ahorro[]>> {
    return apiClient.get<ApiResponse<Ahorro[]>>('/ahorros').then(res => res.data)
  },

  obtenerAhorroPorId(id: string): Promise<ApiResponse<Ahorro>> {
    return apiClient.get<ApiResponse<Ahorro>>(`/ahorros/${id}`).then(res => res.data)
  },

  obtenerAhorrosPorPeriodo(fechaInicio: string, fechaFin: string): Promise<ApiResponse<Ahorro[]>> {
    return apiClient
      .get<ApiResponse<Ahorro[]>>('/ahorros/periodo', { params: { fechaInicio, fechaFin } })
      .then(res => res.data)
  },

  obtenerAhorrosPorMeta(metaId: string): Promise<ApiResponse<Ahorro[]>> {
    return apiClient.get<ApiResponse<Ahorro[]>>(`/ahorros/meta/${metaId}`).then(res => res.data)
  },

  obtenerTotalAhorros(): Promise<ApiResponse<number>> {
    return apiClient.get<ApiResponse<number>>('/ahorros/total').then(res => res.data)
  },

  obtenerTotalAhorrosPorPeriodo(fechaInicio: string, fechaFin: string): Promise<ApiResponse<number>> {
    return apiClient
      .get<ApiResponse<number>>('/ahorros/total/periodo', { params: { fechaInicio, fechaFin } })
      .then(res => res.data)
  },

  actualizarAhorro(id: string, data: AhorroRequest): Promise<ApiResponse<Ahorro>> {
    return apiClient.put<ApiResponse<Ahorro>>(`/ahorros/${id}`, data).then(res => res.data)
  },

  eliminarAhorro(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/ahorros/${id}`).then(res => res.data)
  },
}
