import { relations } from 'drizzle-orm/_relations'
import { pgTable, uuid, text, timestamp, boolean, index, varchar } from 'drizzle-orm/pg-core'
import { userRole, languageCode, approvalStatus } from './enums.js'
import { cities } from './tenancy.js'

export const users = pgTable(
  'users',
  {
    id: uuid('user_id').primaryKey().defaultRandom(),
    city_id: uuid('city_id').references(() => cities.city_id),
    role: userRole('role').notNull(),
    phone_number: varchar('phone_number', { length: 20 }).notNull().unique(),
    full_name: varchar('full_name', { length: 150 }).notNull(),
    username: varchar('username', { length: 50 }).unique(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    emailVerified: boolean('email_verified').default(false).notNull(),
    image_url: text('image_url'),
    is_phone_verified: boolean('is_phone_verified').default(false).notNull(),
    status: approvalStatus('status').default('PENDING').notNull(),
    language: languageCode('language').default('am').notNull(),
    auto_tts: boolean('auto_tts').default(true).notNull(),
    voice_nav_enabled: boolean('voice_nav_enabled').default(true).notNull(),
    last_login_at: timestamp('last_login_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
  }
)

export const accounts = pgTable(
  'accounts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    provider_account_id: text('provider_account_id').notNull(),
    providerId: text('provider_id').notNull(),
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
    userIdIdx: index('idx_accounts_user').on(table.userId),
  })
)

export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    token: text('token').notNull().unique(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
  },
  (table) => ({
    userIdIdx: index('idx_sessions_user').on(table.userId),
  })
)

export const verifications = pgTable(
  'verifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
  },
  (table) => ({
    identifierIdx: index('idx_verifications_identifier').on(table.identifier, table.expiresAt),
  })
)

export const usersRelations = relations(users, ({ many, one }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  city: one(cities, {
    fields: [users.city_id],
    references: [cities.city_id],
  }),
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}))
