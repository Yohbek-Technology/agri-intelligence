import type { z } from 'zod'
import type { createStaffSchema, updateStaffSchema } from '../validators/staff.validator.js'

export type CreateStaffInput = z.infer<typeof createStaffSchema>
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>

export interface StaffRow {
  id: string
  name: string
  email: string
  phoneNumber: string | null
  phoneNumberVerified: boolean
  role: 'da' | 'officer'
  cityOfficeId: string
  preferredLanguage: string
  assignedKebeleIds: string[]
  banned: boolean
  createdAt: string
  updatedAt: string
}
