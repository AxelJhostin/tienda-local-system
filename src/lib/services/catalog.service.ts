import { createClient } from '@/lib/supabase/client'
import { toServiceError } from '@/lib/services/service-error'

export type CategoryItem = {
  id: string
  name: string
  icon: string | null
}

export type BrandItem = {
  id: string
  name: string
}

export const catalogService = {
  async listCategories(): Promise<CategoryItem[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, icon')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) {
      throw toServiceError(error, 'No se pudieron obtener las categorías.')
    }

    return data
  },

  async listBrands(): Promise<BrandItem[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('brands')
      .select('id, name')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) {
      throw toServiceError(error, 'No se pudieron obtener las marcas.')
    }

    return data
  },
}

