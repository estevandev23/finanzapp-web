export type TipoDeuda = 'DEUDA' | 'PRESTAMO'
export type EstadoDeuda = 'PENDIENTE' | 'EN_CURSO' | 'COMPLETADA'

export interface Deuda {
  id: string
  tipo: TipoDeuda
  tipoDescripcion: string
  descripcion: string
  entidad?: string
  montoTotal: number
  montoAbonado: number
  montoRestante: number
  porcentajeAvance: number
  estado: EstadoDeuda
  estadoDescripcion: string
  fechaInicio?: string
  fechaLimite?: string
  fechaCreacion: string
}

export interface DeudaRequest {
  tipo: TipoDeuda
  descripcion: string
  entidad?: string
  montoTotal: number
  fechaInicio?: string
  fechaLimite?: string
}

export interface AbonoDeuda {
  id: string
  deudaId: string
  monto: number
  descripcion?: string
  fechaAbono: string
}

export interface AbonoRequest {
  monto: number
  descripcion?: string
}

export interface ResumenDeudas {
  totalDeudas: number
  totalPrestamos: number
  abonosRecibidos: number
}
