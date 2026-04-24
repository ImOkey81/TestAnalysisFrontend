'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Blocks, Camera, FileCode2, Github, LayoutDashboard, Video } from 'lucide-react'
import { APP_NAME, NAV_ITEMS } from '@/lib/config'
import { cn } from '@/lib/utils'

const icons = [LayoutDashboard, FileCode2, Camera, Video, Github]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-72 shrink-0 flex-col border-r border-border/60 bg-card/60 px-5 py-6 backdrop-blur xl:flex">
      <div className="mb-8 flex items-center gap-3 px-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <Blocks className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Навигация</p>
          <h1 className="text-lg font-semibold">{APP_NAME}</h1>
        </div>
      </div>

      <nav className="space-y-2">
        {NAV_ITEMS.map((item, index) => {
          const Icon = icons[index]
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-colors',
                isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
