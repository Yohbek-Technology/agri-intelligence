import { z } from 'zod'
import { PhoneUtils } from '../lib/phone.js'

const ETHIOPIAN_PHONE_REGEX = /^(?:\+251|251|0)[79][0-9]{8}$/
const OTP_REGEX = /^[0-9]{6}$/
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/

export const createStaffSchema = z.object({
  name: z.string().min(2, 'Full name must be at least 2 characters').max(255),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be 30 characters or less')
    .regex(USERNAME_REGEX, 'Only letters, numbers, and underscores allowed')
    .optional(),
  phoneNumber: z.string()
    .min(1, 'Phone number is required')
    .regex(ETHIOPIAN_PHONE_REGEX, 'Enter a valid Ethiopian phone number (+2519... or 09...)')
    .transform((val) => PhoneUtils.normalize(val)),
  otpCode: z.string().regex(OTP_REGEX, 'Verification code must be 6 digits').optional(),
  role: z.enum(['da', 'officer']),
  preferredLanguage: z.enum(['am', 'om', 'ti', 'en']).default('am'),
  assignedKebeleIds: z.array(z.string().uuid()).optional().default([]),
  password: z.string().min(10, 'Temporary password must be at least 10 characters'),
})

export const updateStaffSchema = z.object({
  name: z.string().min(2, 'Full name must be at least 2 characters').max(255).optional(),
  phoneNumber: z.string()
    .regex(ETHIOPIAN_PHONE_REGEX, 'Enter a valid Ethiopian phone number (+2519... or 09...)')
    .transform((val) => PhoneUtils.normalize(val))
    .optional(),
  role: z.enum(['da', 'officer']).optional(),
  preferredLanguage: z.enum(['am', 'om', 'ti', 'en']).optional(),
  assignedKebeleIds: z.array(z.string().uuid()).optional(),
})

