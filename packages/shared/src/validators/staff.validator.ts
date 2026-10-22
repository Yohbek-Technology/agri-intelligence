import { z } from 'zod'

const ET_E164_REGEX = /^\+251[79]\d{8}$/

export const createStaffSchema = z.object({
  name:               z.string().min(2).max(255),
  phoneNumber:        z.string().regex(ET_E164_REGEX, 'Phone must be Ethiopian E.164 format: +251[79]XXXXXXXX'),
  role:               z.enum(['da', 'officer']),
  preferredLanguage:  z.enum(['am', 'om', 'ti', 'en']).default('am'),
  assignedKebeleIds:  z.array(z.string().uuid()).optional().default([]),
  password:           z.string().min(10, 'Temporary password must be at least 10 characters'),
})

export const updateStaffSchema = z.object({
  name:              z.string().min(2).max(255).optional(),
  phoneNumber:       z.string().regex(ET_E164_REGEX, 'Phone must be Ethiopian E.164 format: +251[79]XXXXXXXX').optional(),
  role:              z.enum(['da', 'officer']).optional(),
  preferredLanguage: z.enum(['am', 'om', 'ti', 'en']).optional(),
  assignedKebeleIds: z.array(z.string().uuid()).optional(),
})
