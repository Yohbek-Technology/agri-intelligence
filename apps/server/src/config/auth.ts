import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { phoneNumber, openAPI, bearer, username } from 'better-auth/plugins'
import { db } from '@/config/db.js'
import * as schema from '@/db/index.js'
import { eq } from 'drizzle-orm'
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
    bearer(),

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
          `${normalizeEthiopianPhone(phone).replace(/[^0-9]/g, '')}@phone.agri.invalid`,
        getTempName: (phone) => normalizeEthiopianPhone(phone),
      },
      callbackOnVerification: async ({ user }, ctx?: any) => {
        // Block re-registration: if this phone already has a credential account,
        // a new signup attempt must be rejected before we overwrite anything.
        const existingAcc = await ctx.context.internalAdapter.findCredentialAccount(user.id)
        if (existingAcc) {
          await ctx.context.internalAdapter.updateUser(user.id, { is_phone_verified: false })
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
        if (ctx?.body?.username) {
          await db
            .update(schema.users)
            .set({ username: ctx.body.username.toLowerCase() })
            .where(eq(schema.users.id, user.id))
        }
        if (ctx?.body?.language || ctx?.body?.preferredLanguage) {
          await ctx.context.internalAdapter.updateUser(user.id, { language: ctx.body.language || ctx.body.preferredLanguage })
        }
        await onPhoneVerified(user.id)
      },
    }),
  ],

  user: {
    fields: {
      name: 'full_name',
      image: 'image_url',
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
        fieldName: 'is_phone_verified',
      },
      role: {
        type: 'string',
        required: true,
        defaultValue: 'FARMER',
        fieldName: 'role',
      },
      status: {
        type: 'string',
        required: true,
        defaultValue: 'PENDING',
        fieldName: 'status',
      },
      cityId: {
        type: 'string',
        required: false,
        fieldName: 'city_id',
      },
      language: {
        type: 'string',
        required: true,
        defaultValue: 'am',
        fieldName: 'language',
      },
      autoTts: {
        type: 'boolean',
        required: true,
        defaultValue: true,
        fieldName: 'auto_tts',
      },
      voiceNavEnabled: {
        type: 'boolean',
        required: true,
        defaultValue: true,
        fieldName: 'voice_nav_enabled',
      },
      lastLoginAt: {
        type: 'date',
        required: false,
        fieldName: 'last_login_at',
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
      sameSite: IS_PRODUCTION ? 'none' : 'lax',
    },
    ipAddress: {
      ipAddressHeaders: ['x-forwarded-for', 'x-real-ip'],
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
