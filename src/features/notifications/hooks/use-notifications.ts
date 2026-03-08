'use client'

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/constants/query-keys'
import { notificationsService } from '@/lib/services/notifications.service'

function toDateInputValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function useNotifications() {
  const today = toDateInputValue(new Date())

  return useQuery({
    queryKey: queryKeys.notifications.list(today),
    queryFn: () => notificationsService.list(today),
  })
}
