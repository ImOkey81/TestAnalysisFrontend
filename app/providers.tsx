'use client'

import { AuthProvider } from '@/lib/auth-context'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
        {children}
        <Toaster richColors position="top-right" />
      </ThemeProvider>
    </AuthProvider>
  )
}
