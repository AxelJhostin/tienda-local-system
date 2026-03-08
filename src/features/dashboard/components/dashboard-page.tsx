'use client'

import Link from 'next/link'
import { ArrowRight, Boxes, CircleDollarSign, Package, WalletCards } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  useDashboardDailySummary,
  useDashboardLowStockCount,
  useDashboardRecentSales,
} from '@/features/dashboard/hooks/use-dashboard'

function toDateInputValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatMoney(value: number) {
  return `$${value.toLocaleString('es-CL')}`
}

function formatCompactId(value: string) {
  if (value.length <= 8) return value
  return `${value.slice(0, 8)}...`
}

export function DashboardPageContent() {
  const today = toDateInputValue(new Date())
  const summaryQuery = useDashboardDailySummary(today)
  const lowStockCountQuery = useDashboardLowStockCount()
  const recentSalesQuery = useDashboardRecentSales(6)

  const summary = summaryQuery.data ?? {
    date: today,
    sale_count: 0,
    total_sold: 0,
    total_items_sold: 0,
    by_inventory_mode: {
      quantity: 0,
      serial: 0,
    },
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/80 bg-white/90">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Ventas de hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-extrabold tracking-tight">{summary.sale_count}</p>
              <CircleDollarSign className="h-5 w-5 text-emerald-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-white/90">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total vendido hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold tracking-tight">{formatMoney(summary.total_sold)}</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-white/90">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Items vendidos hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-extrabold tracking-tight">{summary.total_items_sold}</p>
              <Package className="h-5 w-5 text-blue-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-white/90">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Productos en stock bajo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-extrabold tracking-tight">
                {lowStockCountQuery.data ?? 0}
              </p>
              <Boxes className="h-5 w-5 text-amber-700" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.45fr_.95fr]">
        <Card className="border-border/80 bg-white/90">
          <CardHeader className="space-y-2">
            <CardTitle>Ventas recientes</CardTitle>
            <p className="text-xs text-muted-foreground">
              Ultimas operaciones registradas.
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {(recentSalesQuery.data ?? []).map((sale) => (
              <div
                key={sale.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/70 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="font-mono text-xs text-muted-foreground">{formatCompactId(sale.id)}</p>
                  <p className="text-sm font-medium">
                    {sale.customer_name ?? 'Sin cliente'} · {sale.items.length} item(s)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(sale.sold_at).toLocaleString('es-CL')}
                  </p>
                </div>
                <p className="text-sm font-semibold">{formatMoney(sale.total_amount)}</p>
              </div>
            ))}

            {recentSalesQuery.isLoading && (
              <p className="text-sm text-muted-foreground">Cargando ventas recientes...</p>
            )}

            {!recentSalesQuery.isLoading && (recentSalesQuery.data ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">No hay ventas recientes.</p>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card className="border-border/80 bg-white/90">
            <CardHeader className="space-y-2">
              <CardTitle>Resumen por tipo de inventario</CardTitle>
              <p className="text-xs text-muted-foreground">Items vendidos hoy por modo.</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2">
                <div>
                  <p className="text-sm font-medium">Quantity</p>
                  <p className="text-xs text-muted-foreground">Venta por cantidad</p>
                </div>
                <Badge variant="outline">{summary.by_inventory_mode.quantity}</Badge>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2">
                <div>
                  <p className="text-sm font-medium">Serial</p>
                  <p className="text-xs text-muted-foreground">Venta por unidad serializada</p>
                </div>
                <Badge variant="outline">{summary.by_inventory_mode.serial}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-white/90">
            <CardHeader>
              <CardTitle>Accesos rapidos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link
                className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2 text-sm font-medium hover:bg-muted/40"
                href="/sales"
              >
                Registrar venta
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2 text-sm font-medium hover:bg-muted/40"
                href="/inventory"
              >
                Revisar inventario
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2 text-sm font-medium hover:bg-muted/40"
                href="/layaway"
              >
                Gestionar apartados
                <WalletCards className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
