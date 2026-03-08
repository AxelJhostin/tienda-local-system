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

export type CreateCheckoutSaleItemInput =
  | {
      mode: 'quantity'
      productId: string
      quantity: number
      unitPriceSold: number
    }
  | {
      mode: 'serial'
      productId: string
      serializedUnitId: string
      unitPriceSold: number
      quantity?: 1
    }

export type CreateCheckoutSaleInput = {
  items: CreateCheckoutSaleItemInput[]
  customerId?: string | null
  notes?: string | null
  checkoutRef?: string | null
}

export type CheckoutSaleResult = {
  sale_id: string
  total_amount: number
  item_count: number
  checkout_ref: string | null
  idempotent_replay: boolean
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

function mapCheckoutSaleResult(payload: unknown): CheckoutSaleResult {
  if (typeof payload !== 'object' || payload === null) {
    throw new Error('La respuesta del checkout no tiene un formato valido.')
  }

  const row = payload as Record<string, unknown>
  const checkoutRefRaw = row.checkout_ref

  if (
    typeof row.sale_id !== 'string' ||
    typeof row.total_amount !== 'number' ||
    typeof row.item_count !== 'number' ||
    typeof row.idempotent_replay !== 'boolean' ||
    !(typeof checkoutRefRaw === 'string' || checkoutRefRaw === null)
  ) {
    throw new Error('La respuesta del checkout atomico no cumple el contrato esperado.')
  }

  return {
    sale_id: row.sale_id,
    total_amount: row.total_amount,
    item_count: row.item_count,
    checkout_ref: checkoutRefRaw,
    idempotent_replay: row.idempotent_replay,
  }
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

  async createCheckoutSale(input: CreateCheckoutSaleInput): Promise<CheckoutSaleResult> {
    const supabase = createClient()

    const rpcItems = input.items.map((item) => {
      if (item.mode === 'quantity') {
        return {
          product_id: item.productId,
          mode: item.mode,
          quantity: item.quantity,
          unit_price_sold: item.unitPriceSold,
        }
      }

      return {
        product_id: item.productId,
        mode: item.mode,
        quantity: item.quantity ?? 1,
        serialized_unit_id: item.serializedUnitId,
        unit_price_sold: item.unitPriceSold,
      }
    })

    const { data, error } = await supabase.rpc('create_checkout_sale', {
      p_items: rpcItems,
      p_customer_id: input.customerId ?? null,
      p_notes: input.notes ?? null,
      p_checkout_ref: input.checkoutRef ?? null,
    })

    if (error) {
      throw toServiceError(error, 'No se pudo registrar la venta atomica.')
    }

    try {
      return mapCheckoutSaleResult(data)
    } catch (parseError) {
      throw toServiceError(parseError, 'La respuesta del checkout atomico fue invalida.')
    }
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
