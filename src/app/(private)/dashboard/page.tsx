import { Badge } from '@/components/ui/badge'
import { requireServerSession } from '@/lib/auth/server'
import { DashboardPageContent } from '@/features/dashboard/components/dashboard-page'

export default async function DashboardPage() {
  const session = await requireServerSession()

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      <section className="rounded-3xl border border-border/70 bg-card/85 p-6 shadow-[0_20px_44px_-32px_rgba(15,23,42,.45)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary/80">
              Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Panel principal</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Bienvenido, {session.staffFullName}. Este es el resumen operativo del dia.
            </p>
          </div>
          <Badge className="rounded-full bg-blue-50 px-4 py-1.5 text-blue-700" variant="secondary">
            {session.staffRole === 'admin' ? 'Administrador' : 'Vendedor'}
          </Badge>
        </div>
      </section>

      <DashboardPageContent />
    </div>
  )
}
