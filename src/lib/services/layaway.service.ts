import { createClient } from '@/lib/supabase/client'
import { getAuthenticatedProfileId } from '@/lib/services/authenticated-profile'
import { toServiceError } from '@/lib/services/service-error'

export type CreateLayawayPlanInput = {
  productId: string
  agreedTotal: number
  customerId?: string | null
  notes?: string | null
}

export type AddLayawayPaymentInput = {
  layawayPlanId: string
  amount: number
  notes?: string | null
}

export const layawayService = {
  async createPlan(input: CreateLayawayPlanInput): Promise<string> {
    const supabase = createClient()
    const profileId = await getAuthenticatedProfileId()

    const { data, error } = await supabase.rpc('create_layaway_plan', {
      p_created_by_profile_id: profileId,
      p_product_id: input.productId,
      p_agreed_total: input.agreedTotal,
      p_customer_id: input.customerId ?? null,
      p_notes: input.notes ?? null,
    })

    if (error) {
      throw toServiceError(error, 'No se pudo crear el plan acumulativo.')
    }

    return data as string
  },

  async addPayment(input: AddLayawayPaymentInput): Promise<string> {
    const supabase = createClient()
    const profileId = await getAuthenticatedProfileId()

    const { data, error } = await supabase.rpc('add_layaway_payment', {
      p_layaway_plan_id: input.layawayPlanId,
      p_received_by_profile_id: profileId,
      p_amount: input.amount,
      p_notes: input.notes ?? null,
    })

    if (error) {
      throw toServiceError(error, 'No se pudo registrar el abono.')
    }

    return data as string
  },

  async deliverQuantity(layawayPlanId: string): Promise<string> {
    const supabase = createClient()
    const profileId = await getAuthenticatedProfileId()

    const { data, error } = await supabase.rpc('deliver_quantity_layaway', {
      p_layaway_plan_id: layawayPlanId,
      p_seller_profile_id: profileId,
    })

    if (error) {
      throw toServiceError(error, 'No se pudo entregar el plan acumulativo quantity.')
    }

    return data as string
  },

  async deliverSerial(layawayPlanId: string, serializedUnitId: string): Promise<string> {
    const supabase = createClient()
    const profileId = await getAuthenticatedProfileId()

    const { data, error } = await supabase.rpc('deliver_serial_layaway', {
      p_layaway_plan_id: layawayPlanId,
      p_seller_profile_id: profileId,
      p_serialized_unit_id: serializedUnitId,
    })

    if (error) {
      throw toServiceError(error, 'No se pudo entregar el plan acumulativo serial.')
    }

    return data as string
  },

  async cancelPlan(layawayPlanId: string, reason?: string): Promise<string> {
    const supabase = createClient()
    const profileId = await getAuthenticatedProfileId()

    const { data, error } = await supabase.rpc('cancel_layaway_plan', {
      p_layaway_plan_id: layawayPlanId,
      p_cancelled_by_profile_id: profileId,
      p_reason: reason ?? null,
    })

    if (error) {
      throw toServiceError(error, 'No se pudo cancelar el plan acumulativo.')
    }

    return data as string
  },
}

