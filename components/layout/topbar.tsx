'use client'

import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { AuthButton } from '@/components/AuthButton'

const pageTitles: Record<string, string> = {
  '/': 'Главная',
  '/swagger': 'Swagger',
  '/screenshot': 'Скриншоты',
  '/video': 'Видео',
  '/repo-review': 'Репозиторий',
}

interface TopBarProps {
  onMenuClick?: () => void
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const pathname = usePathname()
  const title = (pathname ? pageTitles[pathname] : undefined) ?? 'Центр тестирования'

  return (
    <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-border/60 bg-background/70 px-4 py-4 backdrop-blur md:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground lg:hidden"
        aria-label="Открыть меню"
      >
        <Menu className="h-5 w-5" />
      </button>
      <h2 className="flex-1 text-xl font-semibold">{title}</h2>
      <AuthButton />
    </div>
  )
}
