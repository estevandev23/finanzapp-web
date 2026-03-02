'use client'

import { Inbox } from 'lucide-react'
import { DeudaCard } from './deuda-card'
import type { Deuda } from '../types'

interface DeudaListProps {
  deudas: Deuda[]
  onUpdate: () => void
  emptyMessage?: string
}

export function DeudaList({ deudas, onUpdate, emptyMessage }: DeudaListProps) {
  if (deudas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
        <Inbox className="mb-3 h-10 w-10" />
        <p>{emptyMessage || 'No hay registros'}</p>
      </div>
    )
  }

  const activas = deudas.filter((d) => d.estado !== 'COMPLETADA')
  const completadas = deudas.filter((d) => d.estado === 'COMPLETADA')

  return (
    <div className="space-y-6">
      {activas.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activas.map((deuda) => (
            <DeudaCard key={deuda.id} deuda={deuda} onUpdate={onUpdate} />
          ))}
        </div>
      )}

      {completadas.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Completadas</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {completadas.map((deuda) => (
              <DeudaCard key={deuda.id} deuda={deuda} onUpdate={onUpdate} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
