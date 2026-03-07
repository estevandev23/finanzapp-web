import type { CategoriaGasto, MetodoPago } from '@/shared/types'

export interface GastoMetodoPagoDetalle {
  id?: string
  metodo: MetodoPago
  monto: number
}

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
  metodosPago?: GastoMetodoPagoDetalle[]
}

export interface GastoRequest {
  monto: number
  categoria?: CategoriaGasto
  categoriaPersonalizadaId?: string
  descripcion?: string
  fecha?: string
  deudaId?: string
  metodoPago?: MetodoPago
  metodosPago?: { metodo: MetodoPago; monto: number }[]
}
