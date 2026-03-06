import type { ServerSession } from '@/lib/auth/server'
import { AppHeader } from '@/components/shared/app-header'
import { AppSidebar } from '@/components/shared/app-sidebar'

export function PrivateShell({
  session,
  children,
}: {
  session: ServerSession
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 md:grid-cols-[240px_1fr]">
        <AppSidebar role={session.staffRole} />
        <div className="flex min-h-screen flex-col border-l bg-background">
          <AppHeader session={session} />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  )
}

