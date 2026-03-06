'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { InventoryProductsTableProps } from '@/features/inventory/types/inventory.types'

function stockVariant(stock: number, threshold: number) {
  if (stock <= 0) return 'destructive'
  if (stock <= threshold) return 'secondary'
  return 'default'
}

export function InventoryProductsTable({
  products,
  isLoading,
  selectedProductId,
  onSelectProduct,
}: InventoryProductsTableProps) {
  return (
    <Card className="border-border/80 bg-white/90 xl:col-span-2">
      <CardHeader>
        <CardTitle>Productos</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Codigo</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Sugerido/Minimo</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((item) => (
              <TableRow key={item.id} data-state={selectedProductId === item.id ? 'selected' : undefined}>
                <TableCell className="font-mono text-xs">{item.internal_code}</TableCell>
                <TableCell>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.category_icon ? `${item.category_icon} ` : ''}
                    {item.category_name ?? 'Sin categoria'} - {item.brand_name ?? 'Sin marca'}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{item.inventory_mode}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={stockVariant(item.current_stock, item.low_stock_threshold)}>
                    {item.current_stock}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs">
                  <div>${item.suggested_price.toLocaleString('es-CL')}</div>
                  <div className="text-muted-foreground">
                    min ${item.minimum_price.toLocaleString('es-CL')}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => onSelectProduct(item.id)}>
                    Gestionar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Cargando productos...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && products.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No hay productos para los filtros seleccionados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
