'use client'

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/constants/query-keys'
import { inventoryService } from '@/lib/services/inventory.service'
import { salesService } from '@/lib/services/sales.service'

export function useDashboardDailySummary(date: string) {
  return useQuery({
    queryKey: queryKeys.sales.dailySummary(date),
    queryFn: () => salesService.getDailySalesSummary(date),
  })
}

export function useDashboardLowStockCount() {
  return useQuery({
    queryKey: queryKeys.inventory.lowStock,
    queryFn: () => inventoryService.listLowStockProducts(),
    select: (rows) => rows.length,
  })
}

export function useDashboardRecentSales(limit = 6) {
  return useQuery({
    queryKey: queryKeys.sales.recent(limit),
    queryFn: () => salesService.listRecentSales(limit),
  })
}
