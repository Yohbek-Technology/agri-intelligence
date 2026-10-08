import { z } from 'zod'

const ETHIOPIAN_SHORT_REGEX = /^(?:\+251|251|0)[79][0-9]{8}$/
const OTP_REGEX = /^[0-9]{6}$/
const PASSWORD_COMPLEXITY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{10,}$/

export const PhoneOtpRequestSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, 'Phone number is required')
    .regex(ETHIOPIAN_SHORT_REGEX, 'Enter a valid Ethiopian phone number (+251, 251, or 0 prefix)'),
})

export const PhoneOtpVerifySchema = z.object({
  phoneNumber: z
    .string()
    .min(1, 'Phone number is required')
    .regex(ETHIOPIAN_SHORT_REGEX, 'Enter a valid Ethiopian phone number (+251, 251, or 0 prefix)'),
  code: z
    .string()
    .regex(OTP_REGEX, 'Verification code must be exactly 6 digits'),
})

export const AdminLoginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  password: z
    .string()
    .min(10, 'Password must be at least 10 characters')
    .regex(
      PASSWORD_COMPLEXITY_REGEX,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
})

export const AdminTwoFactorVerifySchema = z.object({
  code: z
    .string()
    .regex(OTP_REGEX, 'Verification code must be exactly 6 digits'),
})

export const UserProfileUpdateSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  preferredLanguage: z.enum(['am', 'om', 'ti', 'en']).optional(),
})

export const LanguageSelectSchema = z.object({
  language: z.enum(['am', 'om', 'ti', 'en']),
})

export const PhoneNormalizationUtil = {
  normalize: (phone: string): string => {
    const trimmed = phone.replace(/\s+/g, '')
    if (trimmed.startsWith('+251')) return trimmed
    if (trimmed.startsWith('251')) return `+${trimmed}`
    if (trimmed.startsWith('0')) return `+251${trimmed.slice(1)}`
    return trimmed
  },
  isEthiopianE164: (phone: string): boolean =>
    /^\+251[79][0-9]{8}$/.test(phone),
}
