import { apiClient } from '@/shared/lib/api-client'
import type { ApiResponse, CategoriaIngreso } from '@/shared/types'
import type { Ingreso, IngresoRequest } from '../types'

export const ingresosService = {
  crearIngreso(data: IngresoRequest): Promise<ApiResponse<Ingreso>> {
    return apiClient.post<ApiResponse<Ingreso>>('/ingresos', data).then(res => res.data)
  },

  obtenerIngresos(): Promise<ApiResponse<Ingreso[]>> {
    return apiClient.get<ApiResponse<Ingreso[]>>('/ingresos').then(res => res.data)
  },

  obtenerIngresoPorId(id: string): Promise<ApiResponse<Ingreso>> {
    return apiClient.get<ApiResponse<Ingreso>>(`/ingresos/${id}`).then(res => res.data)
  },

  obtenerIngresosPorPeriodo(fechaInicio: string, fechaFin: string): Promise<ApiResponse<Ingreso[]>> {
    return apiClient
      .get<ApiResponse<Ingreso[]>>('/ingresos/periodo', { params: { fechaInicio, fechaFin } })
      .then(res => res.data)
  },

  obtenerIngresosPorCategoria(categoria: CategoriaIngreso): Promise<ApiResponse<Ingreso[]>> {
    return apiClient
      .get<ApiResponse<Ingreso[]>>(`/ingresos/categoria/${categoria}`)
      .then(res => res.data)
  },

  obtenerTotalIngresos(): Promise<ApiResponse<number>> {
    return apiClient.get<ApiResponse<number>>('/ingresos/total').then(res => res.data)
  },

  obtenerTotalIngresosPorPeriodo(fechaInicio: string, fechaFin: string): Promise<ApiResponse<number>> {
    return apiClient
      .get<ApiResponse<number>>('/ingresos/total/periodo', { params: { fechaInicio, fechaFin } })
      .then(res => res.data)
  },

  actualizarIngreso(id: string, data: IngresoRequest): Promise<ApiResponse<Ingreso>> {
    return apiClient.put<ApiResponse<Ingreso>>(`/ingresos/${id}`, data).then(res => res.data)
  },

  eliminarIngreso(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/ingresos/${id}`).then(res => res.data)
  },
}
