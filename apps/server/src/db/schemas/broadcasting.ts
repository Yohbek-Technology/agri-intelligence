import { pgTable, uuid, varchar, timestamp, boolean, text, integer, numeric, check, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/_relations";
import { sql } from "drizzle-orm";
import { cities, geographyPoint } from "./tenancy.js";
import { farmers } from "./farmers.js";
import { users } from "./auth-schema.js";
import { crops, pestsDiseases } from "./catalog.js";
import {
  severityLevel,
  languageCode,
  channelType,
  deliveryStatus,
} from "./enums.js";

export const announcements = pgTable(
  "announcements",
  {
    announcement_id: uuid("announcement_id").primaryKey().defaultRandom(),
    city_id: uuid("city_id")
      .notNull()
      .references(() => cities.city_id),
    created_by: uuid("created_by").references(() => users.id),
    type: varchar("type", { length: 20 }).notNull(),
    pest_id: uuid("pest_id").references(() => pestsDiseases.pest_id),
    severity: severityLevel("severity").notNull().default("LOW"),
    language: languageCode("language").notNull().default("am"),
    title: varchar("title", { length: 200 }).notNull(),
    body: text("body").notNull(),
    sms_text: varchar("sms_text", { length: 480 }),
    audio_url: text("audio_url"),
    audio_public_id: varchar("audio_public_id", { length: 255 }),
    audio_duration_sec: integer("audio_duration_sec"),
    channels: channelType("channels").array().notNull(),
    target_kebele_ids: uuid("target_kebele_ids").array(),
    published_at: timestamp("published_at", { withTimezone: true }),
    expires_at: timestamp("expires_at", { withTimezone: true }),
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    typeCheck: check(
      "announcements_type_check",
      sql`type in ('SEASONAL_ADVICE','INPUT_AVAILABILITY','EMERGENCY','QUARANTINE','WEATHER_ALERT','WEEKLY_WEATHER')`
    ),
  })
);

export const announcementDeliveries = pgTable(
  "announcement_deliveries",
  {
    delivery_id: uuid("delivery_id").primaryKey().defaultRandom(),
    announcement_id: uuid("announcement_id")
      .notNull()
      .references(() => announcements.announcement_id),
    farmer_id: uuid("farmer_id")
      .notNull()
      .references(() => farmers.farmer_id),
    channel: channelType("channel").notNull(),
    status: deliveryStatus("status").notNull().default("QUEUED"),
    error_message: text("error_message"),
    sent_at: timestamp("sent_at", { withTimezone: true }),
  },
  (table) => ({
    idxDeliveries: index("idx_deliveries").on(table.announcement_id, table.status),
  })
);

export const outbreakClusterAlerts = pgTable(
  "outbreak_cluster_alerts",
  {
    cluster_id: uuid("cluster_id").primaryKey().defaultRandom(),
    city_id: uuid("city_id")
      .notNull()
      .references(() => cities.city_id),
    pest_id: uuid("pest_id")
      .notNull()
      .references(() => pestsDiseases.pest_id),
    center_point: geographyPoint("center_point").notNull(),
    radius_m: integer("radius_m").notNull(),
    case_count: integer("case_count").notNull(),
    severity: severityLevel("severity").notNull(),
    is_active: boolean("is_active").notNull().default(true),
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    idxOutbreakActive: index("idx_outbreak_active").on(table.city_id, table.is_active),
  })
);

export const knowledgeArticles = pgTable(
  "knowledge_articles",
  {
    article_id: uuid("article_id").primaryKey().defaultRandom(),
    crop_id: uuid("crop_id").references(() => crops.crop_id),
    topic: varchar("topic", { length: 20 }).notNull(),
    language: languageCode("language").notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    content: text("content").notNull(),
    target_moisture_pct: numeric("target_moisture_pct", { precision: 4, scale: 1 }),
    audio_url: text("audio_url"),
  },
  (table) => ({
    topicCheck: check(
      "knowledge_articles_topic_check",
      sql`topic in ('MOISTURE_TEST','HERMETIC_BAG','STORAGE_PESTS','GENERAL')`
    ),
  })
);

export const announcementsRelations = relations(announcements, ({ one, many }) => ({
  city: one(cities, {
    fields: [announcements.city_id],
    references: [cities.city_id],
  }),
  createdByUser: one(users, {
    fields: [announcements.created_by],
    references: [users.id],
  }),
  pest: one(pestsDiseases, {
    fields: [announcements.pest_id],
    references: [pestsDiseases.pest_id],
  }),
  deliveries: many(announcementDeliveries),
}));

export const announcementDeliveriesRelations = relations(announcementDeliveries, ({ one }) => ({
  announcement: one(announcements, {
    fields: [announcementDeliveries.announcement_id],
    references: [announcements.announcement_id],
  }),
  farmer: one(farmers, {
    fields: [announcementDeliveries.farmer_id],
    references: [farmers.farmer_id],
  }),
}));

export const outbreakClusterAlertsRelations = relations(outbreakClusterAlerts, ({ one }) => ({
  city: one(cities, {
    fields: [outbreakClusterAlerts.city_id],
    references: [cities.city_id],
  }),
  pest: one(pestsDiseases, {
    fields: [outbreakClusterAlerts.pest_id],
    references: [pestsDiseases.pest_id],
  }),
}));

export const knowledgeArticlesRelations = relations(knowledgeArticles, ({ one }) => ({
  crop: one(crops, {
    fields: [knowledgeArticles.crop_id],
    references: [crops.crop_id],
  }),
}));
