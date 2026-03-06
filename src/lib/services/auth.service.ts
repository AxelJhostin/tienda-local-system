import { createClient } from '@/lib/supabase/client'
import { toServiceError } from '@/lib/services/service-error'

export type StaffRole = 'admin' | 'seller'

export type StaffProfile = {
  id: string
  full_name: string
  username: string
  role: StaffRole
  is_active: boolean
}

export const authService = {
  async getCurrentStaffProfile(): Promise<StaffProfile | null> {
    const supabase = createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      throw toServiceError(userError, 'No se pudo validar la sesión actual.')
    }

    if (!user) return null

    const { data, error } = await supabase
      .from('staff_profiles')
      .select('id, full_name, username, role, is_active')
      .eq('id', user.id)
      .single()

    if (error) {
      throw toServiceError(error, 'No se pudo cargar el perfil del personal.')
    }

    return data
  },
}

