import { z } from 'zod'

export const preferredLanguageEnum = z.enum(['am', 'om', 'ti', 'en'])

export const farmerOnboardingSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters.')
    .max(120, 'Full name cannot exceed 120 characters.'),
  localIdNumber: z
    .string()
    .trim()
    .min(1, 'Local ID is required.')
    .max(40, 'Local ID cannot exceed 40 characters.'),
  kebeleId: z.string().uuid('Please select a valid kebele.'),
  preferredLanguage: preferredLanguageEnum.default('am'),
  consentAgreed: z.literal(true, {
    message: 'Consent is required to register as a farmer.',
  }),
})

export const proxyFarmerOnboardingSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters.')
    .max(120, 'Full name cannot exceed 120 characters.'),
  localIdNumber: z
    .string()
    .trim()
    .min(1, 'Local ID is required.')
    .max(40, 'Local ID cannot exceed 40 characters.'),
  kebeleId: z.string().uuid('Please select a valid kebele.'),
  hasNoPhone: z.boolean().default(true),
  phoneNumber: z
    .string()
    .regex(/^\+251[79][0-9]{8}$/, 'Must be a valid Ethiopian phone number (+251...)')
    .nullable()
    .optional(),
  preferredLanguage: preferredLanguageEnum.default('am'),
  consentAgreed: z.boolean().default(true),
  assignedDaUserId: z.string().uuid().optional(),
})

export const updateFarmerProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters.')
    .max(120, 'Full name cannot exceed 120 characters.')
    .optional(),
  preferredLanguage: preferredLanguageEnum.optional(),
  consentAgreed: z.boolean().optional(),
  kebeleId: z.string().uuid().optional(),
})

export const claimFarmerProfileSchema = z.object({
  localIdNumber: z
    .string()
    .trim()
    .min(1, 'Local ID number is required.')
    .max(40, 'Local ID number cannot exceed 40 characters.'),
})

export const verifyFarmerSchema = z.object({
  isVerified: z.boolean().default(true),
})

export const reassignDaSchema = z.object({
  assignedDaUserId: z.string().uuid('A valid DA user ID is required.'),
})

export const bulkReassignDaSchema = z.object({
  farmerIds: z
    .array(z.string().uuid('Invalid farmer UUID.'))
    .min(1, 'At least one farmer must be selected.')
    .max(200, 'Cannot reassign more than 200 farmers at once.'),
  assignedDaUserId: z.string().uuid('A valid DA user ID is required.'),
})
