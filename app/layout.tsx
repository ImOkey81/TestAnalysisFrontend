import type { Metadata } from 'next'
import { AppShell } from '@/components/layout/app-shell'
import { APP_NAME } from '@/lib/config'
import { Providers } from './providers'
import './globals.css'

export const metadata: Metadata = {
  title: APP_NAME,
  description: 'Интерфейс для генерации тестовых сценариев и анализа репозиториев.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  )
}
