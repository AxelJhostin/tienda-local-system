'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/constants/query-keys'
import { catalogService } from '@/lib/services/catalog.service'
import { inventoryService, type InventoryFilters } from '@/lib/services/inventory.service'

export function useInventoryProducts(filters: InventoryFilters) {
  return useQuery({
    queryKey: queryKeys.inventory.products({
      search: filters.search?.trim() ?? '',
      categoryId: filters.categoryId ?? '',
    }),
    queryFn: () => inventoryService.listProducts(filters),
  })
}

export function useCatalogCategories() {
  return useQuery({
    queryKey: queryKeys.catalog.categories,
    queryFn: () => catalogService.listCategories(),
  })
}

export function useSerializedUnits(productId: string | null) {
  return useQuery({
    queryKey: productId ? queryKeys.inventory.serializedUnits(productId) : ['inventory', 'serialized-units', 'none'],
    queryFn: () => inventoryService.listSerializedUnitsByProduct(productId ?? ''),
    enabled: Boolean(productId),
  })
}

export function useLowStockProducts() {
  return useQuery({
    queryKey: queryKeys.inventory.lowStock,
    queryFn: () => inventoryService.listLowStockProducts(),
  })
}

export function useAdjustQuantityStock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: inventoryService.adjustQuantityStock,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['inventory'] })
    },
  })
}

export function useAddSerializedUnit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: inventoryService.addSerializedUnit,
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['inventory'] })
      await queryClient.invalidateQueries({
        queryKey: queryKeys.inventory.serializedUnits(variables.productId),
      })
    },
  })
}

export function useDeactivateSerializedUnit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: inventoryService.deactivateSerializedUnit,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['inventory'] })
      await queryClient.invalidateQueries({ queryKey: ['inventory', 'serialized-units'] })
    },
  })
}
