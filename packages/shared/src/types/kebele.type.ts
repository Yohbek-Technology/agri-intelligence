import type { z } from 'zod'
import type { createKebeleSchema, updateKebeleSchema } from '../validators/kebele.validator.js'

export type CreateKebeleInput = z.infer<typeof createKebeleSchema>
export type UpdateKebeleInput = z.infer<typeof updateKebeleSchema>

export interface KebeleRow {
  id: string
  cityOfficeId: string
  name: string
  boundary: unknown | null
  centroidLatitude: string | null
  centroidLongitude: string | null
  radiusMeters: number | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}
