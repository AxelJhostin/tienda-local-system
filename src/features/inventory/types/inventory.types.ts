import type { InventoryProduct, SerializedUnit } from '@/lib/services/inventory.service'

export type InventoryCategoryOption = {
  id: string
  name: string
  icon: string | null
}

export type LowStockAlertLevel = 'out' | 'critical' | 'low'

export type InventoryProductsTableProps = {
  products: InventoryProduct[]
  isLoading: boolean
  selectedProductId: string | null
  onSelectProduct: (productId: string) => void
}

export type InventoryFiltersProps = {
  search: string
  onSearchChange: (value: string) => void
  categoryId: string
  onCategoryChange: (value: string) => void
  categories: InventoryCategoryOption[]
}

export type InventoryQuantityAdjusterProps = {
  quantityValue: number
  onQuantityValueChange: (value: number) => void
  reason: string
  onReasonChange: (value: string) => void
  onSubmit: () => void
  isPending: boolean
}

export type InventorySerialUnitsPanelProps = {
  serialValue: string
  onSerialValueChange: (value: string) => void
  onAddSerializedUnit: () => void
  isAdding: boolean
  deactivateReason: string
  onDeactivateReasonChange: (value: string) => void
  serializedUnits: SerializedUnit[]
  isLoading: boolean
  onDeactivateSerializedUnit: (serializedUnitId: string) => void
  isDeactivating: boolean
}

export type InventoryLowStockTableProps = {
  products: InventoryProduct[]
  isLoading: boolean
}
