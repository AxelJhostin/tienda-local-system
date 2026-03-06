import { createClient } from '@/lib/supabase/client'
import { getAuthenticatedProfileId } from '@/lib/services/authenticated-profile'
import { toServiceError } from '@/lib/services/service-error'

export type CreateQuantitySaleInput = {
  productId: string
  quantity: number
  unitPriceSold: number
  customerId?: string | null
  notes?: string | null
}

export type CreateSerialSaleInput = {
  productId: string
  serializedUnitId: string
  unitPriceSold: number
  customerId?: string | null
  notes?: string | null
}

export type RecentSaleItem = {
  id: string
  sold_at: string
  total_amount: number
  customer_name: string | null
  seller_name: string | null
  items: Array<{
    id: string
    quantity: number
    unit_price_sold: number
    subtotal: number
    product_name: string | null
    product_code: string | null
    serial_value: string | null
  }>
}

type RecentSalesQueryRow = {
  id: string
  sold_at: string
  total_amount: number
  customer: { full_name: string } | null
  seller: { full_name: string } | null
  sale_items: Array<{
    id: string
    quantity: number
    unit_price_sold: number
    subtotal: number
    product: { name: string; internal_code: string } | null
    serialized_unit: { serial_value: string } | null
  }>
}

export const salesService = {
  async createQuantitySale(input: CreateQuantitySaleInput): Promise<string> {
    const supabase = createClient()
    const profileId = await getAuthenticatedProfileId()

    const { data, error } = await supabase.rpc('create_quantity_sale', {
      p_seller_profile_id: profileId,
      p_product_id: input.productId,
      p_quantity: input.quantity,
      p_unit_price_sold: input.unitPriceSold,
      p_customer_id: input.customerId ?? null,
      p_notes: input.notes ?? null,
    })

    if (error) {
      throw toServiceError(error, 'No se pudo registrar la venta por cantidad.')
    }

    return data as string
  },

  async createSerialSale(input: CreateSerialSaleInput): Promise<string> {
    const supabase = createClient()
    const profileId = await getAuthenticatedProfileId()

    const { data, error } = await supabase.rpc('create_serial_sale', {
      p_seller_profile_id: profileId,
      p_product_id: input.productId,
      p_serialized_unit_id: input.serializedUnitId,
      p_unit_price_sold: input.unitPriceSold,
      p_customer_id: input.customerId ?? null,
      p_notes: input.notes ?? null,
    })

    if (error) {
      throw toServiceError(error, 'No se pudo registrar la venta serializada.')
    }

    return data as string
  },

  async listRecentSales(limit = 20): Promise<RecentSaleItem[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('sales')
      .select(
        `
          id,
          sold_at,
          total_amount,
          customer:customer_id ( full_name ),
          seller:seller_profile_id ( full_name ),
          sale_items (
            id,
            quantity,
            unit_price_sold,
            subtotal,
            product:product_id ( name, internal_code ),
            serialized_unit:serialized_unit_id ( serial_value )
          )
        `
      )
      .order('sold_at', { ascending: false })
      .limit(limit)
      .returns<RecentSalesQueryRow[]>()

    if (error) {
      throw toServiceError(error, 'No se pudo obtener el historial de ventas.')
    }

    const rows = data ?? []
    return rows.map((row) => ({
      id: row.id,
      sold_at: row.sold_at,
      total_amount: row.total_amount,
      customer_name: row.customer?.full_name ?? null,
      seller_name: row.seller?.full_name ?? null,
      items: (row.sale_items ?? []).map((item) => ({
        id: item.id,
        quantity: item.quantity,
        unit_price_sold: item.unit_price_sold,
        subtotal: item.subtotal,
        product_name: item.product?.name ?? null,
        product_code: item.product?.internal_code ?? null,
        serial_value: item.serialized_unit?.serial_value ?? null,
      })),
    }))
  },
}
