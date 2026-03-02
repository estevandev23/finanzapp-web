import { apiClient } from '@/shared/lib/api-client'
import type { ApiResponse, EstadoMeta } from '@/shared/types'
import type { MetaFinanciera, MetaFinancieraRequest } from '../types'

export const metasService = {
  crearMeta(data: MetaFinancieraRequest): Promise<ApiResponse<MetaFinanciera>> {
    return apiClient.post<ApiResponse<MetaFinanciera>>('/metas', data).then(res => res.data)
  },

  obtenerMetas(): Promise<ApiResponse<MetaFinanciera[]>> {
    return apiClient.get<ApiResponse<MetaFinanciera[]>>('/metas').then(res => res.data)
  },

  obtenerMetaPorId(id: string): Promise<ApiResponse<MetaFinanciera>> {
    return apiClient.get<ApiResponse<MetaFinanciera>>(`/metas/${id}`).then(res => res.data)
  },

  obtenerMetasPorEstado(estado: EstadoMeta): Promise<ApiResponse<MetaFinanciera[]>> {
    return apiClient
      .get<ApiResponse<MetaFinanciera[]>>(`/metas/estado/${estado}`)
      .then(res => res.data)
  },

  actualizarMeta(id: string, data: MetaFinancieraRequest): Promise<ApiResponse<MetaFinanciera>> {
    return apiClient.put<ApiResponse<MetaFinanciera>>(`/metas/${id}`, data).then(res => res.data)
  },

  registrarProgreso(id: string, monto: number): Promise<ApiResponse<MetaFinanciera>> {
    return apiClient
      .post<ApiResponse<MetaFinanciera>>(`/metas/${id}/progreso`, null, { params: { monto } })
      .then(res => res.data)
  },

  cambiarEstado(id: string, estado: EstadoMeta): Promise<ApiResponse<MetaFinanciera>> {
    return apiClient
      .patch<ApiResponse<MetaFinanciera>>(`/metas/${id}/estado`, null, { params: { estado } })
      .then(res => res.data)
  },

  eliminarMeta(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/metas/${id}`).then(res => res.data)
  },
}
