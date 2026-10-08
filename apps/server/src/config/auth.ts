import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { phoneNumber, openAPI, twoFactor } from 'better-auth/plugins'
import { db } from '@/config/db.js'
import * as schema from '@/db/index.js'
import { sendSms, onPhoneVerified, normalizeEthiopianPhone } from '@/services/sms.js'

const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET
if (!BETTER_AUTH_SECRET) {
  throw new Error('[auth] BETTER_AUTH_SECRET environment variable is required.')
}

const IS_PRODUCTION = process.env.NODE_ENV === 'production'
const MOBILE_SESSION_SECONDS = 30 * 24 * 60 * 60
const ET_E164_REGEX = /^\+251[79][0-9]{8}$/

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),

  secret: BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:5000',
  appName: 'AgriIntelligence',

  trustedOrigins: [
    process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    process.env.BETTER_AUTH_URL ?? 'http://localhost:5000',
  ],

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
      sendOTP: ({ phoneNumber: phone, code }) => {
        const normalized = normalizeEthiopianPhone(phone)
        void sendSms(
          normalized,
          `[AgriIntelligence] Your verification code is: ${code}. Valid for 10 minutes. Do not share this code.`
        )
      },
      phoneNumberValidator: (phone) =>
        ET_E164_REGEX.test(normalizeEthiopianPhone(phone)),
      signUpOnVerification: {
        getTempEmail: (phone) =>
          `${normalizeEthiopianPhone(phone).replace('+', '')}@phone.agri.invalid`,
        getTempName: (phone) => normalizeEthiopianPhone(phone),
      },
      callbackOnVerification: async ({ user }) => {
        await onPhoneVerified(user.id)
      },
    }),

    twoFactor({
      issuer: 'AgriIntelligence',
      skipVerificationOnEnable: true,
      otpOptions: {
        sendOTP: ({ user, otp }) => {
          const rawUser = user as typeof user & { phoneNumber?: string | null }
          const phone = rawUser.phoneNumber
          if (!phone) {
            throw new Error(
              `[2fa] Administrator account (${user.id}) has no registered phone number for 2FA delivery.`
            )
          }
          void sendSms(
            normalizeEthiopianPhone(phone),
            `[AgriIntelligence] Your 2FA code is: ${otp}. Valid for 10 minutes. Do not share this code.`
          )
        },
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
      secure: IS_PRODUCTION,
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
