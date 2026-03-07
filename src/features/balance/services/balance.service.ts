import { apiClient } from '@/shared/lib/api-client'
import type { ApiResponse } from '@/shared/types'
import type { Balance, BalancePorMetodo } from '../types'

export const balanceService = {
  obtenerBalance(): Promise<ApiResponse<Balance>> {
    return apiClient.get<ApiResponse<Balance>>('/balance').then(res => res.data)
  },

  obtenerBalancePorPeriodo(fechaInicio: string, fechaFin: string): Promise<ApiResponse<Balance>> {
    return apiClient
      .get<ApiResponse<Balance>>('/balance/periodo', { params: { fechaInicio, fechaFin } })
      .then(res => res.data)
  },

  obtenerBalancePorMetodo(): Promise<ApiResponse<BalancePorMetodo>> {
    return apiClient.get<ApiResponse<BalancePorMetodo>>('/balance/metodos').then(res => res.data)
  },
}
