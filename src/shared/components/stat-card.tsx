'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  icon: LucideIcon
  description?: string
  tooltip?: string
  trend?: 'up' | 'down' | 'neutral'
  className?: string
}

const trendConfig = {
  up: {
    border: 'border-l-success',
    iconBg: 'bg-success/10',
    iconColor: 'text-success',
    TrendIcon: TrendingUp,
    trendColor: 'text-success',
    descColor: 'text-success',
    trendLabel: 'Favorable',
  },
  down: {
    border: 'border-l-destructive',
    iconBg: 'bg-destructive/10',
    iconColor: 'text-destructive',
    TrendIcon: TrendingDown,
    trendColor: 'text-destructive',
    descColor: 'text-destructive',
    trendLabel: 'Negativo',
  },
  neutral: {
    border: 'border-l-warning',
    iconBg: 'bg-warning/10',
    iconColor: 'text-warning-foreground',
    TrendIcon: Minus,
    trendColor: 'text-muted-foreground',
    descColor: 'text-muted-foreground',
    trendLabel: 'Neutral',
  },
} as const

export function StatCard({ title, value, icon: Icon, description, tooltip, trend, className }: StatCardProps) {
  const config = trend ? trendConfig[trend] : null
  const TrendIcon = config?.TrendIcon

  const card = (
    <Card
      className={cn(
        'border-l-4 transition-all duration-200 hover:shadow-md hover:-translate-y-px cursor-default',
        config?.border ?? 'border-l-primary',
        className
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {title}
            </p>
            <p className="text-2xl font-bold tabular-nums leading-none">{value}</p>
            {description && (
              <p className={cn('text-xs', config?.descColor ?? 'text-muted-foreground')}>
                {description}
              </p>
            )}
          </div>
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
              config?.iconBg ?? 'bg-primary/10'
            )}
          >
            <Icon className={cn('h-5 w-5', config?.iconColor ?? 'text-primary')} />
          </div>
        </div>
        {TrendIcon && (
          <div className={cn('mt-3 flex items-center gap-1 text-xs font-medium', config?.trendColor)}>
            <TrendIcon className="h-3 w-3" />
            <span>{config?.trendLabel}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{card}</TooltipTrigger>
        <TooltipContent side="bottom">{tooltip}</TooltipContent>
      </Tooltip>
    )
  }

  return card
}
