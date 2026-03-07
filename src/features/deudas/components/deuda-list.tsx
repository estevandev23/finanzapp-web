'use client'

import { DeudasTable } from './deudas-table'
import type { Deuda } from '../types'

interface DeudaListProps {
  deudas: Deuda[]
  onUpdate: () => void
  emptyMessage?: string
}

export function DeudaList({ deudas, onUpdate, emptyMessage }: DeudaListProps) {
  const activas = deudas.filter((d) => d.estado !== 'COMPLETADA')
  const completadas = deudas.filter((d) => d.estado === 'COMPLETADA')

  if (deudas.length === 0) {
    return <DeudasTable deudas={[]} onUpdate={onUpdate} emptyMessage={emptyMessage} />
  }

  return (
    <div className="space-y-6">
      <DeudasTable deudas={activas} onUpdate={onUpdate} emptyMessage={emptyMessage} />

      {completadas.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Completadas ({completadas.length})</h3>
          <DeudasTable deudas={completadas} onUpdate={onUpdate} />
        </div>
      )}
    </div>
  )
}
