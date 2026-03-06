import type { InventoryProduct, SerializedUnit } from '@/lib/services/inventory.service'
import type { CustomerListItem } from '@/lib/services/customers.service'
import type { RecentSaleItem } from '@/lib/services/sales.service'

export type CartItem = {
  id: string
  productId: string
  productName: string
  productCode: string
  mode: 'quantity' | 'serial'
  quantity: number
  unitPriceSold: number
  serializedUnitId?: string
  serializedValue?: string
}

export type SalesProductPickerProps = {
  search: string
  onSearchChange: (value: string) => void
  products: InventoryProduct[]
  isLoading: boolean
  selectedProductId: string
  onSelectProduct: (product: InventoryProduct) => void
}

export type SalesItemEditorProps = {
  selectedProduct: InventoryProduct | null
  selectedQuantity: number
  onSelectedQuantityChange: (value: number) => void
  selectedPrice: number
  onSelectedPriceChange: (value: number) => void
  selectedSerializedUnitId: string
  onSelectedSerializedUnitIdChange: (value: string) => void
  availableSerializedUnits: SerializedUnit[]
  onAddToCart: () => void
}

export type SalesCartPanelProps = {
  customers: CustomerListItem[]
  customerId: string
  onCustomerIdChange: (value: string) => void
  notes: string
  onNotesChange: (value: string) => void
  cart: CartItem[]
  totalAmount: number
  onRemoveFromCart: (itemId: string) => void
  onCheckout: () => void
  isCheckoutPending: boolean
}

export type SalesRecentTableProps = {
  sales: RecentSaleItem[]
  isLoading: boolean
}

