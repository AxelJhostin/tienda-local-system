import { createClient } from '@/lib/supabase/client'
import { toServiceError } from '@/lib/services/service-error'

export const reportsService = {
  async salesSummary(dateFrom: string, dateTo: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('sales')
      .select('id, total_amount, sold_at, seller_profile_id')
      .gte('sold_at', dateFrom)
      .lte('sold_at', dateTo)

    if (error) {
      throw toServiceError(error, 'No se pudo cargar el resumen de ventas.')
    }

    return data
  },
}
