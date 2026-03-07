import Image from 'next/image'
import { Banknote, CreditCard } from 'lucide-react'
import type { MetodoPago } from '@/shared/types'
import { cn } from '@/lib/utils'

interface MetodoPagoIconProps {
  metodo: MetodoPago | string
  size?: number
  className?: string
}

export function MetodoPagoIcon({ metodo, size = 20, className }: MetodoPagoIconProps) {
  switch (metodo) {
    case 'NEQUI':
      return <Image src="/icons/nequi.svg" alt="Nequi" width={size + 40} height={size + 40} className={className} />
    case 'BANCOLOMBIA':
      return <Image src="/icons/bancolombia.svg" alt="Bancolombia" width={size} height={size} className={className} />
    case 'EFECTIVO':
      return <Banknote className={cn('text-emerald-600', className)} style={{ width: size, height: size }} />
    default:
      return <CreditCard className={cn('text-muted-foreground', className)} style={{ width: size, height: size }} />
  }
}
