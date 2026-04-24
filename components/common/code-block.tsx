import { cn } from '@/lib/utils'

export function CodeBlock({
  code,
  className,
}: {
  code: string
  className?: string
}) {
  return (
    <pre
      className={cn(
        'max-h-[560px] overflow-y-auto overflow-x-hidden whitespace-pre-wrap break-words rounded-2xl border border-border/70 bg-slate-950 p-4 text-sm text-slate-100',
        className,
      )}
    >
      <code>{code}</code>
    </pre>
  )
}
