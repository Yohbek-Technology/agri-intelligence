import type { z } from 'zod'
import type {
  createCropSchema,
  updateCropSchema,
  createVarietySchema,
  updateVarietySchema,
  upsertFertilizerRateSchema,
  createPestSchema,
  updatePestSchema,
  createChemicalSchema,
  updateChemicalSchema,
} from '../validators/catalog.validator.js'

export type CreateCropInput          = z.infer<typeof createCropSchema>
export type UpdateCropInput          = z.infer<typeof updateCropSchema>
export type CreateVarietyInput       = z.infer<typeof createVarietySchema>
export type UpdateVarietyInput       = z.infer<typeof updateVarietySchema>
export type UpsertFertilizerRateInput = z.infer<typeof upsertFertilizerRateSchema>
export type CreatePestInput          = z.infer<typeof createPestSchema>
export type UpdatePestInput          = z.infer<typeof updatePestSchema>
export type CreateChemicalInput      = z.infer<typeof createChemicalSchema>
export type UpdateChemicalInput      = z.infer<typeof updateChemicalSchema>

export type AgroZone       = 'dega' | 'weyna_dega' | 'kolla'
export type CatalogStatus  = 'active' | 'retired'
export type ChemicalCategory = 'insecticide' | 'fungicide' | 'herbicide' | 'other'
export type PestKind       = 'pest' | 'disease'

export interface CropRow {
  id: string
  cityOfficeId: string
  code: string
  nameEn: string
  nameAm: string | null
  nameOm: string | null
  nameTi: string | null
  maxPlausibleYieldQtPerHa: string
  weedingWindows: unknown[]
  recommendedSuccessors: string[]
  status: CatalogStatus
  effectiveFrom: string
  effectiveTo: string | null
  createdAt: string
  updatedAt: string
}

export interface VarietyRow {
  id: string
  cityOfficeId: string
  cropId: string
  name: string
  isCertified: boolean
  permittedZones: AgroZone[]
  status: CatalogStatus
  effectiveFrom: string
  effectiveTo: string | null
  createdAt: string
  updatedAt: string
}

export interface FertilizerRateRow {
  id: string
  cityOfficeId: string
  cropId: string
  agroZone: AgroZone
  ureaKgPerHa: string
  npsKgPerHa: string
  seedKgPerHa: string
  ratesVersion: number
  effectiveFrom: string
  createdAt: string
}

export interface PestRow {
  id: string
  cityOfficeId: string
  code: string
  kind: PestKind
  name: Record<string, string>
  preventionAdvice: Record<string, string> | null
  isQuarantinePest: boolean
  status: CatalogStatus
  createdAt: string
  updatedAt: string
}

export interface ChemicalRow {
  id: string
  cityOfficeId: string
  brandName: string
  activeIngredient: string
  registrationNumber: string
  category: ChemicalCategory
  dosageText: Record<string, string>
  protectiveEquipmentText: Record<string, string> | null
  safetyIntervalDays: number
  permittedZones: AgroZone[] | null
  targetCropIds: string[]
  targetPestIds: string[]
  status: CatalogStatus
  effectiveFrom: string
  effectiveTo: string | null
  createdAt: string
  updatedAt: string
}
