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
    <div className="min-h-screen bg-transparent">
      <div className="mx-auto grid min-h-screen w-full max-w-[1600px] grid-cols-1 px-0 md:grid-cols-[280px_1fr] md:gap-4 md:px-4 md:py-4">
        <AppSidebar role={session.staffRole} />
        <div className="flex min-h-screen flex-col gap-4 bg-transparent">
          <AppHeader session={session} />
          <main className="flex-1 px-4 pb-6 md:px-0 md:pb-2">{children}</main>
        </div>
      </div>
    </div>
  )
}
