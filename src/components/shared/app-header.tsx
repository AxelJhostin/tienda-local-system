import { Badge } from '@/components/ui/badge'
import LogoutButton from '@/features/auth/components/logout-button'
import type { ServerSession } from '@/lib/auth/server'
import { MobileSidebarMenu } from '@/components/shared/app-sidebar'

export function AppHeader({ session }: { session: ServerSession }) {
  const dateLabel = new Intl.DateTimeFormat('es-EC', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  return (
    <header className="sticky top-0 z-20">
      <div className="rounded-3xl border border-border/70 bg-card/85 px-4 py-3 shadow-[0_14px_36px_-26px_rgba(15,23,42,.45)] backdrop-blur md:px-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <MobileSidebarMenu role={session.staffRole} />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Sistema interno
              </p>
              <p className="text-sm font-semibold">{dateLabel}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="hidden rounded-full border border-blue-100 bg-blue-50 px-3 py-1 font-semibold text-blue-700 sm:inline-flex"
            >
              {session.staffRole === 'admin' ? 'Administrador' : 'Vendedor'}
            </Badge>

            <div className="hidden items-center gap-2 rounded-full border border-border/70 bg-background px-3 py-1.5 sm:flex">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                {session.staffFullName.charAt(0)}
              </span>
              <span className="max-w-40 truncate text-sm font-medium">{session.staffFullName}</span>
            </div>

            <LogoutButton />
          </div>
        </div>
      </div>
    </header>
  )
}
