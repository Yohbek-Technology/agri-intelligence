import type { z } from 'zod'
import type {
  farmerOnboardingSchema,
  proxyFarmerOnboardingSchema,
  updateFarmerProfileSchema,
  claimFarmerProfileSchema,
  verifyFarmerSchema,
  reassignDaSchema,
  bulkReassignDaSchema,
} from '../validators/farmer.validator.js'

export type FarmerOnboardingInput = z.infer<typeof farmerOnboardingSchema>
export type ProxyFarmerOnboardingInput = z.infer<typeof proxyFarmerOnboardingSchema>
export type UpdateFarmerProfileInput = z.infer<typeof updateFarmerProfileSchema>
export type ClaimFarmerProfileInput = z.infer<typeof claimFarmerProfileSchema>
export type VerifyFarmerInput = z.infer<typeof verifyFarmerSchema>
export type ReassignDaInput = z.infer<typeof reassignDaSchema>
export type BulkReassignDaInput = z.infer<typeof bulkReassignDaSchema>

export interface FarmerProfileRow {
  id: string
  cityOfficeId: string
  userId: string | null
  fullName: string
  phoneNumber: string | null
  hasNoPhone: boolean
  localIdNumber: string
  kebeleId: string
  kebeleName?: string
  assignedDaUserId: string | null
  assignedDaName?: string | null
  registeredByUserId: string | null
  preferredLanguage: 'am' | 'om' | 'ti' | 'en'
  isVerified: boolean
  consentAgreed: boolean
  consentAgreedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface FarmerWithPlotsSummary extends FarmerProfileRow {
  plotCount: number
  totalCultivatedHectares: number
  activeCrops: string[]
}
