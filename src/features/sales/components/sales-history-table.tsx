'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { SalesHistoryTableProps } from '@/features/sales/types/sales.types'

function formatMoney(value: number) {
  return `$${value.toLocaleString('es-CL')}`
}

export function SalesHistoryTable({ sales, isLoading }: SalesHistoryTableProps) {
  return (
    <Card className="border-border/80 bg-white/90">
      <CardHeader>
        <CardTitle>Ventas registradas</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Venta</TableHead>
              <TableHead>Vendedor</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Checkout ref</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>{new Date(sale.sold_at).toLocaleString('es-CL')}</TableCell>
                <TableCell className="font-mono text-xs">{sale.id}</TableCell>
                <TableCell>{sale.seller_name ?? '-'}</TableCell>
                <TableCell>{sale.customer_name ?? 'Sin cliente'}</TableCell>
                <TableCell>
                  <Badge variant="outline">{sale.item_count}</Badge>
                </TableCell>
                <TableCell className="font-semibold">{formatMoney(sale.total_amount)}</TableCell>
                <TableCell className="font-mono text-xs">
                  {sale.checkout_ref ? sale.checkout_ref : '-'}
                </TableCell>
              </TableRow>
            ))}

            {isLoading && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Cargando historial...
                </TableCell>
              </TableRow>
            )}

            {!isLoading && sales.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No hay ventas para los filtros aplicados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
