import type { CategoriaIngreso } from '@/shared/types'

export interface Ingreso {
  id: string
  monto: number
  categoria?: CategoriaIngreso
  categoriaDescripcion?: string
  categoriaColor?: string
  categoriaPersonalizadaId?: string
  descripcion?: string
  fecha: string
  montoAhorro?: number
  prestamoId?: string
}

export interface IngresoRequest {
  monto: number
  categoria?: CategoriaIngreso
  categoriaPersonalizadaId?: string
  descripcion?: string
  fecha?: string
  montoAhorro?: number
  metaId?: string
  prestamoId?: string
}
