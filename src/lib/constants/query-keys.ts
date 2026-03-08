export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  catalog: {
    categories: ['catalog', 'categories'] as const,
    brands: ['catalog', 'brands'] as const,
  },
  inventory: {
    products: (params?: { search?: string; categoryId?: string }) =>
      ['inventory', 'products', params ?? {}] as const,
    lowStock: ['inventory', 'low-stock'] as const,
    serializedUnits: (productId: string) =>
      ['inventory', 'serialized-units', productId] as const,
  },
  customers: {
    list: ['customers', 'list'] as const,
  },
  sales: {
    recent: (limit = 20) => ['sales', 'recent', limit] as const,
    dailySummary: (date: string) => ['sales', 'daily-summary', date] as const,
    history: (params?: { dateFrom?: string; dateTo?: string; limit?: number }) =>
      ['sales', 'history', params ?? {}] as const,
  },
  reports: {
    commercialSummary: (params: { dateFrom: string; dateTo: string }) =>
      ['reports', 'commercial-summary', params] as const,
  },
  users: {
    staffList: ['users', 'staff-list'] as const,
  },
  notifications: {
    list: (date: string) => ['notifications', 'list', date] as const,
  },
} as const
