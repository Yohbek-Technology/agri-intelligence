import type { z } from 'zod'
import type {
  registryFilterSchema,
  exportRegistrySchema,
} from '../validators/registry.validator.js'
import type { AreaUnit, SoilClass, DrainageClass, PlotStatus } from './plot.type.js'
import type { AgroZone } from './catalog.type.js'

export type RegistryFilterInput = z.infer<typeof registryFilterSchema>
export type ExportRegistryInput = z.infer<typeof exportRegistrySchema>

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface RegistryPlotDetail {
  id: string
  name: string
  areaValue: number
  areaUnit: AreaUnit
  areaHectares: number
  displayArea: number
  displayUnit: AreaUnit
  centroidLatitude: number
  centroidLongitude: number
  soilClass: SoilClass | null
  drainage: DrainageClass | null
  agroZone: AgroZone
  plannedCropId: string | null
  plannedCropName: string | null
  status: PlotStatus
}

export interface RegistryFarmerItem {
  id: string
  fullName: string
  localIdNumber: string
  phoneNumber: string | null
  hasNoPhone: boolean
  kebeleId: string
  kebeleName: string
  assignedDaUserId: string | null
  assignedDaName: string | null
  isVerified: boolean
  plotsCount: number
  totalAreaHectares: number
  totalAreaDisplay: number
  displayUnit: AreaUnit
  activeCrops: string[]
  plots: RegistryPlotDetail[]
}

export interface RegistrySummaryMetrics {
  totalFarmers: number
  verifiedFarmers: number
  selfRegisteredFarmers: number
  totalPlots: number
  totalCultivatedHectares: number
  totalCultivatedDisplay: number
  displayUnit: AreaUnit
}

export interface ExportJobStatusResponse {
  id: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  downloadUrl?: string
  totalRows?: number
  format: 'csv' | 'xlsx'
  createdAt: string
  completedAt?: string
}
