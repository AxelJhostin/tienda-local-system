type SupabaseErrorLike = {
  message: string
  details?: string
  hint?: string
  code?: string
}

export class ServiceError extends Error {
  code?: string
  details?: string
  hint?: string

  constructor(message: string, input?: SupabaseErrorLike) {
    super(message)
    this.name = 'ServiceError'
    this.code = input?.code
    this.details = input?.details
    this.hint = input?.hint
  }
}

export function toServiceError(
  error: unknown,
  fallbackMessage: string
): ServiceError {
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  ) {
    return new ServiceError((error as { message: string }).message, error as SupabaseErrorLike)
  }

  return new ServiceError(fallbackMessage)
}

