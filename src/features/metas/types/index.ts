import type { EstadoMeta } from '@/shared/types'

export interface MetaFinanciera {
  id: string
  nombre: string
  descripcion?: string
  montoObjetivo: number
  montoActual: number
  porcentajeAvance: number
  fechaLimite?: string
  estado: EstadoMeta
}

export interface MetaFinancieraRequest {
  nombre: string
  descripcion?: string
  montoObjetivo: number
  fechaLimite?: string
}
