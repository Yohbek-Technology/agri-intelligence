import { apiFetch } from '@/lib/apiFetch'
import type { ServiceResult } from '@/lib/apiFetch'
import type {
  RegistryFilterInput,
  ExportRegistryInput,
  RegistryFarmerItem,
  RegistrySummaryMetrics,
  PlotRow,
  AreaUnit,
} from '@repo/shared'

export interface RegistryResponseData {
  data: RegistryFarmerItem[]
  total: number
  page: number
  limit: number
  totalPages: number
  summary: RegistrySummaryMetrics
}

export interface ExportResponseData {
  id: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  downloadUrl: string
  totalRows: number
  format: 'csv' | 'xlsx'
  createdAt: string
}

export const registryService = {
  queryRegistry(filter: RegistryFilterInput): Promise<ServiceResult<RegistryResponseData>> {
    const q = new URLSearchParams()
    if (filter.page) q.set('page', String(filter.page))
    if (filter.limit) q.set('limit', String(filter.limit))
    if (filter.q) q.set('q', filter.q)
    if (filter.kebeleId) q.set('kebeleId', filter.kebeleId)
    if (filter.assignedDaUserId) q.set('assignedDaUserId', filter.assignedDaUserId)
    if (filter.cropId) q.set('cropId', filter.cropId)
    if (filter.soilClass) q.set('soilClass', filter.soilClass)
    if (filter.isVerified) q.set('isVerified', filter.isVerified)
    if (filter.unit) q.set('unit', filter.unit)
    if (filter.status) q.set('status', filter.status)

    return apiFetch<RegistryResponseData>(`/api/v1/office/registry/farmers?${q.toString()}`)
  },

  queryPlots(params?: {
    kebele_id?: string
    crop_id?: string
    soil_class?: string
    status?: string
    unit?: AreaUnit
    limit?: number
  }): Promise<ServiceResult<PlotRow[]>> {
    const q = new URLSearchParams()
    if (params?.kebele_id) q.set('kebele_id', params.kebele_id)
    if (params?.crop_id) q.set('crop_id', params.crop_id)
    if (params?.soil_class) q.set('soil_class', params.soil_class)
    if (params?.status) q.set('status', params.status)
    if (params?.unit) q.set('unit', params.unit)
    if (params?.limit) q.set('limit', String(params.limit))
    const qs = q.toString() ? `?${q.toString()}` : ''
    return apiFetch<PlotRow[]>(`/api/v1/office/registry/plots${qs}`)
  },

  exportRegistry(data: ExportRegistryInput): Promise<ServiceResult<ExportResponseData>> {
    return apiFetch<ExportResponseData>('/api/v1/office/registry/exports', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  getExportDownloadUrl(id: string): string {
    const base = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000'
    return `${base}/api/v1/office/registry/exports/${id}`
  },

  assignFarmerToDa(
    farmerId: string,
    assignedDaUserId: string
  ): Promise<ServiceResult<RegistryFarmerItem>> {
    return apiFetch<RegistryFarmerItem>(`/api/v1/office/farmers/${farmerId}/assign-da`, {
      method: 'PATCH',
      body: JSON.stringify({ assignedDaUserId }),
    })
  },

  bulkAssignFarmersToDa(
    farmerIds: string[],
    assignedDaUserId: string
  ): Promise<ServiceResult<{ updatedCount: number }>> {
    return apiFetch<{ updatedCount: number }>('/api/v1/office/farmers/reassign', {
      method: 'POST',
      body: JSON.stringify({ farmerIds, assignedDaUserId }),
    })
  },
}
