export interface Dispositivo {
  id: string
  numeroWhatsapp: string
  nombreDispositivo?: string
  verificado: boolean
  activo: boolean
}

export interface DispositivoRequest {
  numeroWhatsapp: string
  nombreDispositivo?: string
}
