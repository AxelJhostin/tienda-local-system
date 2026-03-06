import { z } from 'zod'

export const addQuantityItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  unitPriceSold: z.number().min(0),
})

export const addSerialItemSchema = z.object({
  productId: z.string().uuid(),
  serializedUnitId: z.string().uuid(),
  unitPriceSold: z.number().min(0),
})

export const checkoutCartSchema = z.object({
  items: z.array(z.any()).min(1, 'Debes agregar al menos un item al carrito.'),
  customerId: z.string().uuid().nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
})

