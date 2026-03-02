export type EstadoInversion = 'ACTIVA' | 'FINALIZADA'

export interface Inversion {
  id: string
  nombre: string
  descripcion?: string
  monto: number
  retornoEsperado?: number
  retornoReal?: number
  ganancia?: number
  estado: EstadoInversion
  estadoDescripcion: string
  fechaInversion: string
  fechaRetorno?: string
  gastoId?: string
  ingresoId?: string
  fechaCreacion: string
}

export interface InversionRequest {
  nombre: string
  descripcion?: string
  monto: number
  retornoEsperado?: number
  fechaInversion?: string
}

export interface RegistrarRetornoRequest {
  retornoReal: number
  fechaRetorno?: string
}
