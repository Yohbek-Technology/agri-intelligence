export interface ServiceResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<ServiceResult<T>> {
  try {
    const baseUrl = typeof window !== 'undefined'
      ? ''
      : (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000')
    const res = await fetch(`${baseUrl}${path}`, {
      ...init,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    })
    const json = await res.json().catch(() => ({})) as Record<string, unknown>
    if (!res.ok) {
      const errMsg =
        (json?.error as Record<string, unknown>)?.message as string | undefined
      return { success: false, error: errMsg || `HTTP ${res.status}` }
    }
    const data =
      json && typeof json === 'object' && 'data' in json && (json as { data: unknown }).data !== undefined
        ? (json as { data: T }).data
        : (json as T)
    return { success: true, data }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Network error' }
  }
}
