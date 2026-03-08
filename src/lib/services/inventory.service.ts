import { createClient } from '@/lib/supabase/client'
import { getAuthenticatedProfileId } from '@/lib/services/authenticated-profile'
import { toServiceError } from '@/lib/services/service-error'

export type InventoryMode = 'serial' | 'quantity'

export type InventoryProduct = {
  id: string
  internal_code: string
  name: string
  description: string | null
  category_id: string
  brand_id: string | null
  inventory_mode: InventoryMode
  serial_kind: 'imei' | 'serial_number' | null
  reference_cost: number
  suggested_price: number
  minimum_price: number
  low_stock_threshold: number
  simple_stock: number
  is_active: boolean
  category_name: string | null
  category_icon: string | null
  brand_name: string | null
  current_stock: number
}

export type SerializedUnit = {
  id: string
  product_id: string
  serial_value: string
  status: 'available' | 'sold' | 'inactive'
  created_at: string
}

export type InventoryFilters = {
  search?: string
  categoryId?: string
}

type ProductQueryRow = {
  id: string
  internal_code: string
  name: string
  description: string | null
  category_id: string
  brand_id: string | null
  inventory_mode: InventoryMode
  serial_kind: 'imei' | 'serial_number' | null
  reference_cost: number
  suggested_price: number
  minimum_price: number
  low_stock_threshold: number
  simple_stock: number
  is_active: boolean
  categories: { id: string; name: string; icon: string | null }[] | null
  brands: { id: string; name: string }[] | null
}

export const inventoryService = {
  async listProducts(filters: InventoryFilters = {}): Promise<InventoryProduct[]> {
    const supabase = createClient()
    let query = supabase
      .from('products')
      .select(
        `
          id,
          internal_code,
          name,
          description,
          category_id,
          brand_id,
          inventory_mode,
          serial_kind,
          reference_cost,
          suggested_price,
          minimum_price,
          low_stock_threshold,
          simple_stock,
          is_active,
          categories:category_id ( id, name, icon ),
          brands:brand_id ( id, name )
        `
      )
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (filters.categoryId) {
      query = query.eq('category_id', filters.categoryId)
    }

    if (filters.search) {
      const term = filters.search.trim()
      if (term.length > 0) {
        query = query.or(`name.ilike.%${term}%,internal_code.ilike.%${term}%`)
      }
    }

    const { data: rows, error } = await query.returns<ProductQueryRow[]>()

    if (error) {
      throw toServiceError(error, 'No se pudieron obtener los productos de inventario.')
    }

    const products: ProductQueryRow[] = rows ?? []

    const serialProductIds = products
      .filter((product) => product.inventory_mode === 'serial')
      .map((product) => product.id)

    const availableCountByProductId = new Map<string, number>()

    if (serialProductIds.length > 0) {
      const { data: availableUnits, error: unitsError } = await supabase
        .from('serialized_units')
        .select('product_id')
        .in('product_id', serialProductIds)
        .eq('status', 'available')

      if (unitsError) {
        throw toServiceError(unitsError, 'No se pudo calcular el stock serializado.')
      }

      for (const unit of availableUnits) {
        const current = availableCountByProductId.get(unit.product_id) ?? 0
        availableCountByProductId.set(unit.product_id, current + 1)
      }
    }

    return products.map((product) => ({
      ...product,
      category_name:
        Array.isArray(product.categories) && product.categories[0]
          ? product.categories[0].name
          : null,
      category_icon:
        Array.isArray(product.categories) && product.categories[0]
          ? product.categories[0].icon
          : null,
      brand_name:
        Array.isArray(product.brands) && product.brands[0]
          ? product.brands[0].name
          : null,
      current_stock:
        product.inventory_mode === 'serial'
          ? availableCountByProductId.get(product.id) ?? 0
          : product.simple_stock,
    }))
  },

  async listLowStockProducts(): Promise<InventoryProduct[]> {
    const products = await inventoryService.listProducts()
    return products.filter((product) => product.current_stock <= product.low_stock_threshold)
  },

  async listSerializedUnitsByProduct(productId: string): Promise<SerializedUnit[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('serialized_units')
      .select('id, product_id, serial_value, status, created_at')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })

    if (error) {
      throw toServiceError(error, 'No se pudieron obtener los seriales del producto.')
    }

    return data
  },

  async adjustQuantityStock(input: {
    productId: string
    delta: number
    reason: string
  }): Promise<string> {
    const supabase = createClient()
    const profileId = await getAuthenticatedProfileId()

    const { data, error } = await supabase.rpc('adjust_quantity_stock', {
      p_product_id: input.productId,
      p_performed_by_profile_id: profileId,
      p_delta: input.delta,
      p_reason: input.reason,
    })

    if (error) {
      throw toServiceError(error, 'No se pudo ajustar el stock del producto.')
    }

    return data as string
  },

  async addSerializedUnit(input: {
    productId: string
    serialValue: string
    notes?: string
  }): Promise<string> {
    const supabase = createClient()
    const profileId = await getAuthenticatedProfileId()

    const { data, error } = await supabase.rpc('add_serialized_unit', {
      p_product_id: input.productId,
      p_serial_value: input.serialValue,
      p_performed_by_profile_id: profileId,
      p_notes: input.notes ?? null,
    })

    if (error) {
      throw toServiceError(error, 'No se pudo agregar la unidad serializada.')
    }

    return data as string
  },

  async deactivateSerializedUnit(input: {
    serializedUnitId: string
    reason: string
  }): Promise<string> {
    const supabase = createClient()
    const profileId = await getAuthenticatedProfileId()

    const { data, error } = await supabase.rpc('deactivate_serialized_unit', {
      p_serialized_unit_id: input.serializedUnitId,
      p_performed_by_profile_id: profileId,
      p_reason: input.reason,
    })

    if (error) {
      throw toServiceError(error, 'No se pudo desactivar la unidad serializada.')
    }

    return data as string
  },
}
