'use client'

import { Download } from 'lucide-react'
import { Button, type ButtonProps } from '@/components/ui/button'

export function DownloadButton({
  onClick,
  children,
  ...props
}: ButtonProps & { onClick: () => void; children: React.ReactNode }) {
  return (
    <Button variant="secondary" size="sm" onClick={onClick} {...props}>
      <Download className="h-4 w-4" />
      {children}
    </Button>
  )
}
