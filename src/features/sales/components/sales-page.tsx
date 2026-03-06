'use client'

import { useMemo, useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import {
  useCheckoutSales,
  useProductSerializedUnits,
  useRecentSales,
  useSalesCustomers,
  useSalesProducts,
} from '@/features/sales/hooks/use-sales'
import { SalesProductPicker } from '@/features/sales/components/sales-product-picker'
import { SalesItemEditor } from '@/features/sales/components/sales-item-editor'
import { SalesCartPanel } from '@/features/sales/components/sales-cart-panel'
import { SalesRecentTable } from '@/features/sales/components/sales-recent-table'
import type { InventoryProduct } from '@/lib/services/inventory.service'
import type { CartItem } from '@/features/sales/types/sales.types'

export function SalesPageContent() {
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [selectedQuantity, setSelectedQuantity] = useState(1)
  const [selectedPrice, setSelectedPrice] = useState<number>(0)
  const [selectedSerializedUnitId, setSelectedSerializedUnitId] = useState('')
  const [customerId, setCustomerId] = useState('none')
  const [notes, setNotes] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])

  const productsQuery = useSalesProducts(search)
  const customersQuery = useSalesCustomers()
  const checkoutMutation = useCheckoutSales()
  const recentSalesQuery = useRecentSales(25)

  const selectedProduct = useMemo(
    () => productsQuery.data?.find((product) => product.id === selectedProductId) ?? null,
    [productsQuery.data, selectedProductId]
  )

  const serializedUnitsQuery = useProductSerializedUnits(
    selectedProduct?.inventory_mode === 'serial' ? selectedProduct.id : null
  )

  const availableSerializedUnits = (serializedUnitsQuery.data ?? []).filter(
    (unit) => unit.status === 'available'
  )

  const totalAmount = useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity * item.unitPriceSold, 0),
    [cart]
  )

  const handlePickProduct = (product: InventoryProduct) => {
    setSelectedProductId(product.id)
    setSelectedPrice(product.suggested_price)
    setSelectedQuantity(1)
    setSelectedSerializedUnitId('')
  }

  const handleAddToCart = () => {
    if (!selectedProduct) {
      toast({ variant: 'destructive', title: 'Selecciona un producto' })
      return
    }

    if (selectedPrice < 0) {
      toast({
        variant: 'destructive',
        title: 'Precio invalido',
        description: 'El precio no puede ser negativo.',
      })
      return
    }

    if (selectedProduct.inventory_mode === 'quantity') {
      if (!Number.isInteger(selectedQuantity) || selectedQuantity <= 0) {
        toast({ variant: 'destructive', title: 'Cantidad invalida' })
        return
      }
      if (selectedQuantity > selectedProduct.current_stock) {
        toast({
          variant: 'destructive',
          title: 'Stock insuficiente',
          description: `Disponible: ${selectedProduct.current_stock}`,
        })
        return
      }
    }

    if (selectedProduct.inventory_mode === 'serial' && !selectedSerializedUnitId) {
      toast({ variant: 'destructive', title: 'Selecciona IMEI/serial' })
      return
    }

    const selectedUnit = availableSerializedUnits.find(
      (unit) => unit.id === selectedSerializedUnitId
    )

    const item: CartItem = {
      id: crypto.randomUUID(),
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      productCode: selectedProduct.internal_code,
      mode: selectedProduct.inventory_mode,
      quantity: selectedProduct.inventory_mode === 'serial' ? 1 : selectedQuantity,
      unitPriceSold: selectedPrice,
      serializedUnitId:
        selectedProduct.inventory_mode === 'serial' ? selectedSerializedUnitId : undefined,
      serializedValue:
        selectedProduct.inventory_mode === 'serial' ? selectedUnit?.serial_value : undefined,
    }

    setCart((prev) => [...prev, item])
    setSelectedQuantity(1)
    setSelectedSerializedUnitId('')
  }

  const handleRemoveFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId))
  }

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast({ variant: 'destructive', title: 'No hay items en el carrito' })
      return
    }

    const ticketRef = `TICKET-${new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}`

    try {
      const saleIds = await checkoutMutation.mutateAsync({
        items: cart.map((item) => ({
          mode: item.mode,
          productId: item.productId,
          quantity: item.quantity,
          unitPriceSold: item.unitPriceSold,
          serializedUnitId: item.serializedUnitId,
        })),
        customerId: customerId === 'none' ? null : customerId,
        notes: notes.trim() || null,
        ticketRef,
      })

      setCart([])
      setNotes('')
      setSelectedProductId('')
      setSelectedSerializedUnitId('')
      setSelectedQuantity(1)
      toast({
        title: 'Venta registrada',
        description: `Items procesados: ${saleIds.length}. Ref: ${ticketRef}`,
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al registrar venta',
        description: error instanceof Error ? error.message : 'Intenta nuevamente.',
      })
    }
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <SalesProductPicker
            search={search}
            onSearchChange={setSearch}
            products={productsQuery.data ?? []}
            isLoading={productsQuery.isLoading}
            selectedProductId={selectedProductId}
            onSelectProduct={handlePickProduct}
          />
          <SalesItemEditor
            selectedProduct={selectedProduct}
            selectedQuantity={selectedQuantity}
            onSelectedQuantityChange={setSelectedQuantity}
            selectedPrice={selectedPrice}
            onSelectedPriceChange={setSelectedPrice}
            selectedSerializedUnitId={selectedSerializedUnitId}
            onSelectedSerializedUnitIdChange={setSelectedSerializedUnitId}
            availableSerializedUnits={availableSerializedUnits}
            onAddToCart={handleAddToCart}
          />
        </div>

        <SalesCartPanel
          customers={customersQuery.data ?? []}
          customerId={customerId}
          onCustomerIdChange={setCustomerId}
          notes={notes}
          onNotesChange={setNotes}
          cart={cart}
          totalAmount={totalAmount}
          onRemoveFromCart={handleRemoveFromCart}
          onCheckout={handleCheckout}
          isCheckoutPending={checkoutMutation.isPending}
        />
      </div>

      <SalesRecentTable sales={recentSalesQuery.data ?? []} isLoading={recentSalesQuery.isLoading} />
    </div>
  )
}

