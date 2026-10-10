import { pgTable, uuid, varchar, timestamp, boolean, jsonb, check, index, unique, smallint, numeric } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/_relations";
import { sql } from "drizzle-orm";
import { cityOffices } from "./tenancy.js";
import { farmers } from "./farmers.js";
import { users } from "./auth-schema.js";
import { pestCatalog } from "./catalog.js";
import {
  announcementType,
  announcementStatus,
  agroZone,
  deliveryChannel,
  deliveryStatus,
} from "./enums.js";

export const announcements = pgTable(
  "announcements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cityOfficeId: uuid("city_office_id")
      .notNull()
      .references(() => cityOffices.id, { onDelete: "cascade" }),
    createdByUserId: uuid("created_by_user_id").notNull().references(() => users.id),
    announcementType: announcementType("announcement_type").notNull(),
    status: announcementStatus("status").notNull().default("draft"),
    targetsEntireCity: boolean("targets_entire_city").notNull().default(true),
    targetKebeleIds: uuid("target_kebele_ids").array().notNull().default(sql`'{}'::uuid[]`),
    targetCropIds: uuid("target_crop_ids").array().notNull().default(sql`'{}'::uuid[]`),
    targetAgroZones: agroZone("target_agro_zones").array().notNull().default(sql`'{}'::agro_zone[]`),
    pestId: uuid("pest_id").references(() => pestCatalog.id),
    templateCode: varchar("template_code", { length: 60 }),
    templateVariables: jsonb("template_variables"),
    translations: jsonb("translations").notNull().default({}),
    requiresAcknowledgement: boolean("requires_acknowledgement").notNull().default(false),
    smsFallbackAfterMinutes: smallint("sms_fallback_after_minutes"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    recalledAt: timestamp("recalled_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    targetCheck: check(
      "announcements_target_check",
      sql`
        targets_entire_city 
        or cardinality(target_kebele_ids) + cardinality(target_crop_ids) + cardinality(target_agro_zones) > 0
      `
    ),
    publishedCheck: check(
      "announcements_published_check",
      sql`status <> 'published' or published_at is not null`
    ),
    translationsTypeCheck: check(
      "announcements_translations_type_check",
      sql`jsonb_typeof(translations) = 'object'`
    ),
    translationsKeysCheck: check(
      "announcements_translations_keys_check",
      sql`(translations - 'am' - 'om' - 'ti' - 'en') = '{}'::jsonb`
    ),
    translationsDraftCheck: check(
      "announcements_translations_draft_check",
      sql`status = 'draft' or translations <> '{}'::jsonb`
    ),
    idxOffice: index("idx_announcements_office").on(
      table.cityOfficeId,
      table.status,
      table.publishedAt
    ),
  })
);

export const announcementDeliveries = pgTable(
  "announcement_deliveries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    announcementId: uuid("announcement_id")
      .notNull()
      .references(() => announcements.id, { onDelete: "cascade" }),
    cityOfficeId: uuid("city_office_id")
      .notNull()
      .references(() => cityOffices.id),
    farmerId: uuid("farmer_id")
      .notNull()
      .references(() => farmers.id),
    channel: deliveryChannel("channel").notNull(),
    status: deliveryStatus("status").notNull().default("queued"),
    providerMessageId: varchar("provider_message_id", { length: 120 }),
    smsSegmentCount: smallint("sms_segment_count"),
    costEtb: numeric("cost_etb", { precision: 8, scale: 4 }),
    failureReason: varchar("failure_reason", { length: 255 }),
    queuedAt: timestamp("queued_at", { withTimezone: true }).notNull().defaultNow(),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    readAt: timestamp("read_at", { withTimezone: true }),
    acknowledgedAt: timestamp("acknowledged_at", { withTimezone: true }),
  },
  (table) => ({
    uqChannelFarmer: unique("announcement_deliveries_announcement_farmer_channel_key").on(
      table.announcementId,
      table.farmerId,
      table.channel
    ),
    idxAnnouncement: index("idx_deliveries_announcement").on(
      table.announcementId,
      table.channel,
      table.status
    ),
    idxFarmer: index("idx_deliveries_farmer").on(table.farmerId, table.queuedAt),
    idxUnread: index("idx_deliveries_unread")
      .on(table.farmerId, table.queuedAt)
      .where(sql`channel = 'app' and read_at is null`),
  })
);

export const announcementsRelations = relations(announcements, ({ one, many }) => ({
  cityOffice: one(cityOffices, {
    fields: [announcements.cityOfficeId],
    references: [cityOffices.id],
  }),
  createdByUser: one(users, {
    fields: [announcements.createdByUserId],
    references: [users.id],
  }),
  deliveries: many(announcementDeliveries),
}));

export const announcementDeliveriesRelations = relations(announcementDeliveries, ({ one }) => ({
  announcement: one(announcements, {
    fields: [announcementDeliveries.announcementId],
    references: [announcements.id],
  }),
  cityOffice: one(cityOffices, {
    fields: [announcementDeliveries.cityOfficeId],
    references: [cityOffices.id],
  }),
  farmer: one(farmers, {
    fields: [announcementDeliveries.farmerId],
    references: [farmers.id],
  }),
}));
