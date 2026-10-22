import { z } from 'zod'
import { areaUnitEnum, soilClassEnum, plotStatusEnum } from './plot.validator.js'

export const registryFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  q: z.string().trim().optional(),
  kebeleId: z.string().uuid().optional(),
  assignedDaUserId: z.string().uuid().optional(),
  cropId: z.string().uuid().optional(),
  soilClass: soilClassEnum.optional(),
  isVerified: z.enum(['all', 'true', 'false']).default('all').optional(),
  unit: areaUnitEnum.default('hectare').optional(),
  status: plotStatusEnum.default('active').optional(),
})

export const exportRegistrySchema = z.object({
  format: z.enum(['csv', 'xlsx']).default('csv'),
  q: z.string().trim().optional(),
  kebeleId: z.string().uuid().optional(),
  assignedDaUserId: z.string().uuid().optional(),
  cropId: z.string().uuid().optional(),
  soilClass: soilClassEnum.optional(),
  isVerified: z.enum(['all', 'true', 'false']).default('all').optional(),
  unit: areaUnitEnum.default('hectare').optional(),
  status: plotStatusEnum.default('active').optional(),
})
