import { apiClient } from '@/shared/lib/api-client'
import type { ApiResponse } from '@/shared/types'
import type { Deuda, DeudaRequest, AbonoDeuda, AbonoRequest, TipoDeuda, EstadoDeuda, ResumenDeudas } from '../types'

export const deudasService = {
  crear(data: DeudaRequest): Promise<ApiResponse<Deuda>> {
    return apiClient.post<ApiResponse<Deuda>>('/deudas', data).then(res => res.data)
  },

  obtenerTodas(): Promise<ApiResponse<Deuda[]>> {
    return apiClient.get<ApiResponse<Deuda[]>>('/deudas').then(res => res.data)
  },

  obtenerPorId(id: string): Promise<ApiResponse<Deuda>> {
    return apiClient.get<ApiResponse<Deuda>>(`/deudas/${id}`).then(res => res.data)
  },

  obtenerPorTipo(tipo: TipoDeuda): Promise<ApiResponse<Deuda[]>> {
    return apiClient.get<ApiResponse<Deuda[]>>(`/deudas/tipo/${tipo}`).then(res => res.data)
  },

  obtenerPorEstado(estado: EstadoDeuda): Promise<ApiResponse<Deuda[]>> {
    return apiClient.get<ApiResponse<Deuda[]>>(`/deudas/estado/${estado}`).then(res => res.data)
  },

  actualizar(id: string, data: DeudaRequest): Promise<ApiResponse<Deuda>> {
    return apiClient.put<ApiResponse<Deuda>>(`/deudas/${id}`, data).then(res => res.data)
  },

  eliminar(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/deudas/${id}`).then(res => res.data)
  },

  registrarAbono(deudaId: string, data: AbonoRequest): Promise<ApiResponse<AbonoDeuda>> {
    return apiClient.post<ApiResponse<AbonoDeuda>>(`/deudas/${deudaId}/abonos`, data).then(res => res.data)
  },

  obtenerAbonos(deudaId: string): Promise<ApiResponse<AbonoDeuda[]>> {
    return apiClient.get<ApiResponse<AbonoDeuda[]>>(`/deudas/${deudaId}/abonos`).then(res => res.data)
  },

  obtenerResumen(): Promise<ApiResponse<ResumenDeudas>> {
    return apiClient.get<ApiResponse<ResumenDeudas>>('/deudas/resumen').then(res => res.data)
  },
}
