import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <Card className="mb-6 overflow-hidden">
      <CardHeader>
        <div className="mb-3 inline-flex w-fit rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
          {eyebrow}
        </div>
        <CardTitle className="text-3xl">{title}</CardTitle>
        <CardDescription className="max-w-3xl text-base">{description}</CardDescription>
      </CardHeader>
    </Card>
  )
}
