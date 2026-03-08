import { createClient } from '@/lib/supabase/client'
import { toServiceError } from '@/lib/services/service-error'

export type StaffRole = 'admin' | 'seller'

export type StaffProfile = {
  id: string
  full_name: string
  username: string
  role: StaffRole
  is_active: boolean
  created_at?: string
  updated_at?: string
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

  async listStaffProfiles(): Promise<StaffProfile[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('staff_profiles')
      .select('id, full_name, username, role, is_active, created_at, updated_at')
      .order('full_name', { ascending: true })

    if (error) {
      throw toServiceError(error, 'No se pudo cargar el listado de personal.')
    }

    return data ?? []
  },

  async setStaffActiveStatus(input: { staffId: string; isActive: boolean }): Promise<StaffProfile> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('staff_profiles')
      .update({
        is_active: input.isActive,
      })
      .eq('id', input.staffId)
      .select('id, full_name, username, role, is_active, created_at, updated_at')
      .single()

    if (error) {
      throw toServiceError(error, 'No se pudo actualizar el estado del usuario.')
    }

    return data
  },
}
