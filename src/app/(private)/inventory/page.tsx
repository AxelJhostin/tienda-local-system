import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { requireServerSession } from '@/lib/auth/server'
import { InventoryPageContent } from '@/features/inventory/components/inventory-page'

export default async function InventoryPage() {
  await requireServerSession()

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Inventario</h1>
          <p className="text-sm text-muted-foreground">
            Productos, stock actual, seriales y ajustes de cantidad.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard">Volver al dashboard</Link>
        </Button>
      </div>
      <InventoryPageContent />
    </div>
  )
}
