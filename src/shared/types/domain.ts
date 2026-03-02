export type CategoriaIngreso =
  | 'TRABAJO_PRINCIPAL'
  | 'TRABAJO_EXTRA'
  | 'GANANCIAS_ADICIONALES'
  | 'INVERSIONES'
  | 'OTROS'
  | 'ABONO'

export type CategoriaGasto =
  | 'COMIDA'
  | 'PAREJA'
  | 'COMPRAS'
  | 'TRANSPORTE'
  | 'SERVICIOS'
  | 'ENTRETENIMIENTO'
  | 'SALUD'
  | 'EDUCACION'
  | 'OTROS'
  | 'ABONO'

export type EstadoMeta = 'ACTIVA' | 'COMPLETADA' | 'CANCELADA'

export const CATEGORIAS_INGRESO: { value: CategoriaIngreso; label: string }[] = [
  { value: 'TRABAJO_PRINCIPAL', label: 'Trabajo principal' },
  { value: 'TRABAJO_EXTRA', label: 'Trabajo extra' },
  { value: 'GANANCIAS_ADICIONALES', label: 'Ganancias adicionales' },
  { value: 'INVERSIONES', label: 'Inversiones' },
  { value: 'OTROS', label: 'Otros' },
  { value: 'ABONO', label: 'Abono' },
]

export const CATEGORIAS_GASTO: { value: CategoriaGasto; label: string }[] = [
  { value: 'COMIDA', label: 'Comida' },
  { value: 'PAREJA', label: 'Pareja' },
  { value: 'COMPRAS', label: 'Compras' },
  { value: 'TRANSPORTE', label: 'Transporte' },
  { value: 'SERVICIOS', label: 'Servicios' },
  { value: 'ENTRETENIMIENTO', label: 'Entretenimiento' },
  { value: 'SALUD', label: 'Salud' },
  { value: 'EDUCACION', label: 'Educacion' },
  { value: 'OTROS', label: 'Otros' },
  { value: 'ABONO', label: 'Abono' },
]

export const ESTADOS_META: { value: EstadoMeta; label: string }[] = [
  { value: 'ACTIVA', label: 'Activa' },
  { value: 'COMPLETADA', label: 'Completada' },
  { value: 'CANCELADA', label: 'Cancelada' },
]
