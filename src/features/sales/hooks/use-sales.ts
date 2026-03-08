'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/constants/query-keys'
import { customersService } from '@/lib/services/customers.service'
import { inventoryService } from '@/lib/services/inventory.service'
import {
  salesService,
  type CheckoutSaleResult,
  type CreateCheckoutSaleItemInput,
  type SalesHistoryFilters,
} from '@/lib/services/sales.service'

export function useSalesProducts(search: string) {
  return useQuery({
    queryKey: queryKeys.inventory.products({ search }),
    queryFn: () => inventoryService.listProducts({ search }),
  })
}

export function useSalesCustomers() {
  return useQuery({
    queryKey: queryKeys.customers.list,
    queryFn: customersService.list,
  })
}

export function useProductSerializedUnits(productId: string | null) {
  return useQuery({
    queryKey: productId
      ? queryKeys.inventory.serializedUnits(productId)
      : ['inventory', 'serialized-units', 'sales-empty'],
    queryFn: () => inventoryService.listSerializedUnitsByProduct(productId ?? ''),
    enabled: Boolean(productId),
  })
}

export function useRecentSales(limit = 20) {
  return useQuery({
    queryKey: queryKeys.sales.recent(limit),
    queryFn: () => salesService.listRecentSales(limit),
  })
}

export function useSalesHistory(filters: SalesHistoryFilters) {
  return useQuery({
    queryKey: queryKeys.sales.history({
      dateFrom: filters.dateFrom ?? '',
      dateTo: filters.dateTo ?? '',
      limit: filters.limit ?? 200,
    }),
    queryFn: () => salesService.listSalesHistory(filters),
  })
}

export type CheckoutSaleCartItem = {
  mode: 'quantity' | 'serial'
  productId: string
  quantity: number
  unitPriceSold: number
  serializedUnitId?: string
}

export function useCheckoutSales() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      items: CheckoutSaleCartItem[]
      customerId?: string | null
      notes?: string | null
      checkoutRef?: string | null
    }): Promise<CheckoutSaleResult> => {
      const checkoutItems: CreateCheckoutSaleItemInput[] = input.items.map((item) => {
        if (item.mode === 'quantity') {
          return {
            mode: 'quantity',
            productId: item.productId,
            quantity: item.quantity,
            unitPriceSold: item.unitPriceSold,
          }
        }

        if (!item.serializedUnitId) {
          throw new Error('Item serial sin serializedUnitId.')
        }

        return {
          mode: 'serial',
          productId: item.productId,
          serializedUnitId: item.serializedUnitId,
          unitPriceSold: item.unitPriceSold,
          quantity: 1,
        }
      })

      return salesService.createCheckoutSale({
        items: checkoutItems,
        customerId: input.customerId ?? null,
        notes: input.notes ?? null,
        checkoutRef: input.checkoutRef ?? null,
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['inventory'] })
      await queryClient.invalidateQueries({ queryKey: ['sales'] })
    },
  })
}
