'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/constants/query-keys'
import { customersService } from '@/lib/services/customers.service'
import { inventoryService } from '@/lib/services/inventory.service'
import { salesService } from '@/lib/services/sales.service'

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
      ticketRef: string
    }) => {
      const createdSaleIds: string[] = []

      try {
        for (let index = 0; index < input.items.length; index += 1) {
          const item = input.items[index]
          const itemNoteBase = input.notes?.trim() ? `${input.notes.trim()} | ` : ''
          const itemNote = `${itemNoteBase}${input.ticketRef} item ${index + 1}/${input.items.length}`

          if (item.mode === 'quantity') {
            const saleId = await salesService.createQuantitySale({
              productId: item.productId,
              quantity: item.quantity,
              unitPriceSold: item.unitPriceSold,
              customerId: input.customerId ?? null,
              notes: itemNote,
            })
            createdSaleIds.push(saleId)
            continue
          }

          const saleId = await salesService.createSerialSale({
            productId: item.productId,
            serializedUnitId: item.serializedUnitId ?? '',
            unitPriceSold: item.unitPriceSold,
            customerId: input.customerId ?? null,
            notes: itemNote,
          })
          createdSaleIds.push(saleId)
        }
      } catch (error) {
        const partialCount = createdSaleIds.length
        const baseMessage =
          error instanceof Error ? error.message : 'Error desconocido en registro de ventas.'
        if (partialCount > 0) {
          throw new Error(
            `Se registraron ${partialCount} ítems antes del error. ${baseMessage}`
          )
        }
        throw error
      }

      return createdSaleIds
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['inventory'] })
      await queryClient.invalidateQueries({ queryKey: ['sales'] })
    },
  })
}
