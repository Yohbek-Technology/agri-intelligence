import { apiFetch } from '@/lib/apiFetch'
import type { ServiceResult } from '@/lib/apiFetch'
import type {
  FarmerProfileRow,
  FarmerOnboardingInput,
  UpdateFarmerProfileInput,
  ClaimFarmerProfileInput,
  PlotRow,
  CreatePlotInput,
  UpdatePlotInput,
  AgroZoneOverrideInput,
  PlotCropHistoryRow,
  PlotCropHistoryInput,
  GeoResolutionResult,
  AreaUnit,
} from '@repo/shared'

export const farmerService = {
  // ── Profile Self-Service ───────────────────────────────────────────────────
  getSelfProfile(): Promise<ServiceResult<FarmerProfileRow>> {
    return apiFetch<FarmerProfileRow>('/api/v1/farmers/me')
  },

  onboardSelf(data: FarmerOnboardingInput): Promise<ServiceResult<FarmerProfileRow>> {
    return apiFetch<FarmerProfileRow>('/api/v1/farmers/me', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  updateSelfProfile(data: UpdateFarmerProfileInput): Promise<ServiceResult<FarmerProfileRow>> {
    return apiFetch<FarmerProfileRow>('/api/v1/farmers/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  claimProfile(data: ClaimFarmerProfileInput): Promise<ServiceResult<FarmerProfileRow>> {
    return apiFetch<FarmerProfileRow>('/api/v1/farmers/claim', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // ── Plots Lifecycle ────────────────────────────────────────────────────────
  listPlots(
    farmerId: string,
    params?: { status?: string; unit?: AreaUnit }
  ): Promise<ServiceResult<PlotRow[]>> {
    const q = new URLSearchParams()
    if (params?.status) q.set('status', params.status)
    if (params?.unit) q.set('unit', params.unit)
    const qs = q.toString() ? `?${q.toString()}` : ''
    return apiFetch<PlotRow[]>(`/api/v1/farmers/${farmerId}/plots${qs}`)
  },

  createPlot(farmerId: string, data: CreatePlotInput): Promise<ServiceResult<PlotRow>> {
    return apiFetch<PlotRow>(`/api/v1/farmers/${farmerId}/plots`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  getPlot(plotId: string, unit?: AreaUnit): Promise<ServiceResult<PlotRow>> {
    const qs = unit ? `?unit=${unit}` : ''
    return apiFetch<PlotRow>(`/api/v1/plots/${plotId}${qs}`)
  },

  updatePlot(plotId: string, data: UpdatePlotInput): Promise<ServiceResult<PlotRow>> {
    return apiFetch<PlotRow>(`/api/v1/plots/${plotId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  archivePlot(plotId: string): Promise<ServiceResult<PlotRow>> {
    return apiFetch<PlotRow>(`/api/v1/plots/${plotId}/archive`, {
      method: 'POST',
    })
  },

  restorePlot(plotId: string): Promise<ServiceResult<PlotRow>> {
    return apiFetch<PlotRow>(`/api/v1/plots/${plotId}/restore`, {
      method: 'POST',
    })
  },

  overrideAgroZone(plotId: string, data: AgroZoneOverrideInput): Promise<ServiceResult<PlotRow>> {
    return apiFetch<PlotRow>(`/api/v1/plots/${plotId}/agro-zone`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // ── Crop History ───────────────────────────────────────────────────────────
  getCropHistory(plotId: string): Promise<ServiceResult<PlotCropHistoryRow[]>> {
    return apiFetch<PlotCropHistoryRow[]>(`/api/v1/plots/${plotId}/crop-history`)
  },

  upsertCropHistory(
    plotId: string,
    seasonYear: number,
    data: PlotCropHistoryInput
  ): Promise<ServiceResult<PlotCropHistoryRow>> {
    return apiFetch<PlotCropHistoryRow>(`/api/v1/plots/${plotId}/crop-history/${seasonYear}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // ── Geo-Spatial Resolution ─────────────────────────────────────────────────
  resolveGeo(lat: number, lng: number, unit?: AreaUnit): Promise<ServiceResult<GeoResolutionResult>> {
    const q = new URLSearchParams({
      lat: String(lat),
      lng: String(lng),
    })
    if (unit) q.set('unit', unit)
    return apiFetch<GeoResolutionResult>(`/api/v1/geo/resolve?${q.toString()}`)
  },
}
