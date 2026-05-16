'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Blocks, Camera, FileCode2, Github, LayoutDashboard, Video, X } from 'lucide-react'
import { APP_NAME, NAV_ITEMS } from '@/lib/config'
import { cn } from '@/lib/utils'

const icons = [LayoutDashboard, FileCode2, Camera, Video, Github]

interface SidebarProps {
  open?: boolean
  onClose?: () => void
}

export function Sidebar({ open = false, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        // Mobile: fixed overlay, slides in/out
        'fixed inset-y-0 left-0 z-50 flex w-60 shrink-0 flex-col border-r border-border/60 bg-card/95 px-2 py-5 backdrop-blur',
        'transition-transform duration-200 ease-in-out',
        open ? 'translate-x-0' : '-translate-x-full',
        // Desktop: static sidebar in layout flow
        'lg:static lg:z-auto lg:translate-x-0',
      )}
    >
      {/* Logo */}
      <div className="mb-6 flex items-center justify-between px-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Blocks className="h-5 w-5" />
          </div>
          <h1 className="text-sm font-semibold leading-tight">{APP_NAME}</h1>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-foreground lg:hidden"
          aria-label="Закрыть меню"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="space-y-1">
        {NAV_ITEMS.map((item, index) => {
          const Icon = icons[index]
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
