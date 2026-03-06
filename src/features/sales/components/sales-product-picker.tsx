'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { SalesProductPickerProps } from '@/features/sales/types/sales.types'

function formatMoney(value: number) {
  return `$${value.toLocaleString('es-CL')}`
}

export function SalesProductPicker({
  search,
  onSearchChange,
  products,
  isLoading,
  selectedProductId,
  onSelectProduct,
}: SalesProductPickerProps) {
  return (
    <Card className="border-border/80 bg-white/90 xl:col-span-2">
      <CardHeader>
        <CardTitle>Agregar items</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="salesSearch">Buscar producto</Label>
          <Input
            id="salesSearch"
            placeholder="Nombre o codigo"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>

        <div className="max-h-72 overflow-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Sugerido/Minimo</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="font-medium">{product.name}</div>
                    <div className="font-mono text-xs text-muted-foreground">
                      {product.internal_code}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.inventory_mode}</Badge>
                  </TableCell>
                  <TableCell>{product.current_stock}</TableCell>
                  <TableCell className="text-xs">
                    <div>{formatMoney(product.suggested_price)}</div>
                    <div className="text-muted-foreground">
                      min {formatMoney(product.minimum_price)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant={selectedProductId === product.id ? 'default' : 'outline'}
                      onClick={() => onSelectProduct(product)}
                    >
                      {selectedProductId === product.id ? 'Seleccionado' : 'Seleccionar'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Cargando productos...
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}


