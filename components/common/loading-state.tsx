import { LoaderCircle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export function LoadingState({ title = 'Обрабатываем запрос...' }: { title?: string }) {
  return (
    <div className="space-y-4 rounded-3xl border border-border/70 bg-background/40 p-5">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <LoaderCircle className="h-4 w-4 animate-spin" />
        <span>{title}</span>
      </div>
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  )
}
