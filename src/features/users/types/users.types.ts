import type { StaffProfile } from '@/lib/services/auth.service'

export type StaffFilters = {
  search: string
  role: 'all' | 'admin' | 'seller'
  status: 'all' | 'active' | 'inactive'
}

export type UsersTableProps = {
  rows: StaffProfile[]
  isLoading: boolean
  currentUserId: string
  onToggleActive: (user: StaffProfile) => void
  isUpdating: boolean
}
