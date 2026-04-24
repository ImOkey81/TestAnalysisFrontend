import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function ResultCard({
  title,
  description,
  actions,
  className,
  children,
}: {
  title: string
  description: string
  actions?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <Card className={cn('h-full', className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {actions}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
