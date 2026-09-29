/** Normalised error thrown by the API client. */
export class ApiError extends Error {
  constructor(message, { status = 0, fieldErrors = {} } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

export function toApiError(error) {
  if (error instanceof ApiError) return error
  if (!error?.response) {
    return new ApiError("Can't reach the server. Check your connection and try again.", { status: 0 })
  }
  const { status, data } = error.response
  const fieldErrors = {}
  for (const e of data?.errors ?? []) fieldErrors[e.field] = e.message

  let message = typeof data?.detail === 'string' ? data.detail : 'Something went wrong. Please try again.'
  if (status === 422 && Object.keys(fieldErrors).length) message = 'Please fix the highlighted fields.'
  if (status >= 500) message = 'The server ran into a problem. Please try again in a moment.'
  return new ApiError(message, { status, fieldErrors })
}

export const errorMessage = (error) => toApiError(error).message
