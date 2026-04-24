import { Sidebar } from './sidebar'
import { TopBar } from './topbar'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-grid min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-[1800px]">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <TopBar />
          <main className="flex-1 px-4 py-6 md:px-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
