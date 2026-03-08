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
  },
} as const
