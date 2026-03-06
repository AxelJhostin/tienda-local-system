'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { SalesRecentTableProps } from '@/features/sales/types/sales.types'

function formatMoney(value: number) {
  return `$${value.toLocaleString('es-CL')}`
}

export function SalesRecentTable({ sales, isLoading }: SalesRecentTableProps) {
  return (
    <Card className="border-border/80 bg-white/90">
      <CardHeader>
        <CardTitle>Ventas recientes</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Vendedor</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>{new Date(sale.sold_at).toLocaleString('es-CL')}</TableCell>
                <TableCell>{sale.customer_name ?? 'Sin cliente'}</TableCell>
                <TableCell>{sale.seller_name ?? '-'}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {sale.items.map((item) => (
                      <div key={item.id} className="text-xs">
                        {(item.product_name ?? 'Producto')} x{item.quantity}
                        {item.serial_value ? ` - ${item.serial_value}` : ''}
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{formatMoney(sale.total_amount)}</TableCell>
              </TableRow>
            ))}
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Cargando ventas...
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}


