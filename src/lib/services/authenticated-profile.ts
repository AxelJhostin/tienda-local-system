import { createClient } from '@/lib/supabase/client'
import { toServiceError } from '@/lib/services/service-error'

export async function getAuthenticatedProfileId() {
  const supabase = createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw toServiceError(error, 'No se pudo validar la sesión del usuario.')
  }

  return user.id
}

