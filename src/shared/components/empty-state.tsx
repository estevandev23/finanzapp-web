'use client'

import { Card, CardContent } from '@/components/ui/card'
import { InboxIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <Card className={cn('border-dashed', className)}>
      <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          {icon || <InboxIcon className="h-8 w-8 text-muted-foreground/60" />}
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-foreground">{title}</p>
          {description && (
            <p className="max-w-xs text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {action}
      </CardContent>
    </Card>
  )
}
