import { inventoryService } from '@/lib/services/inventory.service'
import { salesService } from '@/lib/services/sales.service'

export type NotificationType = 'stock_low' | 'operational' | 'module_evolution'

export type NotificationItem = {
  id: string
  type: NotificationType
  title: string
  message: string
  href: string
  created_at: string
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const notificationsService = {
  async list(date = toDateInputValue(new Date())): Promise<NotificationItem[]> {
    const [lowStockProducts, dailySummary] = await Promise.all([
      inventoryService.listLowStockProducts(),
      salesService.getDailySalesSummary(date),
    ])

    const now = new Date().toISOString()
    const notifications: NotificationItem[] = []

    notifications.push({
      id: `stock-low-${date}`,
      type: 'stock_low',
      title: 'Alerta de stock bajo',
      message: `${lowStockProducts.length} producto(s) estan en alerta de inventario.`,
      href: '/stock-low',
      created_at: now,
    })

    notifications.push({
      id: `ops-summary-${date}`,
      type: 'operational',
      title: 'Resumen operativo del dia',
      message: `${dailySummary.sale_count} venta(s), ${dailySummary.total_items_sold} item(s), total ${dailySummary.total_sold.toLocaleString('es-CL')}.`,
      href: '/dashboard',
      created_at: now,
    })

    notifications.push({
      id: 'evolution-modules',
      type: 'module_evolution',
      title: 'Modulo en evolucion',
      message: 'Notificaciones persistentes y flujo de lectura quedan para una fase posterior.',
      href: '/notifications',
      created_at: now,
    })

    return notifications
  },
}
