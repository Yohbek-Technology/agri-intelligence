export interface ServiceResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000'

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<ServiceResult<T>> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
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
    return { success: true, data: json.data as T }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Network error' }
  }
}
