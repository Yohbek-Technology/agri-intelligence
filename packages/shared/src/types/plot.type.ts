import type { z } from 'zod'
import type {
  createPlotSchema,
  updatePlotSchema,
  agroZoneOverrideSchema,
  plotCropHistorySchema,
  areaUnitEnum,
  soilClassEnum,
  drainageClassEnum,
  plotStatusEnum,
} from '../validators/plot.validator.js'
import type { AgroZone } from './catalog.type.js'

export type AreaUnit = z.infer<typeof areaUnitEnum>
export type SoilClass = z.infer<typeof soilClassEnum>
export type DrainageClass = z.infer<typeof drainageClassEnum>
export type PlotStatus = z.infer<typeof plotStatusEnum>

export type CreatePlotInput = z.infer<typeof createPlotSchema>
export type UpdatePlotInput = z.infer<typeof updatePlotSchema>
export type AgroZoneOverrideInput = z.infer<typeof agroZoneOverrideSchema>
export type PlotCropHistoryInput = z.infer<typeof plotCropHistorySchema>

export interface PlotRow {
  id: string
  cityOfficeId: string
  farmerId: string
  name: string
  areaValue: number
  areaUnit: AreaUnit
  hectaresPerUnitApplied: number
  areaHectares: number
  displayArea?: number
  displayUnit?: AreaUnit
  centroidLatitude: number
  centroidLongitude: number
  gpsAccuracyMeters: number
  weatherGridLatitude: number
  weatherGridLongitude: number
  elevationMeters: number
  agroZoneDerived: AgroZone
  agroZone: AgroZone
  agroZoneOverrideReason: string | null
  kebeleId: string | null
  kebeleName?: string | null
  soilClass: SoilClass | null
  drainage: DrainageClass | null
  plannedCropId: string | null
  plannedCropName?: string | null
  plannedSeasonYear: number | null
  status: PlotStatus
  createdAt: string
  updatedAt: string
}

export interface PlotCropHistoryRow {
  id: string
  cityOfficeId: string
  farmerId: string
  plotId: string
  seasonYear: number
  cropId: string | null
  cropName?: string | null
  fallow: boolean
  createdByUserId: string | null
  createdAt: string
  updatedAt: string
}

export interface GeoResolutionResult {
  elevationMeters: number
  agroZoneDerived: AgroZone
  kebeleId: string | null
  kebeleName: string | null
  isInJurisdiction: boolean
  hectaresPerUnitApplied: number
}

export interface SoilStratum3DConfig {
  soilClass: SoilClass
  drainage: DrainageClass
  agroZone: AgroZone
  elevationMeters: number
  primaryColor: string
  secondaryColor: string
  bedrockColor: string
  roughness: number
  fissureIntensity: number
  moistureSheen: number
  waterSaturation: number
  particleFlowSpeed: number
}
