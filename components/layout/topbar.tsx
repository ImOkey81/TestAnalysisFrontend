'use client'

import { usePathname } from 'next/navigation'

const pageTitles: Record<string, string> = {
  '/': 'Главная',
  '/swagger': 'Swagger',
  '/screenshot': 'Скриншоты',
  '/video': 'Видео',
  '/repo-review': 'Репозиторий',
}

export function TopBar() {
  const pathname = usePathname()
  const title = (pathname ? pageTitles[pathname] : undefined) ?? 'Центр тестирования'

  return (
    <div className="sticky top-0 z-20 border-b border-border/60 bg-background/70 px-4 py-4 backdrop-blur md:px-6">
      <h2 className="text-2xl font-semibold">{title}</h2>
    </div>
  )
}
