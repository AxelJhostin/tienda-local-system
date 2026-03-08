import { createClient } from '@/lib/supabase/client'
import { toServiceError } from '@/lib/services/service-error'

export type CommercialSummaryFilters = {
  dateFrom: string
  dateTo: string
}

export type SellerCommercialSummary = {
  seller_id: string | null
  seller_name: string
  sale_count: number
  total_sold: number
  total_items: number
}

export type CommercialReportSaleRow = {
  id: string
  sold_at: string
  seller_name: string
  total_amount: number
  item_count: number
}

export type CommercialReportSummary = {
  date_from: string
  date_to: string
  sale_count: number
  total_sold: number
  total_items_sold: number
  by_inventory_mode: {
    quantity: number
    serial: number
  }
  by_seller: SellerCommercialSummary[]
  sales: CommercialReportSaleRow[]
}

type CommercialReportQueryRow = {
  id: string
  sold_at: string
  total_amount: number
  seller: { id: string; full_name: string } | null
  sale_items:
    | Array<{
        quantity: number
        product: { inventory_mode: 'serial' | 'quantity' } | null
      }>
    | null
}

export const reportsService = {
  async getCommercialSummary(filters: CommercialSummaryFilters): Promise<CommercialReportSummary> {
    if (!filters.dateFrom || !filters.dateTo) {
      throw new Error('Debes indicar un rango de fechas valido.')
    }

    if (filters.dateFrom > filters.dateTo) {
      throw new Error('La fecha "desde" no puede ser mayor que la fecha "hasta".')
    }

    const supabase = createClient()
    const { data, error } = await supabase
      .from('sales')
      .select(
        `
          id,
          sold_at,
          total_amount,
          seller:seller_profile_id ( id, full_name ),
          sale_items (
            quantity,
            product:product_id ( inventory_mode )
          )
        `
      )
      .gte('sold_at', `${filters.dateFrom}T00:00:00`)
      .lte('sold_at', `${filters.dateTo}T23:59:59.999`)
      .order('sold_at', { ascending: false })
      .returns<CommercialReportQueryRow[]>()

    if (error) {
      throw toServiceError(error, 'No se pudo cargar el resumen comercial.')
    }

    const rows = data ?? []
    const sellerMap = new Map<string, SellerCommercialSummary>()
    const sales: CommercialReportSaleRow[] = []

    let totalSold = 0
    let totalItemsSold = 0
    let quantityItems = 0
    let serialItems = 0

    for (const row of rows) {
      totalSold += row.total_amount

      const sellerId = row.seller?.id ?? null
      const sellerKey = sellerId ?? 'unknown'
      const sellerName = row.seller?.full_name ?? 'Sin vendedor'
      let saleItemsCount = 0

      for (const item of row.sale_items ?? []) {
        const quantity = item.quantity
        saleItemsCount += quantity
        totalItemsSold += quantity

        if (item.product?.inventory_mode === 'serial') {
          serialItems += quantity
        } else {
          quantityItems += quantity
        }
      }

      const existingSellerSummary = sellerMap.get(sellerKey)
      if (existingSellerSummary) {
        existingSellerSummary.sale_count += 1
        existingSellerSummary.total_sold += row.total_amount
        existingSellerSummary.total_items += saleItemsCount
      } else {
        sellerMap.set(sellerKey, {
          seller_id: sellerId,
          seller_name: sellerName,
          sale_count: 1,
          total_sold: row.total_amount,
          total_items: saleItemsCount,
        })
      }

      sales.push({
        id: row.id,
        sold_at: row.sold_at,
        seller_name: sellerName,
        total_amount: row.total_amount,
        item_count: saleItemsCount,
      })
    }

    return {
      date_from: filters.dateFrom,
      date_to: filters.dateTo,
      sale_count: rows.length,
      total_sold: totalSold,
      total_items_sold: totalItemsSold,
      by_inventory_mode: {
        quantity: quantityItems,
        serial: serialItems,
      },
      by_seller: Array.from(sellerMap.values()).sort((a, b) => b.total_sold - a.total_sold),
      sales,
    }
  },

  async salesSummary(dateFrom: string, dateTo: string) {
    return reportsService.getCommercialSummary({ dateFrom, dateTo })
  },
}
