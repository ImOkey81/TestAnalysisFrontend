'use client'

import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { copyToClipboard, normalizeApiError } from '@/lib/utils'

export function CopyButton({ value, label = 'Копировать' }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await copyToClipboard(value)
      setCopied(true)
      toast.success('Скопировано в буфер обмена')
      setTimeout(() => setCopied(false), 1500)
    } catch (error) {
      toast.error(normalizeApiError(error).message)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleCopy}>
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? 'Скопировано' : label}
    </Button>
  )
}
