'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { InventoryProduct } from '@/lib/services/inventory.service'
import type { InventoryLowStockTableProps, LowStockAlertLevel } from '@/features/inventory/types/inventory.types'

function getAlertLevel(product: InventoryProduct): LowStockAlertLevel {
  if (product.current_stock === 0) return 'out'
  if (product.low_stock_threshold <= 1) return 'critical'

  const criticalThreshold = Math.max(1, Math.floor(product.low_stock_threshold / 2))
  return product.current_stock <= criticalThreshold ? 'critical' : 'low'
}

function renderAlertBadge(level: LowStockAlertLevel) {
  if (level === 'out') return <Badge variant="destructive">Agotado</Badge>
  if (level === 'critical') return <Badge variant="destructive">Critico</Badge>
  return <Badge variant="secondary">Stock bajo</Badge>
}

export function InventoryLowStockTable({ products, isLoading }: InventoryLowStockTableProps) {
  return (
    <Card className="border-border/80 bg-white/90">
      <CardHeader>
        <CardTitle>Productos en alerta</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Categoria / Marca</TableHead>
              <TableHead>Stock actual</TableHead>
              <TableHead>Umbral</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const alertLevel = getAlertLevel(product)
              return (
                <TableRow key={product.id}>
                  <TableCell>
                    <p className="font-medium">{product.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">{product.internal_code}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.inventory_mode}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {(product.category_name ?? 'Sin categoria') + ' / ' + (product.brand_name ?? 'Sin marca')}
                  </TableCell>
                  <TableCell className="font-semibold">{product.current_stock}</TableCell>
                  <TableCell>{product.low_stock_threshold}</TableCell>
                  <TableCell>{renderAlertBadge(alertLevel)}</TableCell>
                </TableRow>
              )
            })}

            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Cargando alertas de stock...
                </TableCell>
              </TableRow>
            )}

            {!isLoading && products.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No hay productos en alerta de stock bajo.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
