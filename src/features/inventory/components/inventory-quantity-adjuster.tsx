'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { InventoryQuantityAdjusterProps } from '@/features/inventory/types/inventory.types'

export function InventoryQuantityAdjuster({
  quantityValue,
  onQuantityValueChange,
  reason,
  onReasonChange,
  onSubmit,
  isPending,
}: InventoryQuantityAdjusterProps) {
  return (
    <div className="space-y-3 rounded-xl border border-border/70 bg-muted/30 p-3">
      <p className="text-sm font-medium">Ajustar stock por cantidad</p>
      <div className="space-y-2">
        <Label htmlFor="adjustQuantity">Cantidad (+/-)</Label>
        <Input
          id="adjustQuantity"
          type="number"
          value={quantityValue}
          onChange={(event) => onQuantityValueChange(Number(event.target.value))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="adjustReason">Motivo (obligatorio)</Label>
        <Input
          id="adjustReason"
          placeholder="Ej: inventario fisico de cierre"
          value={reason}
          onChange={(event) => onReasonChange(event.target.value)}
        />
      </div>
      <Button className="w-full" onClick={onSubmit} disabled={isPending}>
        {isPending ? 'Guardando...' : 'Guardar ajuste'}
      </Button>
    </div>
  )
}
