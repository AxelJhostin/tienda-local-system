import { requireServerSession } from '@/lib/auth/server'
import { SalesPageContent } from '@/features/sales/components/sales-page'

export default async function SalesPage() {
  await requireServerSession()

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
      <div className="rounded-3xl border border-border/70 bg-card/85 p-5 shadow-[0_18px_42px_-32px_rgba(17,24,39,.45)]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary/80">Sales</p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight">Ventas</h1>
          <p className="text-sm text-muted-foreground">
            Registro de ventas con precio editable y cliente opcional.
          </p>
        </div>
      </div>
      <SalesPageContent />
    </div>
  )
}
