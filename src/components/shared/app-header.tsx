import { Badge } from '@/components/ui/badge'
import LogoutButton from '@/features/auth/components/logout-button'
import type { ServerSession } from '@/lib/auth/server'

export function AppHeader({ session }: { session: ServerSession }) {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
      <div className="flex items-center justify-between px-6 py-3">
        <div>
          <p className="text-sm text-muted-foreground">Sistema interno</p>
          <p className="text-sm font-medium">{session.staffFullName}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{session.staffRole}</Badge>
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}
