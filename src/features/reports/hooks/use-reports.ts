'use client'

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/constants/query-keys'
import {
  reportsService,
  type CommercialSummaryFilters,
} from '@/lib/services/reports.service'

export function useCommercialSummary(filters: CommercialSummaryFilters) {
  return useQuery({
    queryKey: queryKeys.reports.commercialSummary({
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
    }),
    queryFn: () => reportsService.getCommercialSummary(filters),
  })
}
