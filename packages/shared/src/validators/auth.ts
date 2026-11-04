import { z } from 'zod'

const ETHIOPIAN_SHORT_REGEX = /^(?:\+251|251|0)[79][0-9]{8}$/
const OTP_REGEX = /^[0-9]{6}$/
const PASSWORD_COMPLEXITY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{10,}$/

export const PhoneSignUpSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, 'Phone number is required')
    .regex(ETHIOPIAN_SHORT_REGEX, 'Enter a valid Ethiopian phone number (+2519... or 09...)'),
  password: z
    .string()
    .min(10, 'Password must be at least 10 characters')
    .regex(PASSWORD_COMPLEXITY_REGEX, 'Password must contain uppercase, lowercase, and a number')
    .optional(),
  name: z.string().min(2, 'Full name must be at least 2 characters').max(150),
  preferredLanguage: z.enum(['am', 'om', 'ti', 'en']).default('am'),
  language: z.enum(['am', 'om', 'ti', 'en']).optional(),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be 30 characters or less')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores allowed')
    .optional(),
})

export const PhoneSignInSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, 'Phone number is required')
    .regex(ETHIOPIAN_SHORT_REGEX, 'Enter a valid Ethiopian phone number (+2519... or 09...)'),
  password: z.string().min(1, 'Password is required'),
})

export const PhoneOtpRequestSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, 'Phone number is required')
    .regex(ETHIOPIAN_SHORT_REGEX, 'Enter a valid Ethiopian phone number (+2519... or 09...)'),
})

export const PhoneOtpVerifySchema = z.object({
  phoneNumber: z
    .string()
    .min(1, 'Phone number is required')
    .regex(ETHIOPIAN_SHORT_REGEX, 'Enter a valid Ethiopian phone number'),
  code: z
    .string()
    .regex(OTP_REGEX, 'Verification code must be exactly 6 digits'),
  password: z.string().optional(),
  name: z.string().optional(),
  preferredLanguage: z.enum(['am', 'om', 'ti', 'en']).optional(),
  language: z.enum(['am', 'om', 'ti', 'en']).optional(),
  username: z.string().optional(),
})

export const PasswordResetRequestSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, 'Phone number is required')
    .regex(ETHIOPIAN_SHORT_REGEX, 'Enter a valid Ethiopian phone number (+2519... or 09...)'),
})

export const PasswordResetConfirmSchema = z
  .object({
    phoneNumber: z
      .string()
      .min(1, 'Phone number is required')
      .regex(ETHIOPIAN_SHORT_REGEX, 'Enter a valid Ethiopian phone number'),
    code: z
      .string()
      .regex(OTP_REGEX, 'Verification code must be exactly 6 digits'),
    newPassword: z
      .string()
      .min(10, 'Password must be at least 10 characters')
      .regex(PASSWORD_COMPLEXITY_REGEX, 'Password must contain uppercase, lowercase, and a number'),
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
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
  name: z.string().min(2).max(150).optional(),
  language: z.enum(['am', 'om', 'ti', 'en']).optional(),
  preferredLanguage: z.enum(['am', 'om', 'ti', 'en']).optional(),
  imageUrl: z.string().url().max(500).optional(),
  autoTts: z.boolean().optional(),
  voiceNavEnabled: z.boolean().optional(),
})

export const LanguageSelectSchema = z.object({
  language: z.enum(['am', 'om', 'ti', 'en']),
})

export const UsernameSignInSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be 30 characters or less')
    .regex(/^[a-z0-9_]+$/, 'Username must be lowercase — no uppercase letters allowed'),
  password: z.string().min(1, 'Password is required'),
})
export type UsernameSignIn = z.infer<typeof UsernameSignInSchema>
