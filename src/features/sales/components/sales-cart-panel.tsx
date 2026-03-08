'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { SalesCartPanelProps } from '@/features/sales/types/sales.types'

function formatMoney(value: number) {
  return `$${value.toLocaleString('es-CL')}`
}

export function SalesCartPanel({
  customers,
  customerId,
  onCustomerIdChange,
  notes,
  onNotesChange,
  cart,
  totalAmount,
  onRemoveFromCart,
  onCheckout,
  isCheckoutPending,
}: SalesCartPanelProps) {
  const itemCount = cart.length

  return (
    <Card className="border-border/80 bg-white/90">
      <CardHeader className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Paso 3</p>
        <CardTitle>Carrito y confirmacion</CardTitle>
        <p className="text-sm text-muted-foreground">
          Revisa los items agregados y confirma la venta en una sola operacion.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Cliente (opcional)</Label>
          <Select value={customerId} onValueChange={onCustomerIdChange}>
            <SelectTrigger>
              <SelectValue placeholder="Sin cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin cliente</SelectItem>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="salesNotes">Notas</Label>
          <Textarea
            id="salesNotes"
            placeholder="Observaciones de la venta"
            value={notes}
            onChange={(event) => onNotesChange(event.target.value)}
          />
        </div>

        <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2 text-sm">
          <span className="font-medium">Items en carrito</span>
          <span className="font-semibold">{itemCount}</span>
        </div>

        <div className="max-h-60 space-y-2 overflow-auto rounded-md border p-2">
          {cart.length === 0 && <p className="text-sm text-muted-foreground">Sin items agregados.</p>}
          {cart.map((item) => (
            <div key={item.id} className="rounded border p-2 text-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{item.productName}</p>
                  <p className="font-mono text-xs text-muted-foreground">{item.productCode}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onRemoveFromCart(item.id)}>
                  Quitar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {item.mode === 'serial'
                  ? `IMEI/serial: ${item.serializedValue}`
                  : `Cantidad: ${item.quantity}`}
              </p>
              <p className="text-xs">
                {formatMoney(item.unitPriceSold)} - subtotal {formatMoney(item.quantity * item.unitPriceSold)}
              </p>
            </div>
          ))}
        </div>

        <div className="sticky bottom-0 space-y-3 rounded-md border bg-white p-3 shadow-sm">
          <div className="flex items-center justify-between text-sm font-medium">
            <span>Total de la venta</span>
            <span className="text-lg font-semibold">{formatMoney(totalAmount)}</span>
          </div>

          <Button
            className="h-11 w-full text-base font-semibold"
            onClick={onCheckout}
            disabled={isCheckoutPending || cart.length === 0}
          >
            {isCheckoutPending ? 'Procesando...' : 'Confirmar venta'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
