import { CodeBlock } from './code-block'

export function PreviewPanel({
  filename,
  content,
}: {
  filename?: string | null
  content: string
}) {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-border/70 bg-background/40 px-4 py-3">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Просмотр</p>
        <p className="mt-1 truncate text-sm font-medium">{filename ?? 'Файл не выбран'}</p>
      </div>
      <CodeBlock code={content} className="min-h-[440px]" />
    </div>
  )
}
