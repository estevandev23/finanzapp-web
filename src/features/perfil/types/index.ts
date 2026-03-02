export interface UsuarioProfile {
  id: string
  nombre: string
  email: string
  telefono: string
  activo: boolean
  dosFactoresActivado: boolean
  telefonoVerificado: boolean
  oauthProvider?: string
  fechaCreacion: string
}

export interface UsuarioUpdateRequest {
  nombre?: string
  telefono?: string
}

export interface PasswordChangeRequest {
  passwordActual: string
  nuevaPassword: string
}
