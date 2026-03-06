'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton() {
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      toast({
        variant: 'destructive',
        title: 'No se pudo cerrar sesion',
        description: error.message,
      })
      return
    }

    router.push('/login')
    router.refresh()
  }

  return (
    <Button variant="outline" size="sm" className="rounded-full px-3" onClick={handleLogout}>
      <LogOut className="h-4 w-4" />
      Cerrar sesion
    </Button>
  )
}
