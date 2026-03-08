'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/constants/query-keys'
import { authService } from '@/lib/services/auth.service'

export function useStaffProfiles() {
  return useQuery({
    queryKey: queryKeys.users.staffList,
    queryFn: () => authService.listStaffProfiles(),
  })
}

export function useSetStaffActiveStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authService.setStaffActiveStatus,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.staffList })
    },
  })
}
