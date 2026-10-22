import type {
  OfficeSummary,
  OfficeConfig,
  OfficeParametersUpdate,
  KebeleRow,
  CreateKebeleInput,
  UpdateKebeleInput,
  StaffRow,
  CreateStaffInput,
  UpdateStaffInput,
  CropRow,
  CreateCropInput,
  UpdateCropInput,
  VarietyRow,
  CreateVarietyInput,
  UpdateVarietyInput,
  FertilizerRateRow,
  UpsertFertilizerRateInput,
  PestRow,
  CreatePestInput,
  UpdatePestInput,
  ChemicalRow,
  CreateChemicalInput,
  UpdateChemicalInput,
} from '@repo/shared'
import { apiFetch } from '@/lib/apiFetch'
import type { ServiceResult } from '@/lib/apiFetch'

export interface AuditLogRow {
  id: number
  cityOfficeId: string | null
  actorUserId: string | null
  actorName: string | null
  action: string
  entityType: string | null
  entityId: string | null
  changesJson: unknown | null
  createdAt: string
}

export interface AuditLogParams {
  action?: string
  from?: string
  to?: string
  page?: number
  limit?: number
}


export const officerService = {
  // ---- Office ----
  getOffice(): Promise<ServiceResult<OfficeSummary>> {
    return apiFetch<OfficeSummary>('/api/v1/offices/me')
  },

  getOfficeConfig(): Promise<ServiceResult<OfficeConfig>> {
    return apiFetch<OfficeConfig>('/api/v1/offices/me/config')
  },

  updateOfficeParams(body: { defaultLanguage?: string; parameters?: OfficeParametersUpdate }): Promise<ServiceResult<OfficeSummary>> {
    return apiFetch<OfficeSummary>('/api/v1/offices/me', {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
  },

  // ---- Kebeles ----
  listKebeles(): Promise<ServiceResult<KebeleRow[]>> {
    return apiFetch<KebeleRow[]>('/api/v1/kebeles')
  },

  createKebele(body: CreateKebeleInput): Promise<ServiceResult<KebeleRow>> {
    return apiFetch<KebeleRow>('/api/v1/office/kebeles', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  updateKebele(id: string, body: UpdateKebeleInput): Promise<ServiceResult<KebeleRow>> {
    return apiFetch<KebeleRow>(`/api/v1/office/kebeles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
  },

  deleteKebele(id: string): Promise<ServiceResult<void>> {
    return apiFetch<void>(`/api/v1/office/kebeles/${id}`, { method: 'DELETE' })
  },

  // ---- Staff ----
  listStaff(): Promise<ServiceResult<StaffRow[]>> {
    return apiFetch<StaffRow[]>('/api/v1/office/users')
  },

  createStaff(body: CreateStaffInput): Promise<ServiceResult<StaffRow>> {
    return apiFetch<StaffRow>('/api/v1/office/users', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  updateStaff(id: string, body: UpdateStaffInput): Promise<ServiceResult<StaffRow>> {
    return apiFetch<StaffRow>(`/api/v1/office/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
  },

  deactivateStaff(id: string): Promise<ServiceResult<void>> {
    return apiFetch<void>(`/api/v1/office/users/${id}/deactivate`, { method: 'POST' })
  },

  // ---- Crops ----
  listCrops(): Promise<ServiceResult<CropRow[]>> {
    return apiFetch<CropRow[]>('/api/v1/catalog/crops')
  },

  createCrop(body: CreateCropInput): Promise<ServiceResult<CropRow>> {
    return apiFetch<CropRow>('/api/v1/office/catalog/crops', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  updateCrop(id: string, body: UpdateCropInput): Promise<ServiceResult<CropRow>> {
    return apiFetch<CropRow>(`/api/v1/office/catalog/crops/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
  },

  // ---- Varieties ----
  listVarieties(cropId?: string): Promise<ServiceResult<VarietyRow[]>> {
    const qs = cropId ? `?cropId=${cropId}` : ''
    return apiFetch<VarietyRow[]>(`/api/v1/catalog/varieties${qs}`)
  },

  createVariety(body: CreateVarietyInput): Promise<ServiceResult<VarietyRow>> {
    return apiFetch<VarietyRow>('/api/v1/office/catalog/varieties', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  updateVariety(id: string, body: UpdateVarietyInput): Promise<ServiceResult<VarietyRow>> {
    return apiFetch<VarietyRow>(`/api/v1/office/catalog/varieties/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
  },

  // ---- Fertilizer Rates ----
  listFertilizerRates(): Promise<ServiceResult<FertilizerRateRow[]>> {
    return apiFetch<FertilizerRateRow[]>('/api/v1/catalog/fertilizer-rates')
  },

  upsertFertilizerRate(body: UpsertFertilizerRateInput): Promise<ServiceResult<FertilizerRateRow>> {
    return apiFetch<FertilizerRateRow>('/api/v1/office/catalog/fertilizer-rates', {
      method: 'PUT',
      body: JSON.stringify(body),
    })
  },

  // ---- Pests ----
  listPests(): Promise<ServiceResult<PestRow[]>> {
    return apiFetch<PestRow[]>('/api/v1/catalog/pests')
  },

  createPest(body: CreatePestInput): Promise<ServiceResult<PestRow>> {
    return apiFetch<PestRow>('/api/v1/office/catalog/pests', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  updatePest(id: string, body: UpdatePestInput): Promise<ServiceResult<PestRow>> {
    return apiFetch<PestRow>(`/api/v1/office/catalog/pests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
  },

  // ---- Chemicals ----
  listChemicals(): Promise<ServiceResult<ChemicalRow[]>> {
    return apiFetch<ChemicalRow[]>('/api/v1/catalog/chemicals')
  },

  createChemical(body: CreateChemicalInput): Promise<ServiceResult<ChemicalRow>> {
    return apiFetch<ChemicalRow>('/api/v1/office/catalog/chemicals', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  updateChemical(id: string, body: UpdateChemicalInput): Promise<ServiceResult<ChemicalRow>> {
    return apiFetch<ChemicalRow>(`/api/v1/office/catalog/chemicals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
  },

  reactivateStaff(id: string): Promise<ServiceResult<void>> {
    return apiFetch<void>(`/api/v1/office/users/${id}/reactivate`, { method: 'POST' })
  },

  retireChemical(id: string): Promise<ServiceResult<void>> {
    return apiFetch<void>(`/api/v1/office/catalog/chemicals/${id}/retire`, { method: 'POST' })
  },

  // ---- Audit logs ----
  listAuditLogs(params?: AuditLogParams): Promise<ServiceResult<AuditLogRow[]>> {
    const qs = new URLSearchParams()
    if (params?.action) qs.set('action', params.action)
    if (params?.from)   qs.set('from', params.from)
    if (params?.to)     qs.set('to', params.to)
    if (params?.page)   qs.set('page', String(params.page))
    if (params?.limit)  qs.set('limit', String(params.limit))
    const query = qs.toString() ? `?${qs.toString()}` : ''
    return apiFetch<AuditLogRow[]>(`/api/v1/office/audit-logs${query}`)
  },
}
