'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import {
  useAddSerializedUnit,
  useAdjustQuantityStock,
  useCatalogCategories,
  useDeactivateSerializedUnit,
  useInventoryProducts,
  useSerializedUnits,
} from '@/features/inventory/hooks/use-inventory'
import { InventoryFilters } from '@/features/inventory/components/inventory-filters'
import { InventoryProductsTable } from '@/features/inventory/components/inventory-products-table'
import { InventoryQuantityAdjuster } from '@/features/inventory/components/inventory-quantity-adjuster'
import { InventorySerialUnitsPanel } from '@/features/inventory/components/inventory-serial-units-panel'

export function InventoryPageContent() {
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState<string>('')
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [adjustQuantityValue, setAdjustQuantityValue] = useState<number>(0)
  const [adjustReason, setAdjustReason] = useState('')
  const [serialValue, setSerialValue] = useState('')
  const [serialDeactivateReason, setSerialDeactivateReason] = useState('')

  const categoriesQuery = useCatalogCategories()
  const productsQuery = useInventoryProducts({ search, categoryId: categoryId || undefined })
  const adjustQuantityMutation = useAdjustQuantityStock()
  const addSerializedUnitMutation = useAddSerializedUnit()
  const deactivateSerializedUnitMutation = useDeactivateSerializedUnit()

  const selectedProduct = useMemo(
    () => productsQuery.data?.find((item) => item.id === selectedProductId) ?? null,
    [productsQuery.data, selectedProductId]
  )

  const serializedUnitsQuery = useSerializedUnits(
    selectedProduct?.inventory_mode === 'serial' ? selectedProduct.id : null
  )

  const handleAdjustQuantity = async () => {
    if (!selectedProduct || selectedProduct.inventory_mode !== 'quantity') return
    if (!adjustReason.trim()) {
      toast({
        variant: 'destructive',
        title: 'Motivo requerido',
        description: 'Debes indicar el motivo del ajuste de stock.',
      })
      return
    }
    if (!Number.isInteger(adjustQuantityValue) || adjustQuantityValue === 0) {
      toast({
        variant: 'destructive',
        title: 'Cantidad invalida',
        description: 'El ajuste debe ser un numero entero distinto de cero.',
      })
      return
    }

    try {
      await adjustQuantityMutation.mutateAsync({
        productId: selectedProduct.id,
        delta: adjustQuantityValue,
        reason: adjustReason.trim(),
      })
      setAdjustQuantityValue(0)
      setAdjustReason('')
      toast({
        title: 'Stock ajustado',
        description: 'El ajuste de inventario se registro correctamente.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al ajustar stock',
        description: error instanceof Error ? error.message : 'Intenta nuevamente.',
      })
    }
  }

  const handleAddSerializedUnit = async () => {
    if (!selectedProduct || selectedProduct.inventory_mode !== 'serial') return
    if (!serialValue.trim()) {
      toast({
        variant: 'destructive',
        title: 'Serial requerido',
        description: 'Debes ingresar IMEI o serial.',
      })
      return
    }

    try {
      await addSerializedUnitMutation.mutateAsync({
        productId: selectedProduct.id,
        serialValue: serialValue.trim(),
      })
      setSerialValue('')
      toast({
        title: 'Unidad agregada',
        description: 'El serial se registro correctamente.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al agregar serial',
        description: error instanceof Error ? error.message : 'Intenta nuevamente.',
      })
    }
  }

  const handleDeactivateSerializedUnit = async (serializedUnitId: string) => {
    if (!serialDeactivateReason.trim()) {
      toast({
        variant: 'destructive',
        title: 'Motivo requerido',
        description: 'Ingresa motivo para desactivar la unidad.',
      })
      return
    }
    try {
      await deactivateSerializedUnitMutation.mutateAsync({
        serializedUnitId,
        reason: serialDeactivateReason.trim(),
      })
      toast({
        title: 'Unidad desactivada',
        description: 'La unidad serializada se desactivo correctamente.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al desactivar unidad',
        description: error instanceof Error ? error.message : 'Intenta nuevamente.',
      })
    }
  }

  return (
    <div className="grid gap-4">
      <InventoryFilters
        search={search}
        onSearchChange={setSearch}
        categoryId={categoryId}
        onCategoryChange={setCategoryId}
        categories={categoriesQuery.data ?? []}
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <InventoryProductsTable
          products={productsQuery.data ?? []}
          isLoading={productsQuery.isLoading}
          selectedProductId={selectedProductId}
          onSelectProduct={setSelectedProductId}
        />

        <Card className="border-border/80 bg-white/90">
          <CardHeader>
            <CardTitle>Gestion de stock</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedProduct && (
              <p className="text-sm text-muted-foreground">
                Selecciona un producto para ver IMEIs o ajustar stock.
              </p>
            )}

            {selectedProduct && (
              <>
                <div className="space-y-1">
                  <p className="text-sm font-medium">{selectedProduct.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Codigo {selectedProduct.internal_code} - stock actual {selectedProduct.current_stock}
                  </p>
                </div>

                {selectedProduct.inventory_mode === 'quantity' && (
                  <InventoryQuantityAdjuster
                    quantityValue={adjustQuantityValue}
                    onQuantityValueChange={setAdjustQuantityValue}
                    reason={adjustReason}
                    onReasonChange={setAdjustReason}
                    onSubmit={handleAdjustQuantity}
                    isPending={adjustQuantityMutation.isPending}
                  />
                )}

                {selectedProduct.inventory_mode === 'serial' && (
                  <InventorySerialUnitsPanel
                    serialValue={serialValue}
                    onSerialValueChange={setSerialValue}
                    onAddSerializedUnit={handleAddSerializedUnit}
                    isAdding={addSerializedUnitMutation.isPending}
                    deactivateReason={serialDeactivateReason}
                    onDeactivateReasonChange={setSerialDeactivateReason}
                    serializedUnits={serializedUnitsQuery.data ?? []}
                    isLoading={serializedUnitsQuery.isLoading}
                    onDeactivateSerializedUnit={handleDeactivateSerializedUnit}
                    isDeactivating={deactivateSerializedUnitMutation.isPending}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
