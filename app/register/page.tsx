'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Blocks } from 'lucide-react'
import { toast } from 'sonner'

export default function RegisterPage() {
  const { user, isLoading, register } = useAuth()
  const router = useRouter()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordRepeat, setPasswordRepeat] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isLoading && user) router.replace('/')
  }, [user, isLoading, router])

  if (isLoading || user) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== passwordRepeat) {
      setError('Пароли не совпадают')
      return
    }

    setSubmitting(true)
    const result = await register(username, email, password, passwordRepeat)
    if (result.error) {
      setError(result.error)
      setSubmitting(false)
    } else {
      toast.success('Аккаунт создан! Войдите в систему.')
      router.push('/login')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center overflow-x-hidden px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Blocks className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-semibold sm:text-3xl">Регистрация</h1>
          <p className="text-sm text-muted-foreground">Создайте новый аккаунт</p>
        </div>

        <div className="glass-panel rounded-2xl p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium sm:text-base">Имя пользователя</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                autoFocus
                required
                className="w-full rounded-xl border border-border bg-secondary/50 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:text-base"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium sm:text-base">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                required
                className="w-full rounded-xl border border-border bg-secondary/50 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:text-base"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium sm:text-base">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl border border-border bg-secondary/50 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:text-base"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium sm:text-base">Повторите пароль</label>
              <input
                type="password"
                value={passwordRepeat}
                onChange={(e) => setPasswordRepeat(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl border border-border bg-secondary/50 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:text-base"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 sm:text-base"
            >
              {submitting ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Уже есть аккаунт?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Войти
          </Link>
        </p>
      </div>
    </div>
  )
}
