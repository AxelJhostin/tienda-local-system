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
  return (
    <Card className="border-border/80 bg-white/90">
      <CardHeader>
        <CardTitle>Carrito</CardTitle>
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
                {formatMoney(item.unitPriceSold)} - subtotal{' '}
                {formatMoney(item.quantity * item.unitPriceSold)}
              </p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm font-medium">
          <span>Total</span>
          <span>{formatMoney(totalAmount)}</span>
        </div>

        <Button className="w-full" onClick={onCheckout} disabled={isCheckoutPending}>
          {isCheckoutPending ? 'Procesando...' : 'Confirmar venta'}
        </Button>
        <p className="text-xs text-muted-foreground">
          Nota tecnica: cada item se registra con su RPC transaccional y referencia de ticket.
        </p>
      </CardContent>
    </Card>
  )
}


