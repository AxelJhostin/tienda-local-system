'use client'

import Link from 'next/link'
import { Bell } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useNotifications } from '@/features/notifications/hooks/use-notifications'

export function HeaderNotifications() {
  const notificationsQuery = useNotifications()
  const notifications = notificationsQuery.data ?? []
  const visible = notifications.slice(0, 3)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative" aria-label="Abrir notificaciones">
          <Bell className="h-4 w-4" />
          {notifications.length > 0 ? (
            <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {notifications.length}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-[300px]" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificaciones</span>
          <Badge variant="outline">{notifications.length}</Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {visible.map((notification) => (
          <DropdownMenuItem key={notification.id} asChild>
            <Link href={notification.href} className="block">
              <p className="text-sm font-medium">{notification.title}</p>
              <p className="text-xs text-muted-foreground">{notification.message}</p>
            </Link>
          </DropdownMenuItem>
        ))}

        {notificationsQuery.isLoading && (
          <div className="px-2 py-2 text-sm text-muted-foreground">Cargando notificaciones...</div>
        )}

        {!notificationsQuery.isLoading && notifications.length === 0 && (
          <div className="px-2 py-2 text-sm text-muted-foreground">Sin notificaciones.</div>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/notifications">Ver todas</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
