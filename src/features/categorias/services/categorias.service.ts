import { apiClient } from '@/shared/lib/api-client'
import type { ApiResponse } from '@/shared/types'
import type { CategoriaPersonalizada, CategoriaPersonalizadaRequest, TipoCategoria } from '../types'

export const categoriasService = {
  crearCategoria(data: CategoriaPersonalizadaRequest): Promise<ApiResponse<CategoriaPersonalizada>> {
    return apiClient.post<ApiResponse<CategoriaPersonalizada>>('/categorias', data).then(res => res.data)
  },

  listarCategorias(): Promise<ApiResponse<CategoriaPersonalizada[]>> {
    return apiClient.get<ApiResponse<CategoriaPersonalizada[]>>('/categorias').then(res => res.data)
  },

  listarPorTipo(tipo: TipoCategoria): Promise<ApiResponse<CategoriaPersonalizada[]>> {
    return apiClient.get<ApiResponse<CategoriaPersonalizada[]>>(`/categorias/tipo/${tipo}`).then(res => res.data)
  },

  actualizarCategoria(id: string, data: CategoriaPersonalizadaRequest): Promise<ApiResponse<CategoriaPersonalizada>> {
    return apiClient.put<ApiResponse<CategoriaPersonalizada>>(`/categorias/${id}`, data).then(res => res.data)
  },

  eliminarCategoria(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/categorias/${id}`).then(res => res.data)
  },
}
