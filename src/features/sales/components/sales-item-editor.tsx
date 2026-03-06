'use client'

import { Button } from '@/components/ui/button'
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

  return (
    <div className="grid gap-3 rounded-md border p-4 md:grid-cols-4">
      <div className="md:col-span-2">
        <p className="text-sm font-medium">{selectedProduct.name}</p>
        <p className="text-xs text-muted-foreground">
          Sugerido {formatMoney(selectedProduct.suggested_price)} - minimo{' '}
          {formatMoney(selectedProduct.minimum_price)}
        </p>
      </div>

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

      <div className="md:col-span-4">
        <Button onClick={onAddToCart}>Agregar al carrito</Button>
      </div>
    </div>
  )
}

