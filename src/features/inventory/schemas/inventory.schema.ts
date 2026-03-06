import { z } from 'zod'

export const quantityAdjustmentSchema = z.object({
  delta: z.number().int().refine((value) => value !== 0, {
    message: 'El ajuste debe ser distinto de cero.',
  }),
  reason: z.string().trim().min(1, 'El motivo es obligatorio.'),
})

export const addSerializedUnitSchema = z.object({
  serialValue: z.string().trim().min(1, 'El serial es obligatorio.'),
})

export const deactivateSerializedUnitSchema = z.object({
  reason: z.string().trim().min(1, 'El motivo es obligatorio.'),
})

