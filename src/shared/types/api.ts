export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  timestamp: string
}

export interface AuthResponse {
  token: string
  refreshToken: string
  usuarioId: string
  nombre?: string
  email: string
  requiere2FA?: boolean
  verificacionId?: string
}

export interface PeriodoParams {
  fechaInicio: string
  fechaFin: string
}
