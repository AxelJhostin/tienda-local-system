import { requireServerSession } from '@/lib/auth/server'
import { NotificationsPageContent } from '@/features/notifications/components/notifications-page'

export default async function NotificationsPage() {
  await requireServerSession()

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
      <section className="rounded-3xl border border-border/70 bg-card/85 p-5 shadow-[0_18px_42px_-32px_rgba(17,24,39,.45)]">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary/80">Notifications</p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight">Notificaciones</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Primera version visible del centro de notificaciones operativas.
        </p>
      </section>

      <NotificationsPageContent />
    </div>
  )
}
