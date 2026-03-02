import { apiClient } from '@/shared/lib/api-client'
import type { ApiResponse, CategoriaGasto } from '@/shared/types'
import type { Gasto, GastoRequest } from '../types'

export const gastosService = {
  crearGasto(data: GastoRequest): Promise<ApiResponse<Gasto>> {
    return apiClient.post<ApiResponse<Gasto>>('/gastos', data).then(res => res.data)
  },

  obtenerGastos(): Promise<ApiResponse<Gasto[]>> {
    return apiClient.get<ApiResponse<Gasto[]>>('/gastos').then(res => res.data)
  },

  obtenerGastoPorId(id: string): Promise<ApiResponse<Gasto>> {
    return apiClient.get<ApiResponse<Gasto>>(`/gastos/${id}`).then(res => res.data)
  },

  obtenerGastosPorPeriodo(fechaInicio: string, fechaFin: string): Promise<ApiResponse<Gasto[]>> {
    return apiClient
      .get<ApiResponse<Gasto[]>>('/gastos/periodo', { params: { fechaInicio, fechaFin } })
      .then(res => res.data)
  },

  obtenerGastosPorCategoria(categoria: CategoriaGasto): Promise<ApiResponse<Gasto[]>> {
    return apiClient
      .get<ApiResponse<Gasto[]>>(`/gastos/categoria/${categoria}`)
      .then(res => res.data)
  },

  obtenerTotalGastos(): Promise<ApiResponse<number>> {
    return apiClient.get<ApiResponse<number>>('/gastos/total').then(res => res.data)
  },

  obtenerTotalGastosPorPeriodo(fechaInicio: string, fechaFin: string): Promise<ApiResponse<number>> {
    return apiClient
      .get<ApiResponse<number>>('/gastos/total/periodo', { params: { fechaInicio, fechaFin } })
      .then(res => res.data)
  },

  obtenerDesgloseGastos(): Promise<ApiResponse<Record<string, number>>> {
    return apiClient
      .get<ApiResponse<Record<string, number>>>('/gastos/desglose')
      .then(res => res.data)
  },

  obtenerDesgloseGastosPorPeriodo(fechaInicio: string, fechaFin: string): Promise<ApiResponse<Record<string, number>>> {
    return apiClient
      .get<ApiResponse<Record<string, number>>>('/gastos/desglose/periodo', { params: { fechaInicio, fechaFin } })
      .then(res => res.data)
  },

  actualizarGasto(id: string, data: GastoRequest): Promise<ApiResponse<Gasto>> {
    return apiClient.put<ApiResponse<Gasto>>(`/gastos/${id}`, data).then(res => res.data)
  },

  eliminarGasto(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/gastos/${id}`).then(res => res.data)
  },
}
