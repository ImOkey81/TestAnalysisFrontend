'use client'

import { FileCode2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function FileTree({
  files,
  selectedFile,
  onSelect,
}: {
  files: string[]
  selectedFile?: string | null
  onSelect: (file: string) => void
}) {
  return (
    <div className="max-h-[560px] overflow-auto rounded-2xl border border-border/70 bg-background/40 p-2">
      {files.map((file) => (
        <button
          key={file}
          type="button"
          onClick={() => onSelect(file)}
          className={cn(
            'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors',
            selectedFile === file ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary',
          )}
        >
          <FileCode2 className="h-4 w-4 shrink-0" />
          <span className="truncate">{file}</span>
        </button>
      ))}
    </div>
  )
}
