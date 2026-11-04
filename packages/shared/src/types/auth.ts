import type { z } from 'zod'
import type {
  PhoneSignUpSchema,
  PhoneSignInSchema,
  PhoneOtpRequestSchema,
  PhoneOtpVerifySchema,
  PasswordResetRequestSchema,
  PasswordResetConfirmSchema,
  AdminLoginSchema,
  AdminTwoFactorVerifySchema,
  UserProfileUpdateSchema,
  LanguageSelectSchema,
} from '../validators/auth.js'

export type PhoneSignUp          = z.infer<typeof PhoneSignUpSchema>
export type PhoneSignIn          = z.infer<typeof PhoneSignInSchema>
export type PhoneOtpRequest      = z.infer<typeof PhoneOtpRequestSchema>
export type PhoneOtpVerify       = z.infer<typeof PhoneOtpVerifySchema>
export type PasswordResetRequest = z.infer<typeof PasswordResetRequestSchema>
export type PasswordResetConfirm = z.infer<typeof PasswordResetConfirmSchema>
export type AdminLogin           = z.infer<typeof AdminLoginSchema>
export type AdminTwoFactorVerify = z.infer<typeof AdminTwoFactorVerifySchema>
export type UserProfileUpdate    = z.infer<typeof UserProfileUpdateSchema>
export type LanguageSelect       = z.infer<typeof LanguageSelectSchema>

export type UserRole =
  | 'FARMER'
  | 'DA'
  | 'CITY_ADMIN'
  | 'SUPER_ADMIN'
  | 'farmer'
  | 'da'
  | 'city_admin'
  | 'super_admin'
  | 'officer'
  | 'system_admin'

export type AppLanguage = 'am' | 'om' | 'ti' | 'en'

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'

export interface AuthUser {
  id: string
  fullName: string
  name?: string
  email: string
  emailVerified: boolean
  imageUrl?: string | null
  image?: string | null
  phoneNumber?: string | null
  isPhoneVerified: boolean
  phoneNumberVerified?: boolean
  role: UserRole
  status: ApprovalStatus
  cityId?: string | null
  cityOfficeId?: string | null
  language: AppLanguage
  preferredLanguage?: AppLanguage
  autoTts: boolean
  voiceNavEnabled: boolean
  lastLoginAt?: Date | null
  createdAt: Date
  updatedAt: Date
  banned?: boolean
  banReason?: string | null
  banExpires?: Date | null
  banExpiresAt?: Date | null
  assignedKebeleIds?: string
  deletedAt?: Date | null
}

export interface AuthSession {
  id: string
  userId: string
  token: string
  expiresAt: Date
  ipAddress?: string | null
  userAgent?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface SessionContext {
  user: AuthUser
  session: AuthSession
}

export interface TwoFactorChallenge {
  twoFactorRedirect: true
  twoFactorMethods: Array<'totp' | 'otp'>
}

export interface OfficeSummary {
  id: string
  name: string
  defaultLanguage: string
  isActive: boolean
  parameters?: Record<string, unknown>
}

export interface OfficeConfig {
  landUnit: {
    timadToHa: number
    kertToHa?: number
    hectareToHa: number
  }
  agroZone: {
    kollaMaxM: number
    degaMinM: number
  }
  voice: {
    intentConfidenceThreshold: number
  }
  weather: {
    sprayWindMaxKmh: number
    sprayWashoffHours: number
    harvestRainProbMaxPct: number
    frostMinC: number
    downpourMmPerDay: number
    drySpellDays: number
  }
  rainOnset: {
    accumulationMm: number
    windowDays: number
  }
  yield: {
    cohortMinSize: number
  }
  diagnosis: {
    lowConfidence: number
  }
  outbreak: {
    radiusKm: number
    windowDays: number
    minCases: number
  }
  triage: {
    overdueHours: number
  }
  demand: {
    criticalGapPct: number
    maxMarginPct: number
  }
  market: {
    staleDays: number
    plausibilityBandPct: number
  }
  broadcast: {
    smsFallbackMinutes: number
    quietHours: { start: string; end: string }
  }
  ai?: {
    dailyCallQuota?: number
  }
}
