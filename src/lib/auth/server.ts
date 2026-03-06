import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type ServerSession = {
  userId: string
  email: string | null
  staffRole: 'admin' | 'seller'
  staffFullName: string
}

export async function requireServerSession(): Promise<ServerSession> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('staff_profiles')
    .select('id, role, full_name, is_active')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.is_active) {
    redirect('/login')
  }

  return {
    userId: user.id,
    email: user.email ?? null,
    staffRole: profile.role,
    staffFullName: profile.full_name,
  }
}

