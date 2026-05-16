'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut } from 'lucide-react'

function AvatarCircle({ letter, onClick }: { letter: string; onClick?: () => void }) {
  const base =
    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-500 text-sm font-bold text-black select-none'
  return onClick ? (
    <button onClick={onClick} className={`${base} transition-opacity hover:opacity-85`} aria-label="Меню пользователя">
      {letter}
    </button>
  ) : (
    <div className={base}>{letter}</div>
  )
}

export function AuthButton() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [open])

  if (isLoading) return null

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="rounded-md bg-cyan-500 px-3 py-1.5 text-sm font-medium text-black transition-colors hover:bg-cyan-400"
        >
          Войти
        </Link>
        <Link
          href="/register"
          className="hidden rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:inline-flex"
        >
          Зарегистрироваться
        </Link>
      </div>
    )
  }

  const displayName = user.username || user.email || '?'
  const letter = displayName.charAt(0).toUpperCase()

  async function handleLogout() {
    setOpen(false)
    await logout()
    router.push('/login')
  }

  return (
    <div className="relative flex items-center" ref={ref}>
      {/* Desktop: avatar + name + logout button */}
      <div className="hidden items-center gap-3 sm:flex">
        <AvatarCircle letter={letter} />
        <span className="max-w-[160px] truncate text-sm font-medium text-foreground">{displayName}</span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-cyan-500/40 hover:bg-secondary hover:text-foreground"
        >
          <LogOut className="h-3.5 w-3.5" />
          Выйти
        </button>
      </div>

      {/* Mobile: avatar only, click opens dropdown */}
      <div className="sm:hidden">
        <AvatarCircle letter={letter} onClick={() => setOpen((v) => !v)} />

        {open && (
          <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-xl border border-border bg-background shadow-xl">
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <AvatarCircle letter={letter} />
              <span className="truncate text-sm font-medium text-foreground">{displayName}</span>
            </div>
            <div className="p-2">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                Выйти
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
