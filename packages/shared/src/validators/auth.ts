import { z } from 'zod'

const ETHIOPIAN_SHORT_REGEX = /^(?:\+251|251|0)[79][0-9]{8}$/
const OTP_REGEX = /^[0-9]{6}$/
const PASSWORD_COMPLEXITY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{10,}$/

export const PhoneSignUpSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, 'Phone number is required')
    .regex(ETHIOPIAN_SHORT_REGEX, 'Enter a valid Ethiopian phone number'),
  password: z
    .string()
    .min(10, 'Password must be at least 10 characters')
    .regex(PASSWORD_COMPLEXITY_REGEX, 'Password must contain uppercase, lowercase, and a number'),
  name: z.string().min(2).max(120).optional(),
  preferredLanguage: z.enum(['am', 'om', 'ti', 'en']).optional(),
})

export const PhoneSignInSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, 'Phone number is required')
    .regex(ETHIOPIAN_SHORT_REGEX, 'Enter a valid Ethiopian phone number'),
  password: z.string().min(1, 'Password is required'),
})

export const PhoneOtpRequestSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, 'Phone number is required')
    .regex(ETHIOPIAN_SHORT_REGEX, 'Enter a valid Ethiopian phone number'),
})

export const PhoneOtpVerifySchema = z.object({
  phoneNumber: z
    .string()
    .min(1, 'Phone number is required')
    .regex(ETHIOPIAN_SHORT_REGEX, 'Enter a valid Ethiopian phone number'),
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
    .regex(PASSWORD_COMPLEXITY_REGEX, 'Password must contain uppercase, lowercase, and a number'),
})

export const AdminTwoFactorVerifySchema = z.object({
  code: z.string().regex(OTP_REGEX, 'Verification code must be exactly 6 digits'),
})

export const UserProfileUpdateSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  preferredLanguage: z.enum(['am', 'om', 'ti', 'en']).optional(),
  imageUrl: z.string().url().max(500).optional(),
})

export const LanguageSelectSchema = z.object({
  language: z.enum(['am', 'om', 'ti', 'en']),
})
