'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import type { StaffProfile } from '@/lib/services/auth.service'
import { useSetStaffActiveStatus, useStaffProfiles } from '@/features/users/hooks/use-users'
import { UsersTable } from '@/features/users/components/users-table'
import type { StaffFilters } from '@/features/users/types/users.types'

export function UsersPageContent({ currentUserId }: { currentUserId: string }) {
  const { toast } = useToast()
  const [filters, setFilters] = useState<StaffFilters>({
    search: '',
    role: 'all',
    status: 'all',
  })

  const staffQuery = useStaffProfiles()
  const setActiveMutation = useSetStaffActiveStatus()

  const filteredRows = useMemo(() => {
    const rows = staffQuery.data ?? []
    const search = filters.search.trim().toLowerCase()

    return rows.filter((row) => {
      if (filters.role !== 'all' && row.role !== filters.role) return false
      if (filters.status === 'active' && !row.is_active) return false
      if (filters.status === 'inactive' && row.is_active) return false

      if (!search) return true

      const target = `${row.full_name} ${row.username}`.toLowerCase()
      return target.includes(search)
    })
  }, [staffQuery.data, filters])

  const summary = useMemo(() => {
    const rows = staffQuery.data ?? []
    return {
      total: rows.length,
      active: rows.filter((user) => user.is_active).length,
      admins: rows.filter((user) => user.role === 'admin').length,
      sellers: rows.filter((user) => user.role === 'seller').length,
    }
  }, [staffQuery.data])

  const handleToggleActive = async (user: StaffProfile) => {
    if (user.id === currentUserId) {
      toast({
        variant: 'destructive',
        title: 'Accion bloqueada',
        description: 'No puedes cambiar tu propio estado desde esta pantalla.',
      })
      return
    }

    try {
      await setActiveMutation.mutateAsync({
        staffId: user.id,
        isActive: !user.is_active,
      })

      toast({
        title: 'Estado actualizado',
        description: `${user.full_name} ahora esta ${!user.is_active ? 'activo' : 'inactivo'}.`,
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'No se pudo actualizar',
        description: error instanceof Error ? error.message : 'Intenta nuevamente.',
      })
    }
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/80 bg-white/90">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total staff</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold tracking-tight">{summary.total}</p>
          </CardContent>
        </Card>
        <Card className="border-border/80 bg-white/90">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold tracking-tight">{summary.active}</p>
          </CardContent>
        </Card>
        <Card className="border-border/80 bg-white/90">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Administradores</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold tracking-tight">{summary.admins}</p>
          </CardContent>
        </Card>
        <Card className="border-border/80 bg-white/90">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Vendedores</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold tracking-tight">{summary.sellers}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/80 bg-white/90">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="usersSearch">Buscar</Label>
            <Input
              id="usersSearch"
              placeholder="Nombre o username"
              value={filters.search}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  search: event.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Rol</Label>
            <Select
              value={filters.role}
              onValueChange={(value: StaffFilters['role']) =>
                setFilters((prev) => ({ ...prev, role: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="seller">Vendedor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Estado</Label>
            <Select
              value={filters.status}
              onValueChange={(value: StaffFilters['status']) =>
                setFilters((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <UsersTable
        rows={filteredRows}
        isLoading={staffQuery.isLoading}
        currentUserId={currentUserId}
        onToggleActive={handleToggleActive}
        isUpdating={setActiveMutation.isPending}
      />

      <Card className="border-border/80 bg-white/90">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Creacion de usuarios y gestion de credenciales queda pendiente para una fase posterior,
            con flujo seguro desde Supabase Auth y politicas administrativas.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
