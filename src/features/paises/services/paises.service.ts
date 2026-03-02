import { apiClient } from '@/shared/lib/api-client'
import type { ApiResponse } from '@/shared/types'

export interface PrefijoPais {
  id: string
  nombre: string
  codigoIso: string
  prefijoTelefono: string
  banderaEmoji: string
}

export const paisesService = {
  listarPrefijos(): Promise<PrefijoPais[]> {
    return apiClient
      .get<ApiResponse<PrefijoPais[]>>('/paises/prefijos')
      .then(res => res.data.data ?? [])
  },
}
