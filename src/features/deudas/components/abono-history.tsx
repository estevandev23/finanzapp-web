'use client'

import { Calendar, FileText } from 'lucide-react'
import { formatCurrency, formatDateTime } from '@/shared/lib/formatters'
import type { AbonoDeuda } from '../types'

interface AbonoHistoryProps {
  abonos: AbonoDeuda[]
}

export function AbonoHistory({ abonos }: AbonoHistoryProps) {
  if (abonos.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        No hay abonos registrados
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {abonos.map((abono) => (
        <div
          key={abono.id}
          className="flex items-start justify-between rounded-md border p-3"
        >
          <div className="space-y-1">
            {abono.descripcion && (
              <div className="flex items-center gap-1.5 text-sm">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{abono.descripcion}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{formatDateTime(abono.fechaAbono)}</span>
            </div>
          </div>
          <span className="font-semibold text-primary">
            {formatCurrency(abono.monto)}
          </span>
        </div>
      ))}
    </div>
  )
}
