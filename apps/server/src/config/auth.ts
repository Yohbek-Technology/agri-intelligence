import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { phoneNumber, openAPI } from 'better-auth/plugins'
import { db } from '@/config/db.js'
import * as schema from '@/db/index.js'
import { sendSms, onPhoneVerified } from '@/services/sms.js'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),

  emailAndPassword: {
    enabled: true,
  },

  plugins: [
    openAPI(),
    
    phoneNumber({
      otpLength: 6,
      expiresIn: 600,
      allowedAttempts: 3,
      phoneNumberValidator: (phone) =>
        /^\+251[79][0-9]{8}$/.test(phone),
      sendOTP: ({ phoneNumber: phone, code }) => {
        void sendSms(phone, `Your AgriIntelligence verification code: ${code}. Valid for 10 minutes.`)
      },
      signUpOnVerification: {
        getTempEmail: (phone) => `${phone.replace('+', '')}@phone.agri.invalid`,
        getTempName: (phone) => phone,
      },
      callbackOnVerification: async ({ user }) => {
        await onPhoneVerified(user.id)
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
})
