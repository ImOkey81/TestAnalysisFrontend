import { Inbox } from 'lucide-react'

export function EmptyState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-background/30 px-6 py-12 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
        <Inbox className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
