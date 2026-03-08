'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useNotifications } from '@/features/notifications/hooks/use-notifications'

function typeLabel(type: 'stock_low' | 'operational' | 'module_evolution') {
  if (type === 'stock_low') return 'Stock bajo'
  if (type === 'operational') return 'Aviso operativo'
  return 'Modulo en evolucion'
}

function typeVariant(type: 'stock_low' | 'operational' | 'module_evolution') {
  if (type === 'stock_low') return 'destructive'
  if (type === 'operational') return 'secondary'
  return 'outline'
}

export function NotificationsPageContent() {
  const notificationsQuery = useNotifications()
  const notifications = notificationsQuery.data ?? []

  return (
    <Card className="border-border/80 bg-white/90">
      <CardHeader>
        <CardTitle>Lista de notificaciones</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {notifications.map((notification) => (
          <div key={notification.id} className="rounded-lg border border-border/70 px-3 py-3">
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium">{notification.title}</p>
              <Badge variant={typeVariant(notification.type)}>{typeLabel(notification.type)}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {new Date(notification.created_at).toLocaleString('es-CL')}
            </p>
          </div>
        ))}

        {notificationsQuery.isLoading && (
          <p className="text-sm text-muted-foreground">Cargando notificaciones...</p>
        )}

        {!notificationsQuery.isLoading && notifications.length === 0 && (
          <p className="text-sm text-muted-foreground">No hay notificaciones por mostrar.</p>
        )}
      </CardContent>
    </Card>
  )
}
