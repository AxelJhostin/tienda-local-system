import Link from 'next/link'
import { ArrowRight, Boxes, CircleDollarSign, WalletCards } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { requireServerSession } from '@/lib/auth/server'

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
              Bienvenido, {session.staffFullName}. Revisa inventario, ventas y operaciones diarias.
            </p>
          </div>
          <Badge className="rounded-full bg-blue-50 px-4 py-1.5 text-blue-700" variant="secondary">
            {session.staffRole === 'admin' ? 'Administrador' : 'Vendedor'}
          </Badge>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="border-border/80 bg-white/90">
          <CardHeader className="space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Boxes className="h-5 w-5" />
            </div>
            <CardTitle>Inventario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Consulta stock actual, maneja seriales y ajusta cantidades con trazabilidad.
            </p>
            <Link
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              href="/inventory"
            >
              Ir a inventory
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-white/90">
          <CardHeader className="space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <CircleDollarSign className="h-5 w-5" />
            </div>
            <CardTitle>Ventas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Registra ventas con carrito multi-item y control de precios por producto.
            </p>
            <Link
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              href="/sales"
            >
              Ir a sales
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-white/90">
          <CardHeader className="space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <WalletCards className="h-5 w-5" />
            </div>
            <CardTitle>Layaway</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Gestiona planes acumulativos con abonos y entrega final.
            </p>
            <Link
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              href="/layaway"
            >
              Ir a layaway
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
