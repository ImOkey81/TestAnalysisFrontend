'use client'

import { UploadCloud } from 'lucide-react'
import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function Dropzone({
  accept,
  onFileSelect,
  title,
  description,
}: {
  accept: string
  onFileSelect: (file: File) => void
  title: string
  description: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  return (
    <div
      className={cn(
        'rounded-3xl border border-dashed p-8 text-center transition-colors',
        isDragging ? 'border-primary bg-primary/10' : 'border-border/80 bg-background/30',
      )}
      onDragOver={(event) => {
        event.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault()
        setIsDragging(false)
        const file = event.dataTransfer.files?.[0]
        if (file) onFileSelect(file)
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) onFileSelect(file)
        }}
      />
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
        <UploadCloud className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <Button className="mt-5" variant="outline" type="button" onClick={() => inputRef.current?.click()}>
        Выбрать файл
      </Button>
    </div>
  )
}
