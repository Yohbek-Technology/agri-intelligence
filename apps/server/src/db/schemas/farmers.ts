import { pgTable, uuid, varchar, timestamp, boolean, check, index, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/_relations";
import { sql } from "drizzle-orm";
import { cityOffices, kebeles } from "./tenancy.js";
import { appLanguage } from "./enums.js";

export const farmers = pgTable(
  "farmers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cityOfficeId: uuid("city_office_id")
      .notNull()
      .references(() => cityOffices.id),
    userId: uuid("user_id"),
    fullName: varchar("full_name", { length: 120 }).notNull(),
    phoneNumber: varchar("phone_number", { length: 20 }),
    noPhone: boolean("no_phone").notNull().default(false),
    localIdNumber: varchar("local_id_number", { length: 40 }).notNull(),
    kebeleId: uuid("kebele_id")
      .notNull()
      .references(() => kebeles.id),
    assignedDaId: uuid("assigned_da_id"),
    registeredByUserId: uuid("registered_by_user_id"),
    preferredLanguage: appLanguage("preferred_language").notNull().default("am"),
    isVerified: boolean("is_verified").notNull().default(false),
    consentAgreed: boolean("consent_agreed").notNull().default(true),
    consentAgreedAt: timestamp("consent_agreed_at", { withTimezone: true }).defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    fullNameCheck: check(
      "farmers_full_name_check",
      sql`full_name = btrim(full_name) and char_length(full_name) between 2 and 120`
    ),
    noPhoneCheck: check(
      "farmers_no_phone_check",
      sql`no_phone = (phone_number is null)`
    ),
    phoneFormatCheck: check(
      "farmers_phone_format_check",
      sql`phone_number is null or phone_number ~ '^\\+251[79][0-9]{8}$'`
    ),
    consentCheck: check(
      "farmers_consent_check",
      sql`not consent_agreed or consent_agreed_at is not null`
    ),
    uqPhoneActive: uniqueIndex("uq_farmers_phone_active")
      .on(table.phoneNumber)
      .where(sql`deleted_at is null and phone_number is not null`),
    uqLocalIdActive: uniqueIndex("uq_farmers_local_id_active")
      .on(table.cityOfficeId, table.localIdNumber)
      .where(sql`deleted_at is null`),
    idxOfficeVerified: index("idx_farmers_office_verified")
      .on(table.cityOfficeId, table.isVerified)
      .where(sql`deleted_at is null`),
    idxDa: index("idx_farmers_da")
      .on(table.assignedDaId)
      .where(sql`deleted_at is null`),
    idxKebele: index("idx_farmers_kebele").on(table.kebeleId),
    idxNameFts: index("idx_farmers_name_fts")
      .using("gin", sql`to_tsvector('simple', full_name)`),
  })
);

export const plots = pgTable(
  "plots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cityOfficeId: uuid("city_office_id")
      .notNull()
      .references(() => cityOffices.id),
    farmerId: uuid("farmer_id")
      .notNull()
      .references(() => farmers.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 60 }).notNull(),
    areaValue: varchar("area_value").notNull(),
    areaUnit: varchar("area_unit").notNull(),
    conversionFactorUsed: varchar("conversion_factor_used").notNull(),
    centroidLat: varchar("centroid_lat").notNull(),
    centroidLng: varchar("centroid_lng").notNull(),
    gpsAccuracyM: varchar("gps_accuracy_m").notNull(),
    elevationM: varchar("elevation_m").notNull(),
    agroZoneDerived: varchar("agro_zone_derived").notNull(),
    agroZone: varchar("agro_zone").notNull(),
    agroZoneOverrideReason: varchar("agro_zone_override_reason", { length: 255 }),
    kebeleId: uuid("kebele_id").references(() => kebeles.id),
    soilClass: varchar("soil_class"),
    drainage: varchar("drainage"),
    plannedCropId: uuid("planned_crop_id"),
    plannedSeasonYear: varchar("planned_season_year"),
    status: varchar("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    uqNameActive: uniqueIndex("uq_plots_name_active")
      .on(table.farmerId, sql`lower(name)`)
      .where(sql`deleted_at is null`),
    idxFarmer: index("idx_plots_farmer")
      .on(table.farmerId)
      .where(sql`deleted_at is null`),
    idxOfficeKebele: index("idx_plots_office_kebele")
      .on(table.cityOfficeId, table.kebeleId)
      .where(sql`deleted_at is null`),
    idxSoilZone: index("idx_plots_soil_zone")
      .on(table.cityOfficeId, table.soilClass, table.agroZone)
      .where(sql`deleted_at is null`),
    idxPlannedCrop: index("idx_plots_planned_crop")
      .on(table.cityOfficeId, table.plannedCropId)
      .where(sql`deleted_at is null and planned_crop_id is not null`),
  })
);

export const plotCropHistory = pgTable(
  "plot_crop_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cityOfficeId: uuid("city_office_id")
      .notNull()
      .references(() => cityOffices.id),
    farmerId: uuid("farmer_id")
      .notNull()
      .references(() => farmers.id, { onDelete: "cascade" }),
    plotId: uuid("plot_id")
      .notNull()
      .references(() => plots.id, { onDelete: "cascade" }),
    seasonYear: varchar("season_year").notNull(),
    cropId: uuid("crop_id"),
    fallow: boolean("fallow").notNull().default(false),
    createdByUserId: uuid("created_by_user_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    fallowCheck: check(
      "plot_crop_history_fallow_check",
      sql`fallow = (crop_id is null)`
    ),
  })
);

export const farmersRelations = relations(farmers, ({ one, many }) => ({
  cityOffice: one(cityOffices, {
    fields: [farmers.cityOfficeId],
    references: [cityOffices.id],
  }),
  kebele: one(kebeles, {
    fields: [farmers.kebeleId],
    references: [kebeles.id],
  }),
  plots: many(plots),
  plotCropHistory: many(plotCropHistory),
}));

export const plotsRelations = relations(plots, ({ one, many }) => ({
  cityOffice: one(cityOffices, {
    fields: [plots.cityOfficeId],
    references: [cityOffices.id],
  }),
  farmer: one(farmers, {
    fields: [plots.farmerId],
    references: [farmers.id],
  }),
  kebele: one(kebeles, {
    fields: [plots.kebeleId],
    references: [kebeles.id],
  }),
  plotCropHistory: many(plotCropHistory),
}));

export const plotCropHistoryRelations = relations(plotCropHistory, ({ one }) => ({
  cityOffice: one(cityOffices, {
    fields: [plotCropHistory.cityOfficeId],
    references: [cityOffices.id],
  }),
  farmer: one(farmers, {
    fields: [plotCropHistory.farmerId],
    references: [farmers.id],
  }),
  plot: one(plots, {
    fields: [plotCropHistory.plotId],
    references: [plots.id],
  }),
}));
