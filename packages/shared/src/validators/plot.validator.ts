import { z } from 'zod'
import { agroZoneEnum } from './catalog.validator.js'

export const areaUnitEnum = z.enum(['timad', 'kert', 'hectare'])

export const soilClassEnum = z.enum([
  'koticha_vertisol',
  'beda_nitisol',
  'sandy',
  'clay',
  'loam',
])

export const drainageClassEnum = z.enum(['waterlogs', 'moderate', 'free_draining'])

export const plotStatusEnum = z.enum(['active', 'archived'])

export const centroidSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  accuracyMeters: z.coerce.number().min(0).max(1000).optional().default(10),
})

export const createPlotSchema = z
  .object({
    id: z.string().uuid().optional(),
    name: z
      .string()
      .trim()
      .min(1, 'Plot name is required.')
      .max(60, 'Plot name cannot exceed 60 characters.'),
    areaValue: z.coerce
      .number()
      .positive('Area value must be greater than 0.')
      .max(1000, 'Area value cannot exceed 1000 units.'),
    areaUnit: areaUnitEnum,
    centroid: centroidSchema,
    soilClass: soilClassEnum,
    drainage: drainageClassEnum,
    plannedCropId: z.string().uuid('Invalid crop UUID.').nullable().optional(),
    plannedSeasonYear: z.coerce.number().int().min(2000).max(2100).nullable().optional(),
  })
  .refine(
    (data) => (data.plannedCropId == null) === (data.plannedSeasonYear == null),
    {
      message: 'plannedCropId and plannedSeasonYear must both be provided or both be null.',
      path: ['plannedCropId'],
    }
  )

export const updatePlotSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Plot name is required.')
      .max(60, 'Plot name cannot exceed 60 characters.')
      .optional(),
    areaValue: z.coerce
      .number()
      .positive('Area value must be greater than 0.')
      .max(1000, 'Area value cannot exceed 1000 units.')
      .optional(),
    areaUnit: areaUnitEnum.optional(),
    soilClass: soilClassEnum.optional(),
    drainage: drainageClassEnum.optional(),
    plannedCropId: z.string().uuid('Invalid crop UUID.').nullable().optional(),
    plannedSeasonYear: z.coerce.number().int().min(2000).max(2100).nullable().optional(),
  })
  .refine(
    (data) => {
      if (data.plannedCropId !== undefined || data.plannedSeasonYear !== undefined) {
        return (data.plannedCropId == null) === (data.plannedSeasonYear == null)
      }
      return true
    },
    {
      message: 'plannedCropId and plannedSeasonYear must both be provided or both be null.',
      path: ['plannedCropId'],
    }
  )

export const agroZoneOverrideSchema = z.object({
  agroZone: agroZoneEnum,
  reason: z
    .string()
    .trim()
    .min(5, 'Reason must be at least 5 characters.')
    .max(255, 'Reason cannot exceed 255 characters.'),
})

export const plotCropHistorySchema = z
  .object({
    seasonYear: z.coerce
      .number()
      .int()
      .min(2000, 'Season year must be 2000 or later.')
      .max(2100, 'Season year cannot exceed 2100.'),
    cropId: z.string().uuid('Invalid crop UUID.').nullable().optional(),
    fallow: z.boolean().default(false),
  })
  .refine(
    (data) => data.fallow === (data.cropId == null),
    {
      message: 'fallow must be true if and only if cropId is null.',
      path: ['fallow'],
    }
  )

export const geoResolveQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  unit: areaUnitEnum.default('hectare').optional(),
})
