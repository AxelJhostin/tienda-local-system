import { createClient } from '@/lib/supabase/client'
import { toServiceError } from '@/lib/services/service-error'

export type CustomerListItem = {
  id: string
  full_name: string
  phone: string | null
  national_id: string | null
  notes: string | null
  created_at: string
}

export const customersService = {
  async list(): Promise<CustomerListItem[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('customers')
      .select('id, full_name, phone, national_id, notes, created_at')
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) {
      throw toServiceError(error, 'No se pudieron obtener los clientes.')
    }

    return data ?? []
  },
}
