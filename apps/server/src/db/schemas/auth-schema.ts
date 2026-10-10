import { relations } from 'drizzle-orm/_relations'
import { pgTable, uuid, text, timestamp, boolean, index, check, varchar } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { userRole, appLanguage } from './enums.js'
import { cityOffices } from './tenancy.js'

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    emailVerified: boolean('email_verified').default(false).notNull(),
    image_url: varchar('image_url', { length: 500 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
    phone_number: varchar('phone_number', { length: 20 }).unique(),
    phone_number_verified: boolean('phone_number_verified').default(false).notNull(),
    role: userRole('role').default('farmer').notNull(),
    banned: boolean('banned').default(false).notNull(),
    ban_reason: text('ban_reason'),
    ban_expires_at: timestamp('ban_expires_at', { withTimezone: true }),
    city_office_id: uuid('city_office_id').references(() => cityOffices.id),
    preferred_language: appLanguage('preferred_language').default('am').notNull(),
    assigned_kebele_ids: uuid('assigned_kebele_ids').array().default(sql`'{}'::uuid[]`).notNull(),
    deleted_at: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    phoneFormatCheck: check(
      'users_phone_format_check',
      sql`phone_number is null or phone_number ~ '^\\+251[79][0-9]{8}$'`
    ),
    phoneOrDeletedCheck: check(
      'users_phone_or_deleted_check',
      sql`phone_number is not null or deleted_at is not null`
    ),
    verifiedNeedsPhoneCheck: check(
      'users_verified_needs_phone_check',
      sql`not phone_number_verified or phone_number is not null`
    ),
    roleOfficeCheck: check(
      'users_role_office_check',
      sql`role in ('system_admin', 'farmer') or city_office_id is not null`
    ),
  })
)

export const accounts = pgTable(
  'accounts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    provider_account_id: varchar('provider_account_id', { length: 255 }).notNull(),
    providerId: varchar('provider_id', { length: 100 }).notNull(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
  },
  (table) => ({
    userIdIdx: index('account_userId_idx').on(table.userId),
    credentialPasswordCheck: check(
      'accounts_credential_password_check',
      sql`provider_id <> 'credential' or password is not null`
    ),
  })
)

export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    token: varchar('token', { length: 500 }).notNull().unique(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
    ipAddress: varchar('ip_address', { length: 100 }),
    userAgent: text('user_agent'),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    userIdIdx: index('session_userId_idx').on(table.userId),
  })
)

export const verifications = pgTable(
  'verifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    identifier: varchar('identifier', { length: 255 }).notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
  },
  (table) => ({
    identifierIdx: index('verification_identifier_idx').on(table.identifier),
    expiryIdx: index('idx_verifications_expiry').on(table.expiresAt),
  })
)

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}))
