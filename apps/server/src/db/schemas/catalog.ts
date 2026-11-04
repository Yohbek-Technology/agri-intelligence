import { pgTable, uuid, varchar, timestamp, boolean, date, check, unique, numeric, smallint, text, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/_relations";
import { sql } from "drizzle-orm";
import { cities } from "./tenancy.js";
import { agroZone } from "./enums.js";

export const crops = pgTable("crops", {
  crop_id: uuid("crop_id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 30 }).notNull().unique(),
  name_en: varchar("name_en", { length: 60 }).notNull(),
  seed_rate_kg_ha: numeric("seed_rate_kg_ha", { precision: 8, scale: 2 }),
  urea_kg_ha: numeric("urea_kg_ha", { precision: 8, scale: 2 }),
  nps_kg_ha: numeric("nps_kg_ha", { precision: 8, scale: 2 }),
  is_active: boolean("is_active").notNull().default(true),
});

export const cropVarieties = pgTable(
  "crop_varieties",
  {
    variety_id: uuid("variety_id").primaryKey().defaultRandom(),
    crop_id: uuid("crop_id")
      .notNull()
      .references(() => crops.crop_id),
    name: varchar("name", { length: 100 }).notNull(),
    seed_class: varchar("seed_class", { length: 20 }).notNull(),
    potential_yield_qt_ha: numeric("potential_yield_qt_ha", { precision: 8, scale: 2 }),
    suitable_zones: agroZone("suitable_zones").array(),
    is_approved: boolean("is_approved").notNull().default(true),
  },
  (table) => ({
    uqCropName: unique("crop_varieties_crop_id_name_key").on(table.crop_id, table.name),
    seedClassCheck: check(
      "crop_varieties_seed_class_check",
      sql`seed_class in ('CERTIFIED_IMPROVED','RECYCLED_IMPROVED','LOCAL_LANDRACE')`
    ),
  })
);

export const pestsDiseases = pgTable(
  "pests_diseases",
  {
    pest_id: uuid("pest_id").primaryKey().defaultRandom(),
    code: varchar("code", { length: 40 }).notNull().unique(),
    name_en: varchar("name_en", { length: 100 }).notNull(),
    kind: varchar("kind", { length: 10 }).notNull(),
    is_quarantine: boolean("is_quarantine").notNull().default(false),
    symptoms: text("symptoms"),
    management_advice: text("management_advice"),
  },
  (table) => ({
    kindCheck: check("pests_diseases_kind_check", sql`kind in ('PEST','DISEASE','WEED','DEFICIENCY')`),
  })
);

export const pesticides = pgTable("pesticides", {
  pesticide_id: uuid("pesticide_id").primaryKey().defaultRandom(),
  trade_name: varchar("trade_name", { length: 100 }).notNull(),
  active_ingredient: varchar("active_ingredient", { length: 150 }).notNull(),
  registration_number: varchar("registration_number", { length: 60 }).unique(),
  is_registered: boolean("is_registered").notNull().default(true),
  registration_expiry: date("registration_expiry"),
  target_pest_ids: uuid("target_pest_ids").array(),
  target_crop_ids: uuid("target_crop_ids").array(),
  dosage_instructions: text("dosage_instructions"),
  rain_free_hours: smallint("rain_free_hours"),
  safety_notes: text("safety_notes"),
});

export const cityPesticides = pgTable(
  "city_pesticides",
  {
    city_id: uuid("city_id")
      .notNull()
      .references(() => cities.city_id),
    pesticide_id: uuid("pesticide_id")
      .notNull()
      .references(() => pesticides.pesticide_id),
    is_available: boolean("is_available").notNull().default(true),
    verified_at: timestamp("verified_at", { withTimezone: true }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.city_id, table.pesticide_id] }),
  })
);

export const cropsRelations = relations(crops, ({ many }) => ({
  varieties: many(cropVarieties),
}));

export const cropVarietiesRelations = relations(cropVarieties, ({ one }) => ({
  crop: one(crops, {
    fields: [cropVarieties.crop_id],
    references: [crops.crop_id],
  }),
}));

export const cityPesticidesRelations = relations(cityPesticides, ({ one }) => ({
  city: one(cities, {
    fields: [cityPesticides.city_id],
    references: [cities.city_id],
  }),
  pesticide: one(pesticides, {
    fields: [cityPesticides.pesticide_id],
    references: [pesticides.pesticide_id],
  }),
}));


