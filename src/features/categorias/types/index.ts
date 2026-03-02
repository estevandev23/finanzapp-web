export type TipoCategoria = 'INGRESO' | 'GASTO'

export interface CategoriaPersonalizada {
  id: string
  nombre: string
  tipo: TipoCategoria
  color?: string
  icono?: string
  activa: boolean
  fechaCreacion: string
}

export interface CategoriaPersonalizadaRequest {
  nombre: string
  tipo: TipoCategoria
  color?: string
  icono?: string
}
