import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { phoneNumber, openAPI, username } from 'better-auth/plugins'
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
    schema: {
      ...schema,
      users: schema.users,
      accounts: schema.accounts,
      sessions: schema.sessions,
      verifications: schema.verifications,
    },
    usePlural: true,
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

    username({
      displayUsername: false,
      minUsernameLength: 3,
      maxUsernameLength: 30,
    }),

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
      sendPasswordResetOTP: ({ phoneNumber: phone, code }) => {
        const normalized = normalizeEthiopianPhone(phone)
        void sendSms(
          normalized,
          `[AgriIntelligence] Your password reset code is: ${code}. Valid for 10 minutes. Do not share this code.`
        )
      },
      phoneNumberValidator: (phone) =>
        ET_E164_REGEX.test(normalizeEthiopianPhone(phone)),
      signUpOnVerification: {
        getTempEmail: (phone) =>
          `${normalizeEthiopianPhone(phone).replace('+', '')}@phone.agri.invalid`,
        getTempName: (phone) => normalizeEthiopianPhone(phone),
      },
      callbackOnVerification: async ({ user }, ctx?: any) => {
        // Block re-registration: if this phone already has a credential account,
        // a new signup attempt must be rejected before we overwrite anything.
        const existingAcc = await ctx.context.internalAdapter.findCredentialAccount(user.id)
        if (existingAcc) {
          // Undo the phoneNumberVerified update better-auth just made,
          // then throw so the verify endpoint returns an error to the client.
          await ctx.context.internalAdapter.updateUser(user.id, { phone_number_verified: false })
          throw new Error('PHONE_ALREADY_REGISTERED: This phone number is already registered.')
        }
        if (ctx?.body?.password) {
          const hashedPassword = await ctx.context.password.hash(ctx.body.password)
          const existingAcc = await ctx.context.internalAdapter.findCredentialAccount(user.id)
          if (!existingAcc) {
            await ctx.context.internalAdapter.createAccount({
              userId: user.id,
              providerId: 'credential',
              accountId: user.id,
              password: hashedPassword,
            })
          }
        }
        if (ctx?.body?.name) {
          await ctx.context.internalAdapter.updateUser(user.id, { name: ctx.body.name })
        }
        if (ctx?.body?.preferredLanguage) {
          await ctx.context.internalAdapter.updateUser(user.id, { preferredLanguage: ctx.body.preferredLanguage })
        }
        await onPhoneVerified(user.id)
      },
    }),
  ],

  user: {
    fields: {
      image: 'image_url',
      banExpires: 'ban_expires_at',
    },
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
      username: {
        type: 'string',
        required: false,
        unique: true,
        fieldName: 'username',
      },
    },
  },

  account: {
    fields: {
      accountId: 'provider_account_id',
    },
  },

  advanced: {
    database: {
      generateId: 'uuid',
    },
    cookiePrefix: 'agri',
    defaultCookieAttributes: {
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: 'lax',
    },
    ipAddress: {
      ipAddressHeader: 'x-forwarded-for',
      trustedProxies: ['127.0.0.1', '::1'],
    },
  },

  rateLimit: {
    enabled: true,
    window: 3600,
    max: 100,
  },
})

export type Auth = typeof auth
