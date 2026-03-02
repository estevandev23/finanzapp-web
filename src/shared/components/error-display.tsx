'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorDisplayProps {
  message?: string
  onRetry?: () => void
}

export function ErrorDisplay({ message = 'Ocurrio un error inesperado', onRetry }: ErrorDisplayProps) {
  return (
    <Card className="border-destructive/50">
      <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <div>
          <p className="font-medium text-destructive">Error</p>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reintentar
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
