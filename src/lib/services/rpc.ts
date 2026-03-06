import { createClient } from '@/lib/supabase/client'
import { toServiceError } from '@/lib/services/service-error'

type RpcPayload = Record<string, unknown>

export async function callRpcWithFallback<T>(
  rpcName: string,
  payloadCandidates: RpcPayload[]
): Promise<T> {
  const supabase = createClient()
  const rpcExecutor = supabase.rpc as unknown as (
    functionName: string,
    payload: RpcPayload
  ) => Promise<{ data: unknown; error: { message: string } | null }>
  let lastError: unknown = null

  for (const payload of payloadCandidates) {
    const { data, error } = await rpcExecutor(rpcName, payload)

    if (!error) {
      return data as T
    }

    lastError = error
    const normalized = error.message.toLowerCase()
    const isSignatureError =
      normalized.includes('function') && normalized.includes('does not exist')

    if (!isSignatureError) {
      break
    }
  }

  throw toServiceError(lastError, `No se pudo ejecutar la operación RPC: ${rpcName}.`)
}
