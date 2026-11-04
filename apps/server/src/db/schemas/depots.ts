import { pgTable, uuid, varchar, timestamp, boolean, check, uniqueIndex, numeric, smallint, text } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/_relations";
import { sql } from "drizzle-orm";
import { cities, kebeles, geographyPoint } from "./tenancy.js";
import { crops, cropVarieties } from "./catalog.js";
import { cropCycles } from "./crop-cycles.js";
import { users } from "./auth-schema.js";
import { fertilizerKind, seasonType } from "./enums.js";

export const coopDepots = pgTable("coop_depots", {
  depot_id: uuid("depot_id").primaryKey().defaultRandom(),
  city_id: uuid("city_id")
    .notNull()
    .references(() => cities.city_id),
  kebele_id: uuid("kebele_id").references(() => kebeles.kebele_id),
  name: varchar("name", { length: 150 }).notNull(),
  manager_name: varchar("manager_name", { length: 150 }),
  manager_phone: varchar("manager_phone", { length: 20 }),
  location: geographyPoint("location"),
});

export const depotInventory = pgTable(
  "depot_inventory",
  {
    inventory_id: uuid("inventory_id").primaryKey().defaultRandom(),
    depot_id: uuid("depot_id")
      .notNull()
      .references(() => coopDepots.depot_id),
    item_kind: varchar("item_kind", { length: 10 }).notNull(),
    fertilizer: fertilizerKind("fertilizer"),
    variety_id: uuid("variety_id").references(() => cropVarieties.variety_id),
    quantity_kg: numeric("quantity_kg", { precision: 14, scale: 2 }).notNull().default("0"),
    updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (table) => ({
    itemKindCheck: check("depot_inventory_item_kind_check", sql`item_kind in ('FERTILIZER','SEED')`),
    itemConsistencyCheck: check(
      "depot_inventory_consistency_check",
      sql`(item_kind='FERTILIZER' AND fertilizer IS NOT NULL AND variety_id IS NULL) OR (item_kind='SEED' AND variety_id IS NOT NULL AND fertilizer IS NULL)`
    ),
    uqDepotFert: uniqueIndex("uq_depot_fert")
      .on(table.depot_id, table.fertilizer)
      .where(sql`item_kind = 'FERTILIZER'`),
    uqDepotSeed: uniqueIndex("uq_depot_seed")
      .on(table.depot_id, table.variety_id)
      .where(sql`item_kind = 'SEED'`),
  })
);

export const inputDemandReports = pgTable("input_demand_reports", {
  report_id: uuid("report_id").primaryKey().defaultRandom(),
  city_id: uuid("city_id")
    .notNull()
    .references(() => cities.city_id),
  kebele_id: uuid("kebele_id").references(() => kebeles.kebele_id),
  crop_id: uuid("crop_id")
    .notNull()
    .references(() => crops.crop_id),
  season_year: smallint("season_year").notNull(),
  season: seasonType("season").notNull(),
  area_ha: numeric("area_ha", { precision: 14, scale: 2 }).notNull(),
  urea_kg_required: numeric("urea_kg_required", { precision: 14, scale: 2 }),
  nps_kg_required: numeric("nps_kg_required", { precision: 14, scale: 2 }),
  seed_kg_required: numeric("seed_kg_required", { precision: 14, scale: 2 }),
  urea_kg_in_stock: numeric("urea_kg_in_stock", { precision: 14, scale: 2 }),
  nps_kg_in_stock: numeric("nps_kg_in_stock", { precision: 14, scale: 2 }),
  seed_kg_in_stock: numeric("seed_kg_in_stock", { precision: 14, scale: 2 }),
  shortfall: boolean("shortfall").notNull().default(false),
  generated_at: timestamp("generated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const yieldAudits = pgTable(
  "yield_audits",
  {
    audit_id: uuid("audit_id").primaryKey().defaultRandom(),
    city_id: uuid("city_id")
      .notNull()
      .references(() => cities.city_id),
    cycle_id: uuid("cycle_id")
      .notNull()
      .references(() => cropCycles.cycle_id),
    opened_by: uuid("opened_by")
      .notNull()
      .references(() => users.id),
    suspected_cause: varchar("suspected_cause", { length: 20 }),
    finding: text("finding"),
    status: varchar("status", { length: 10 }).notNull().default("OPEN"),
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    closed_at: timestamp("closed_at", { withTimezone: true }),
  },
  (table) => ({
    suspectedCauseCheck: check(
      "yield_audits_suspected_cause_check",
      sql`suspected_cause is null or suspected_cause in ('FERTILIZER_DOSE','UREA_TIMING','SOWING_DATE','WEEDING','SEED_VARIETY','WEATHER','PEST','OTHER')`
    ),
    statusCheck: check("yield_audits_status_check", sql`status in ('OPEN','IN_REVIEW','CLOSED')`),
  })
);

export const coopDepotsRelations = relations(coopDepots, ({ one, many }) => ({
  city: one(cities, {
    fields: [coopDepots.city_id],
    references: [cities.city_id],
  }),
  kebele: one(kebeles, {
    fields: [coopDepots.kebele_id],
    references: [kebeles.kebele_id],
  }),
  inventory: many(depotInventory),
}));

export const depotInventoryRelations = relations(depotInventory, ({ one }) => ({
  depot: one(coopDepots, {
    fields: [depotInventory.depot_id],
    references: [coopDepots.depot_id],
  }),
  variety: one(cropVarieties, {
    fields: [depotInventory.variety_id],
    references: [cropVarieties.variety_id],
  }),
}));

export const inputDemandReportsRelations = relations(inputDemandReports, ({ one }) => ({
  city: one(cities, {
    fields: [inputDemandReports.city_id],
    references: [cities.city_id],
  }),
  kebele: one(kebeles, {
    fields: [inputDemandReports.kebele_id],
    references: [kebeles.kebele_id],
  }),
  crop: one(crops, {
    fields: [inputDemandReports.crop_id],
    references: [crops.crop_id],
  }),
}));

export const yieldAuditsRelations = relations(yieldAudits, ({ one }) => ({
  city: one(cities, {
    fields: [yieldAudits.city_id],
    references: [cities.city_id],
  }),
  cycle: one(cropCycles, {
    fields: [yieldAudits.cycle_id],
    references: [cropCycles.cycle_id],
  }),
  openedByUser: one(users, {
    fields: [yieldAudits.opened_by],
    references: [users.id],
  }),
}));
