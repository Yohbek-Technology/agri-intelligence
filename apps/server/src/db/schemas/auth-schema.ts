import { relations } from 'drizzle-orm/_relations'
import { pgTable, text, timestamp, boolean, index, integer } from 'drizzle-orm/pg-core'

export const user = pgTable('user', {
  id:                   text('id').primaryKey(),
  name:                 text('name').notNull(),
  email:                text('email').notNull().unique(),
  emailVerified:        boolean('email_verified').default(false).notNull(),
  image:                text('image'),
  createdAt:            timestamp('created_at').defaultNow().notNull(),
  updatedAt:            timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
  phone_number:         text('phone_number').unique(),
  phone_number_verified: boolean('phone_number_verified').default(false).notNull(),
  role:                 text('role').default('farmer').notNull(),
  banned:               boolean('banned').default(false).notNull(),
  ban_reason:           text('ban_reason'),
  ban_expires:          timestamp('ban_expires'),
  city_office_id:       text('city_office_id'),
  preferred_language:   text('preferred_language').default('am').notNull(),
  assigned_kebele_ids:  text('assigned_kebele_ids').default('{}').notNull(),
  deleted_at:           timestamp('deleted_at'),
  twoFactorEnabled:     boolean('twoFactorEnabled').default(false).notNull(),
})

export const session = pgTable(
  'session',
  {
    id:         text('id').primaryKey(),
    expiresAt:  timestamp('expires_at').notNull(),
    token:      text('token').notNull().unique(),
    createdAt:  timestamp('created_at').defaultNow().notNull(),
    updatedAt:  timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
    ipAddress:  text('ip_address'),
    userAgent:  text('user_agent'),
    userId:     text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  },
  (table) => [index('session_userId_idx').on(table.userId)]
)

export const account = pgTable(
  'account',
  {
    id:                     text('id').primaryKey(),
    accountId:              text('account_id').notNull(),
    providerId:             text('provider_id').notNull(),
    userId:                 text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    accessToken:            text('access_token'),
    refreshToken:           text('refresh_token'),
    idToken:                text('id_token'),
    accessTokenExpiresAt:   timestamp('access_token_expires_at'),
    refreshTokenExpiresAt:  timestamp('refresh_token_expires_at'),
    scope:                  text('scope'),
    password:               text('password'),
    createdAt:              timestamp('created_at').defaultNow().notNull(),
    updatedAt:              timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
  },
  (table) => [index('account_userId_idx').on(table.userId)]
)

export const verification = pgTable(
  'verification',
  {
    id:         text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value:      text('value').notNull(),
    expiresAt:  timestamp('expires_at').notNull(),
    createdAt:  timestamp('created_at').defaultNow().notNull(),
    updatedAt:  timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
  },
  (table) => [index('verification_identifier_idx').on(table.identifier)]
)

export const twoFactor = pgTable(
  'twoFactor',
  {
    id:                     text('id').primaryKey(),
    secret:                 text('secret').notNull(),
    backupCodes:            text('backupCodes').notNull(),
    userId:                 text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
    verified:               boolean('verified').default(true).notNull(),
    failedVerificationCount: integer('failedVerificationCount').default(0).notNull(),
    lockedUntil:            timestamp('lockedUntil'),
    createdAt:              timestamp('createdAt').defaultNow().notNull(),
    updatedAt:              timestamp('updatedAt').defaultNow().notNull().$onUpdate(() => new Date()),
  },
  (table) => [index('twoFactor_userId_idx').on(table.userId)]
)

export const userRelations = relations(user, ({ many }) => ({
  sessions:   many(session),
  accounts:   many(account),
  twoFactors: many(twoFactor),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}))

export const twoFactorRelations = relations(twoFactor, ({ one }) => ({
  user: one(user, { fields: [twoFactor.userId], references: [user.id] }),
}))
