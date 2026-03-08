'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { SalesItemEditorProps } from '@/features/sales/types/sales.types'

function formatMoney(value: number) {
  return `$${value.toLocaleString('es-CL')}`
}

export function SalesItemEditor({
  selectedProduct,
  selectedQuantity,
  onSelectedQuantityChange,
  selectedPrice,
  onSelectedPriceChange,
  selectedSerializedUnitId,
  onSelectedSerializedUnitIdChange,
  availableSerializedUnits,
  onAddToCart,
}: SalesItemEditorProps) {
  if (!selectedProduct) return null

  const effectiveQuantity = selectedProduct.inventory_mode === 'serial' ? 1 : selectedQuantity
  const subtotal = effectiveQuantity * selectedPrice

  return (
    <Card className="border-border/80 bg-white/90">
      <CardHeader className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Paso 2</p>
        <CardTitle>Edicion del item</CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium">{selectedProduct.name}</p>
          <Badge variant="outline">{selectedProduct.inventory_mode}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Precio sugerido {formatMoney(selectedProduct.suggested_price)} | Minimo permitido{' '}
          {formatMoney(selectedProduct.minimum_price)}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-4">
          {selectedProduct.inventory_mode === 'quantity' ? (
            <div className="space-y-2">
              <Label htmlFor="salesQuantity">Cantidad</Label>
              <Input
                id="salesQuantity"
                type="number"
                min={1}
                value={selectedQuantity}
                onChange={(event) => onSelectedQuantityChange(Number(event.target.value))}
              />
            </div>
          ) : (
            <div className="space-y-2 md:col-span-2">
              <Label>IMEI / serial</Label>
              <Select
                value={selectedSerializedUnitId || 'none'}
                onValueChange={(value) => onSelectedSerializedUnitIdChange(value === 'none' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona unidad disponible" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Seleccionar</SelectItem>
                  {availableSerializedUnits.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.serial_value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="salesPrice">Precio final</Label>
            <Input
              id="salesPrice"
              type="number"
              min={0}
              value={selectedPrice}
              onChange={(event) => onSelectedPriceChange(Number(event.target.value))}
            />
          </div>

          <div className="space-y-1 rounded-lg border bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">Subtotal del item</p>
            <p className="text-lg font-semibold">{formatMoney(subtotal)}</p>
            <p className="text-xs text-muted-foreground">
              {selectedProduct.inventory_mode === 'serial'
                ? 'Cantidad fija: 1 unidad'
                : `Cantidad seleccionada: ${effectiveQuantity}`}
            </p>
          </div>
        </div>

        <Button size="lg" onClick={onAddToCart}>
          Agregar al carrito
        </Button>
      </CardContent>
    </Card>
  )
}
