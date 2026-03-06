import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import LogoutButton from '@/features/auth/components/logout-button'
import { requireServerSession } from '@/lib/auth/server'

export default async function DashboardPage() {
  const session = await requireServerSession()

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Panel principal</h1>
          <p className="text-muted-foreground">
            Bienvenido, {session.staffFullName}. Sistema interno de tienda local.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary">{session.staffRole}</Badge>
          <LogoutButton />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Inventario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Ver stock actual, gestionar IMEIs y ajustar cantidad.
            </p>
            <Link className="text-sm font-medium text-primary underline" href="/inventory">
              Ir al modulo de inventario
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ventas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Registro de ventas con carrito multi-item y precios editables.
            </p>
            <Link className="text-sm font-medium text-primary underline" href="/sales">
              Ir al modulo de ventas
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plan acumulativo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Siguiente fase: abonos y entrega final con RPC.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
