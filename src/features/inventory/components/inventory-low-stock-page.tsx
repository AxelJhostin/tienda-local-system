'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLowStockProducts } from '@/features/inventory/hooks/use-inventory'
import { InventoryLowStockTable } from '@/features/inventory/components/inventory-low-stock-table'

export function InventoryLowStockPageContent() {
  const lowStockQuery = useLowStockProducts()

  const products = useMemo(() => {
    const rows = lowStockQuery.data ?? []
    return [...rows].sort((a, b) => {
      if (a.current_stock !== b.current_stock) return a.current_stock - b.current_stock
      if (a.low_stock_threshold !== b.low_stock_threshold) {
        return b.low_stock_threshold - a.low_stock_threshold
      }
      return a.name.localeCompare(b.name)
    })
  }, [lowStockQuery.data])

  const summary = useMemo(
    () => ({
      total: products.length,
      out: products.filter((product) => product.current_stock === 0).length,
      quantity: products.filter((product) => product.inventory_mode === 'quantity').length,
      serial: products.filter((product) => product.inventory_mode === 'serial').length,
    }),
    [products]
  )

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/80 bg-white/90">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Productos en alerta</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold tracking-tight">{summary.total}</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-white/90">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Agotados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold tracking-tight text-destructive">{summary.out}</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-white/90">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Alertas quantity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold tracking-tight">{summary.quantity}</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-white/90">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Alertas serial</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold tracking-tight">{summary.serial}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/80 bg-white/90">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Regla de alerta: <strong className="text-foreground">stock actual &lt;= low_stock_threshold</strong>.
            Para productos serializados, el stock actual corresponde al conteo de unidades con estado
            <strong className="text-foreground"> available</strong>.
          </p>
        </CardContent>
      </Card>

      <InventoryLowStockTable products={products} isLoading={lowStockQuery.isLoading} />
    </div>
  )
}
