import { z } from 'zod'

// ---- Shared sub-schemas ----

export const agroZoneEnum = z.enum(['dega', 'weyna_dega', 'kolla'])
export const catalogStatusEnum = z.enum(['active', 'retired'])

export const multilingualTextSchema = z.object({
  en: z.string().min(1),
  am: z.string().optional(),
  om: z.string().optional(),
  ti: z.string().optional(),
})

export const weedingWindowSchema = z.object({
  start_das: z.number().int().min(0),
  end_das:   z.number().int().min(0),
  label:     z.string().optional(),
})

// ---- Crop schemas ----

export const createCropSchema = z.object({
  code:                       z.string().min(1).max(40).regex(/^[A-Z0-9_]+$/, 'Code must be uppercase alphanumeric with underscores'),
  nameEn:                     z.string().min(1).max(100),
  nameAm:                     z.string().max(100).optional(),
  nameOm:                     z.string().max(100).optional(),
  nameTi:                     z.string().max(100).optional(),
  maxPlausibleYieldQtPerHa:   z.number().positive().max(9999).optional(),
  weedingWindows:              z.array(weedingWindowSchema).optional().default([]),
  recommendedSuccessors:       z.array(z.string().uuid()).optional().default([]),
  effectiveFrom:               z.string().date().optional(),
  effectiveTo:                 z.string().date().optional(),
})

export const updateCropSchema = z.object({
  nameEn:                   z.string().min(1).max(100).optional(),
  nameAm:                   z.string().max(100).optional(),
  nameOm:                   z.string().max(100).optional(),
  nameTi:                   z.string().max(100).optional(),
  maxPlausibleYieldQtPerHa: z.number().positive().max(9999).optional(),
  weedingWindows:            z.array(weedingWindowSchema).optional(),
  recommendedSuccessors:     z.array(z.string().uuid()).optional(),
  status:                   catalogStatusEnum.optional(),
  effectiveTo:              z.string().date().optional(),
})

// ---- Variety schemas ----

export const createVarietySchema = z.object({
  cropId:        z.string().uuid(),
  name:          z.string().min(1).max(120),
  isCertified:   z.boolean().default(true),
  permittedZones: z.array(agroZoneEnum).min(1),
  effectiveFrom: z.string().date().optional(),
  effectiveTo:   z.string().date().optional(),
})

export const updateVarietySchema = z.object({
  name:          z.string().min(1).max(120).optional(),
  isCertified:   z.boolean().optional(),
  permittedZones: z.array(agroZoneEnum).min(1).optional(),
  status:        catalogStatusEnum.optional(),
  effectiveTo:   z.string().date().optional(),
})

// ---- Fertilizer rate schema ----

export const upsertFertilizerRateSchema = z.object({
  cropId:       z.string().uuid(),
  agroZone:     agroZoneEnum,
  ureaKgPerHa:  z.number().min(0),
  npsKgPerHa:   z.number().min(0),
  seedKgPerHa:  z.number().min(0),
  effectiveFrom: z.string().date(),
})

// ---- Pest schemas ----

export const createPestSchema = z.object({
  code:              z.string().min(1).max(60),
  kind:              z.enum(['pest', 'disease']),
  name:              multilingualTextSchema,
  preventionAdvice:  multilingualTextSchema.optional(),
  isQuarantinePest:  z.boolean().default(false),
})

export const updatePestSchema = z.object({
  name:             multilingualTextSchema.optional(),
  preventionAdvice: multilingualTextSchema.optional(),
  isQuarantinePest: z.boolean().optional(),
  status:           catalogStatusEnum.optional(),
})

// ---- Chemical schemas ----

export const createChemicalSchema = z.object({
  brandName:              z.string().min(1).max(150),
  activeIngredient:       z.string().min(1).max(200),
  registrationNumber:     z.string().min(1).max(80),
  category:               z.enum(['insecticide', 'fungicide', 'herbicide', 'other']),
  dosageText:             multilingualTextSchema,
  protectiveEquipmentText: multilingualTextSchema.optional(),
  safetyIntervalDays:     z.number().int().min(0),
  permittedZones:         z.array(agroZoneEnum).optional(),
  targetCropIds:          z.array(z.string().uuid()).optional().default([]),
  targetPestIds:          z.array(z.string().uuid()).optional().default([]),
  effectiveFrom:          z.string().date().optional(),
  effectiveTo:            z.string().date().optional(),
})

export const updateChemicalSchema = z.object({
  brandName:              z.string().min(1).max(150).optional(),
  dosageText:             multilingualTextSchema.optional(),
  protectiveEquipmentText: multilingualTextSchema.optional(),
  safetyIntervalDays:     z.number().int().min(0).optional(),
  permittedZones:         z.array(agroZoneEnum).optional(),
  targetCropIds:          z.array(z.string().uuid()).optional(),
  targetPestIds:          z.array(z.string().uuid()).optional(),
  status:                 catalogStatusEnum.optional(),
  effectiveTo:            z.string().date().optional(),
})
