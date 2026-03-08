'use client'

import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useCommercialSummary } from '@/features/reports/hooks/use-reports'

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

export function ReportsPageContent() {
  const [dateFrom, setDateFrom] = useState(() => {
    const value = new Date()
    value.setDate(value.getDate() - 30)
    return toDateInputValue(value)
  })
  const [dateTo, setDateTo] = useState(() => toDateInputValue(new Date()))

  const summaryQuery = useCommercialSummary({ dateFrom, dateTo })
  const summary = summaryQuery.data

  const latestSales = useMemo(() => (summary?.sales ?? []).slice(0, 8), [summary?.sales])

  return (
    <div className="grid gap-4">
      <Card className="border-border/80 bg-white/90">
        <CardHeader>
          <CardTitle>Periodo</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="reportsDateFrom">Desde</Label>
            <Input
              id="reportsDateFrom"
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reportsDateTo">Hasta</Label>
            <Input
              id="reportsDateTo"
              type="date"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/80 bg-white/90">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total vendido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold tracking-tight">
              {formatMoney(summary?.total_sold ?? 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-white/90">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Cantidad de ventas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold tracking-tight">{summary?.sale_count ?? 0}</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-white/90">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Items vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold tracking-tight">{summary?.total_items_sold ?? 0}</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-white/90">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Mix por inventory_mode</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Quantity</span>
              <Badge variant="outline">{summary?.by_inventory_mode.quantity ?? 0}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Serial</span>
              <Badge variant="outline">{summary?.by_inventory_mode.serial ?? 0}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
        <Card className="border-border/80 bg-white/90">
          <CardHeader>
            <CardTitle>Resumen por vendedor</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendedor</TableHead>
                  <TableHead>Ventas</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(summary?.by_seller ?? []).map((seller) => (
                  <TableRow key={seller.seller_id ?? seller.seller_name}>
                    <TableCell>{seller.seller_name}</TableCell>
                    <TableCell>{seller.sale_count}</TableCell>
                    <TableCell>{seller.total_items}</TableCell>
                    <TableCell className="font-semibold">{formatMoney(seller.total_sold)}</TableCell>
                  </TableRow>
                ))}

                {summaryQuery.isLoading && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Cargando resumen...
                    </TableCell>
                  </TableRow>
                )}

                {!summaryQuery.isLoading && (summary?.by_seller.length ?? 0) === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No hay resultados para el periodo seleccionado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-white/90">
          <CardHeader>
            <CardTitle>Ventas del periodo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {latestSales.map((sale) => (
              <div
                key={sale.id}
                className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2"
              >
                <div>
                  <p className="font-mono text-xs text-muted-foreground">{formatCompactId(sale.id)}</p>
                  <p className="text-sm font-medium">{sale.seller_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(sale.sold_at).toLocaleString('es-CL')} · {sale.item_count} item(s)
                  </p>
                </div>
                <p className="text-sm font-semibold">{formatMoney(sale.total_amount)}</p>
              </div>
            ))}

            {!summaryQuery.isLoading && latestSales.length === 0 && (
              <p className="text-sm text-muted-foreground">No hay ventas en este periodo.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
