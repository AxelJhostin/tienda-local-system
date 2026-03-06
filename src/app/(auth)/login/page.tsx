'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, ShoppingBag, Smartphone } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-border/70 bg-card/80 shadow-[0_36px_80px_-46px_rgba(30,41,59,.45)] backdrop-blur lg:grid-cols-[1.08fr_.92fr]">
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 p-10 text-blue-50 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,.20),transparent_46%)]" />
          <div className="relative">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-100/90">Store OS</p>
            <h1 className="mt-4 max-w-md text-4xl font-extrabold leading-tight">
              InvenTrack para tienda de tecnologia
            </h1>
            <p className="mt-4 max-w-md text-sm text-blue-100/90">
              Controla ventas, inventario y trazabilidad de unidades serializadas en un solo panel.
            </p>
          </div>

          <div className="relative space-y-3">
            <div className="flex items-center gap-3 rounded-xl border border-white/25 bg-white/10 px-4 py-3">
              <ShoppingBag className="h-4 w-4" />
              <p className="text-sm">Checkout y registro de ventas</p>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-white/25 bg-white/10 px-4 py-3">
              <Smartphone className="h-4 w-4" />
              <p className="text-sm">IMEI y seriales con trazabilidad</p>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-white/25 bg-white/10 px-4 py-3">
              <ShieldCheck className="h-4 w-4" />
              <p className="text-sm">Seguridad con roles y RLS en Supabase</p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center p-5 sm:p-8 lg:p-10">
          <Card className="w-full max-w-md rounded-2xl border-border/80 bg-white/90 shadow-[0_16px_38px_-28px_rgba(17,24,39,.55)]">
            <CardHeader className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">Acceso privado</p>
              <CardTitle className="text-2xl font-extrabold tracking-tight">Iniciar sesion</CardTitle>
              <p className="text-sm text-muted-foreground">
                Ingresa con tu cuenta del staff para continuar.
              </p>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@local.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contrasena</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

                <Button type="submit" className="h-10 w-full rounded-xl" disabled={loading}>
                  {loading ? 'Ingresando...' : 'Ingresar'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
