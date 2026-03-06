import { createClient } from '@/lib/supabase/client'
import { toServiceError } from '@/lib/services/service-error'

export const productsService = {
  async listActive() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) {
      throw toServiceError(error, 'No se pudieron obtener los productos.')
    }

    return data
  },
}

