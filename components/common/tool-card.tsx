import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function ToolCard({
  title,
  description,
  href,
  badge,
}: {
  title: string
  description: string
  href: string
  badge: string
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="mb-3 inline-flex w-fit rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {badge}
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <Button asChild className="w-full justify-between">
          <Link href={href}>
            Открыть инструмент
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
