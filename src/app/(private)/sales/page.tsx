import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { requireServerSession } from '@/lib/auth/server'
import { SalesPageContent } from '@/features/sales/components/sales-page'

export default async function SalesPage() {
  await requireServerSession()

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Ventas</h1>
          <p className="text-sm text-muted-foreground">
            Registro de ventas con precio editable y cliente opcional.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard">Volver al dashboard</Link>
        </Button>
      </div>
      <SalesPageContent />
    </div>
  )
}
