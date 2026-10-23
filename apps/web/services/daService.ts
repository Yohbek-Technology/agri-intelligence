import { apiFetch } from '@/lib/apiFetch'
import type { ServiceResult } from '@/lib/apiFetch'
import type {
  FarmerProfileRow,
  ProxyFarmerOnboardingInput,
  PaginatedResponse,
} from '@repo/shared'

export interface DaFarmerFilterParams {
  q?: string
  kebele_id?: string
  is_verified?: 'all' | 'true' | 'false'
  page?: number
  limit?: number
}

export const daService = {
  listFarmers(params?: DaFarmerFilterParams): Promise<ServiceResult<PaginatedResponse<FarmerProfileRow>>> {
    const q = new URLSearchParams()
    if (params?.q) q.set('q', params.q)
    if (params?.kebele_id) q.set('kebele_id', params.kebele_id)
    if (params?.is_verified) q.set('is_verified', params.is_verified)
    if (params?.page) q.set('page', String(params.page))
    if (params?.limit) q.set('limit', String(params.limit))
    const qs = q.toString() ? `?${q.toString()}` : ''
    return apiFetch<PaginatedResponse<FarmerProfileRow>>(`/api/v1/farmers${qs}`)
  },

  getFarmer(farmerId: string): Promise<ServiceResult<FarmerProfileRow>> {
    return apiFetch<FarmerProfileRow>(`/api/v1/farmers/${farmerId}`)
  },

  createProxyFarmer(data: ProxyFarmerOnboardingInput): Promise<ServiceResult<FarmerProfileRow>> {
    return apiFetch<FarmerProfileRow>('/api/v1/farmers', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  verifyFarmer(farmerId: string): Promise<ServiceResult<FarmerProfileRow>> {
    return apiFetch<FarmerProfileRow>(`/api/v1/farmers/${farmerId}/verify`, {
      method: 'PATCH',
    })
  },
}
