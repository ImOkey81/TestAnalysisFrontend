'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface AuthUser {
  username: string
  email: string
  name: string
}

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<{ error?: string }>
  logout: () => Promise<void>
  register: (
    username: string,
    email: string,
    password: string,
    passwordRepeat: string,
  ) => Promise<{ error?: string }>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false))
  }, [])

  async function login(username: string, password: string): Promise<{ error?: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    const data = await res.json()
    if (data.success) {
      setUser(data.user)
      return {}
    }
    return { error: data.error ?? 'Ошибка входа' }
  }

  async function logout(): Promise<void> {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
  }

  async function register(
    username: string,
    email: string,
    password: string,
    passwordRepeat: string,
  ): Promise<{ error?: string }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, password_repeat: passwordRepeat }),
    })
    const data = await res.json()
    if (data.success) return {}
    return { error: data.error ?? 'Ошибка регистрации' }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
