export interface Ahorro {
  id: string
  monto: number
  descripcion?: string
  fecha: string
  metaId?: string
  ingresoId?: string
}

export interface AhorroRequest {
  monto: number
  descripcion?: string
  fecha?: string
  metaId?: string
  ingresoId?: string
}
