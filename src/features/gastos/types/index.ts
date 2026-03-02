import type { CategoriaGasto } from '@/shared/types'

export interface Gasto {
  id: string
  monto: number
  categoria?: CategoriaGasto
  categoriaDescripcion?: string
  categoriaColor?: string
  categoriaPersonalizadaId?: string
  descripcion?: string
  fecha: string
  deudaId?: string
}

export interface GastoRequest {
  monto: number
  categoria?: CategoriaGasto
  categoriaPersonalizadaId?: string
  descripcion?: string
  fecha?: string
  deudaId?: string
}
