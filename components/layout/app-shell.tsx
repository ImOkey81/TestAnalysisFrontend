'use client'

import { useState } from 'react'
import { Sidebar } from './sidebar'
import { TopBar } from './topbar'

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="dashboard-grid flex min-h-screen">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-h-screen flex-1 flex-col">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 px-4 py-6 md:px-6">{children}</main>
      </div>
    </div>
  )
}
