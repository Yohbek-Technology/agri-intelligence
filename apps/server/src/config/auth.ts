import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { phoneNumber, openAPI, twoFactor } from 'better-auth/plugins'
import { db } from '@/config/db.js'
import * as schema from '@/db/index.js'
import { sendSms, onPhoneVerified, normalizeEthiopianPhone } from '@/services/sms.js'

const MOBILE_SESSION_SECONDS = 30 * 24 * 60 * 60
const WEB_SESSION_SECONDS = 30 * 60

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),

  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:5000',

  session: {
    expiresIn: MOBILE_SESSION_SECONDS,
    updateAge: 24 * 60 * 60,
    cookieCache: {
      enabled: false,
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 10,
    maxPasswordLength: 128,
  },

  plugins: [
    openAPI(),

    phoneNumber({
      otpLength: 6,
      expiresIn: 600,
      allowedAttempts: 5,
      sendOTP: async ({ phoneNumber: phone, code }) => {
        const normalized = normalizeEthiopianPhone(phone)
        await sendSms(
          normalized,
          `[AgriIntelligence] Your verification code is: ${code}. Valid for 10 minutes. Do not share this code.`
        )
      },
      phoneNumberValidator: (phone) => {
        const normalized = normalizeEthiopianPhone(phone)
        return /^\+251[79][0-9]{8}$/.test(normalized)
      },
      signUpOnVerification: {
        getTempEmail: (phone) => {
          const normalized = normalizeEthiopianPhone(phone)
          return `${normalized.replace('+', '')}@phone.agri.invalid`
        },
        getTempName: (phone) => normalizeEthiopianPhone(phone),
      },
      callbackOnVerification: async ({ user }) => {
        await onPhoneVerified(user.id)
      },
    }),

    twoFactor({
      otpOptions: {
        digits: 6,
        period: 600,
      },
      issuer: 'AgriIntelligence',
      skipVerificationOnEnable: true,
      sendOTP: async ({ user, otp }: { user: { phoneNumber?: string | null }; otp: string }) => {
        if (!user.phoneNumber) {
          throw new Error('[2fa] Administrator account has no registered phone number for 2FA delivery.')
        }
        const normalized = normalizeEthiopianPhone(user.phoneNumber)
        await sendSms(
          normalized,
          `[AgriIntelligence] Your administrative 2FA code is: ${otp}. Valid for 10 minutes. Do not share this code.`
        )
      },
    }),
  ],

  user: {
    additionalFields: {
      phoneNumber: {
        type: 'string',
        required: false,
        unique: true,
        fieldName: 'phone_number',
      },
      phoneNumberVerified: {
        type: 'boolean',
        required: true,
        defaultValue: false,
        fieldName: 'phone_number_verified',
      },
      role: {
        type: 'string',
        required: true,
        defaultValue: 'farmer',
        fieldName: 'role',
      },
      banned: {
        type: 'boolean',
        required: true,
        defaultValue: false,
        fieldName: 'banned',
      },
      banReason: {
        type: 'string',
        required: false,
        fieldName: 'ban_reason',
      },
      banExpires: {
        type: 'date',
        required: false,
        fieldName: 'ban_expires',
      },
      cityOfficeId: {
        type: 'string',
        required: false,
        fieldName: 'city_office_id',
      },
      preferredLanguage: {
        type: 'string',
        required: true,
        defaultValue: 'am',
        fieldName: 'preferred_language',
      },
      assignedKebeleIds: {
        type: 'string',
        required: true,
        defaultValue: '{}',
        fieldName: 'assigned_kebele_ids',
      },
      deletedAt: {
        type: 'date',
        required: false,
        fieldName: 'deleted_at',
      },
    },
  },

  advanced: {
    cookiePrefix: 'agri',
    generateId: () => crypto.randomUUID(),
    defaultCookieAttributes: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    },
  },

  rateLimit: {
    enabled: true,
    window: 3600,
    max: 100,
  },
})

export type Auth = typeof auth
