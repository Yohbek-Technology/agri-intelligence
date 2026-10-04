import { pgTable, uuid, varchar, timestamp, jsonb, boolean, date, check, index, unique } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { cityOffices } from "./tenancy.js";
import { catalogStatus, chemicalCategory, pestKind, agroZone } from "./enums.js";

export const crops = pgTable(
  "crops",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cityOfficeId: uuid("city_office_id")
      .notNull()
      .references(() => cityOffices.id, { onDelete: "cascade" }),
    code: varchar("code", { length: 40 }).notNull(),
    nameEn: varchar("name_en", { length: 100 }).notNull(),
    nameAm: varchar("name_am", { length: 100 }),
    nameOm: varchar("name_om", { length: 100 }),
    nameTi: varchar("name_ti", { length: 100 }),
    maxPlausibleYieldQtHa: varchar("max_plausible_yield_qt_ha").notNull().default("80"),
    weedingWindows: jsonb("weeding_windows").notNull().default([]),
    recommendedSuccessors: uuid("recommended_successors").array().notNull().default(sql`'{}'::uuid[]`),
    status: catalogStatus("status").notNull().default("active"),
    effectiveFrom: date("effective_from").notNull().defaultNow(),
    effectiveTo: date("effective_to"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    uqCode: unique("crops_city_office_id_code_key").on(table.cityOfficeId, table.code),
    weedingWindowsCheck: check(
      "crops_weeding_windows_check",
      sql`jsonb_typeof(weeding_windows) = 'array'`
    ),
    selfSuccessorCheck: check(
      "crops_self_successor_check",
      sql`not (id = any(recommended_successors))`
    ),
  })
);

export const cropVarieties = pgTable(
  "crop_varieties",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cityOfficeId: uuid("city_office_id")
      .notNull()
      .references(() => cityOffices.id, { onDelete: "cascade" }),
    cropId: uuid("crop_id")
      .notNull()
      .references(() => crops.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 120 }).notNull(),
    isCertified: boolean("is_certified").notNull().default(true),
    permittedZones: agroZone("permitted_zones").array().notNull(),
    status: catalogStatus("status").notNull().default("active"),
    effectiveFrom: date("effective_from").notNull().defaultNow(),
    effectiveTo: date("effective_to"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    uqName: unique("crop_varieties_crop_id_name_key").on(table.cropId, table.name),
  })
);

export const fertilizerRates = pgTable(
  "fertilizer_rates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cityOfficeId: uuid("city_office_id")
      .notNull()
      .references(() => cityOffices.id, { onDelete: "cascade" }),
    cropId: uuid("crop_id")
      .notNull()
      .references(() => crops.id, { onDelete: "cascade" }),
    agroZone: agroZone("agro_zone").notNull(),
    ureaKgHa: varchar("urea_kg_ha").notNull(),
    npsKgHa: varchar("nps_kg_ha").notNull(),
    seedKgHa: varchar("seed_kg_ha").notNull(),
    ratesVersion: varchar("rates_version").notNull(),
    effectiveFrom: date("effective_from").notNull(),
    createdBy: uuid("created_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    uqVersion: unique("fertilizer_rates_office_crop_zone_effective_key").on(
      table.cityOfficeId,
      table.cropId,
      table.agroZone,
      table.effectiveFrom
    ),
    ratesCheck: check(
      "fertilizer_rates_check",
      sql`urea_kg_ha::numeric >= 0 and nps_kg_ha::numeric >= 0 and seed_kg_ha::numeric >= 0`
    ),
  })
);

export const pestCatalog = pgTable(
  "pest_catalog",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cityOfficeId: uuid("city_office_id")
      .notNull()
      .references(() => cityOffices.id, { onDelete: "cascade" }),
    code: varchar("code", { length: 60 }).notNull(),
    kind: pestKind("kind").notNull(),
    name: jsonb("name").notNull(),
    preventionAdvice: jsonb("prevention_advice"),
    referenceMediaId: uuid("reference_media_id"),
    isQuarantine: boolean("is_quarantine").notNull().default(false),
    status: catalogStatus("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    uqCode: unique("pest_catalog_city_office_id_code_key").on(table.cityOfficeId, table.code),
  })
);

export const registeredChemicals = pgTable(
  "registered_chemicals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cityOfficeId: uuid("city_office_id")
      .notNull()
      .references(() => cityOffices.id, { onDelete: "cascade" }),
    brandName: varchar("brand_name", { length: 150 }).notNull(),
    activeIngredient: varchar("active_ingredient", { length: 200 }).notNull(),
    registrationNumber: varchar("registration_number", { length: 80 }).notNull(),
    category: chemicalCategory("category").notNull(),
    dosageText: jsonb("dosage_text").notNull(),
    ppeText: jsonb("ppe_text"),
    safetyIntervalDays: varchar("safety_interval_days").notNull(),
    labelMediaId: uuid("label_media_id"),
    permittedZones: agroZone("permitted_zones").array(),
    targetCropIds: uuid("target_crop_ids").array().notNull().default(sql`'{}'::uuid[]`),
    targetPestIds: uuid("target_pest_ids").array().notNull().default(sql`'{}'::uuid[]`),
    status: catalogStatus("status").notNull().default("active"),
    effectiveFrom: date("effective_from").notNull().defaultNow(),
    effectiveTo: date("effective_to"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    uqRegistration: unique("registered_chemicals_office_registration_key").on(
      table.cityOfficeId,
      table.registrationNumber
    ),
    safetyIntervalCheck: check(
      "registered_chemicals_safety_check",
      sql`safety_interval_days::integer >= 0`
    ),
    idxTargetCrops: index("idx_chemicals_target_crops")
      .using("gin", table.targetCropIds)
      .where(sql`status = 'active'`),
    idxTargetPests: index("idx_chemicals_target_pests")
      .using("gin", table.targetPestIds)
      .where(sql`status = 'active'`),
  })
);

export const cropsRelations = relations(crops, ({ one, many }) => ({
  cityOffice: one(cityOffices, {
    fields: [crops.cityOfficeId],
    references: [cityOffices.id],
  }),
  varieties: many(cropVarieties),
  fertilizerRates: many(fertilizerRates),
}));

export const cropVarietiesRelations = relations(cropVarieties, ({ one }) => ({
  cityOffice: one(cityOffices, {
    fields: [cropVarieties.cityOfficeId],
    references: [cityOffices.id],
  }),
  crop: one(crops, {
    fields: [cropVarieties.cropId],
    references: [crops.id],
  }),
}));

export const fertilizerRatesRelations = relations(fertilizerRates, ({ one }) => ({
  cityOffice: one(cityOffices, {
    fields: [fertilizerRates.cityOfficeId],
    references: [cityOffices.id],
  }),
  crop: one(crops, {
    fields: [fertilizerRates.cropId],
    references: [crops.id],
  }),
}));

export const pestCatalogRelations = relations(pestCatalog, ({ one }) => ({
  cityOffice: one(cityOffices, {
    fields: [pestCatalog.cityOfficeId],
    references: [cityOffices.id],
  }),
}));

export const registeredChemicalsRelations = relations(registeredChemicals, ({ one }) => ({
  cityOffice: one(cityOffices, {
    fields: [registeredChemicals.cityOfficeId],
    references: [cityOffices.id],
  }),
}));
