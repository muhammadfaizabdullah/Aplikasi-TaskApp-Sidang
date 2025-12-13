export class InvalidJsonError extends Error {
  constructor(message: string = 'Invalid JSON body') {
    super(message)
    this.name = 'InvalidJsonError'
  }
}

/**
 * Safely read JSON from a Request. Returns an empty object when:
 * - Content-Type is not application/json
 * - Body is empty
 * Throws InvalidJsonError when body is non-empty but not valid JSON.
 */
export async function readJsonOrEmpty<T = any>(request: Request): Promise<Partial<T>> {
  const contentType = request.headers.get('content-type') || ''
  if (!contentType.toLowerCase().includes('application/json')) {
    return {}
  }

  const text = await request.text()
  if (!text || text.trim() === '') {
    return {}
  }

  try {
    return JSON.parse(text)
  } catch {
    throw new InvalidJsonError()
  }
}

export function isInvalidJsonError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as any).name === 'InvalidJsonError'
}






