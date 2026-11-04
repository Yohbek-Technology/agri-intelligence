import { pgTable, pgView, uuid, varchar, timestamp, date, boolean, check, index, numeric, smallint, text, bigint } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/_relations";
import { sql } from "drizzle-orm";
import { plots } from "./farmers.js";
import { crops, cropVarieties, pesticides } from "./catalog.js";
import {
  seasonType,
  growthStage,
  weightUnit,
  fertilizerKind,
  fertilizerStage,
  activityType,
  txnCategory,
} from "./enums.js";

export const cropCycles = pgTable(
  "crop_cycles",
  {
    cycle_id: uuid("cycle_id").primaryKey().defaultRandom(),
    plot_id: uuid("plot_id")
      .notNull()
      .references(() => plots.plot_id),
    season_year: smallint("season_year").notNull(),
    season: seasonType("season").notNull(),
    crop_id: uuid("crop_id")
      .notNull()
      .references(() => crops.crop_id),
    variety_id: uuid("variety_id").references(() => cropVarieties.variety_id),
    current_stage: growthStage("current_stage").notNull().default("LAND_PREPARATION"),
    stage_updated_at: timestamp("stage_updated_at", { withTimezone: true }),
    status: varchar("status", { length: 10 }).notNull().default("ACTIVE"),
    // Planting
    planting_date: date("planting_date"),
    seed_type: varchar("seed_type", { length: 100 }),
    seed_source: varchar("seed_source", { length: 12 }),
    seed_amount_kg: numeric("seed_amount_kg", { precision: 10, scale: 2 }),
    // Harvest
    harvest_date: date("harvest_date"),
    harvest_value: numeric("harvest_value", { precision: 12, scale: 2 }),
    harvest_unit: weightUnit("harvest_unit"),
    harvest_kg: numeric("harvest_kg", { precision: 12, scale: 2 }),
    yield_qt_ha: numeric("yield_qt_ha", { precision: 8, scale: 2 }),
    grain_moisture_pct: numeric("grain_moisture_pct", { precision: 4, scale: 1 }),
    notes: text("notes"),
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
    deleted_at: timestamp("deleted_at", { withTimezone: true }),
    sync_version: bigint("sync_version", { mode: "number" }).notNull().default(0),
  },
  (table) => ({
    statusCheck: check("crop_cycles_status_check", sql`status in ('ACTIVE','HARVESTED','FAILED','ABANDONED')`),
    seedSourceCheck: check("crop_cycles_seed_source_check", sql`seed_source in ('COOPERATIVE','MARKET','SAVED','OTHER')`),
    idxCyclesPlotSeason: index("idx_cycles_plot_season").on(table.plot_id, table.season_year, table.season),
    idxCyclesCrop: index("idx_cycles_crop").on(table.crop_id, table.season_year),
  })
);

export const fertilizerApplications = pgTable(
  "fertilizer_applications",
  {
    application_id: uuid("application_id").primaryKey().defaultRandom(),
    cycle_id: uuid("cycle_id")
      .notNull()
      .references(() => cropCycles.cycle_id),
    fertilizer: fertilizerKind("fertilizer").notNull(),
    stage: fertilizerStage("stage").notNull(),
    amount_kg: numeric("amount_kg", { precision: 10, scale: 2 }).notNull(),
    application_date: date("application_date").notNull(),
    notes: text("notes"),
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
    deleted_at: timestamp("deleted_at", { withTimezone: true }),
    sync_version: bigint("sync_version", { mode: "number" }).notNull().default(0),
  },
  (table) => ({
    amountCheck: check("fertilizer_applications_amount_check", sql`amount_kg > 0`),
    idxFertCycle: index("idx_fert_cycle").on(table.cycle_id),
  })
);

export const farmActivities = pgTable(
  "farm_activities",
  {
    activity_id: uuid("activity_id").primaryKey().defaultRandom(),
    cycle_id: uuid("cycle_id")
      .notNull()
      .references(() => cropCycles.cycle_id),
    activity: activityType("activity").notNull(),
    activity_date: date("activity_date").notNull(),
    quantity: numeric("quantity", { precision: 10, scale: 2 }),
    quantity_unit: varchar("quantity_unit", { length: 20 }),
    pesticide_id: uuid("pesticide_id").references(() => pesticides.pesticide_id),
    notes: text("notes"),
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
    deleted_at: timestamp("deleted_at", { withTimezone: true }),
    sync_version: bigint("sync_version", { mode: "number" }).notNull().default(0),
  },
  (table) => ({
    idxActivityCycle: index("idx_activity_cycle").on(table.cycle_id, table.activity),
  })
);

export const farmTransactions = pgTable(
  "farm_transactions",
  {
    txn_id: uuid("txn_id").primaryKey().defaultRandom(),
    cycle_id: uuid("cycle_id")
      .notNull()
      .references(() => cropCycles.cycle_id),
    category: txnCategory("category").notNull(),
    is_income: boolean("is_income").notNull(),
    amount_etb: numeric("amount_etb", { precision: 14, scale: 2 }).notNull(),
    txn_date: date("txn_date").notNull(),
    description: text("description"),
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
    deleted_at: timestamp("deleted_at", { withTimezone: true }),
    sync_version: bigint("sync_version", { mode: "number" }).notNull().default(0),
  },
  (table) => ({
    amountCheck: check("farm_transactions_amount_check", sql`amount_etb >= 0`),
    incomeCategoryCheck: check("farm_transactions_income_category_check", sql`(category = 'CROP_SALE') = is_income`),
    idxTxnCycle: index("idx_txn_cycle").on(table.cycle_id),
  })
);

export const vCropCycleFinancials = pgView("v_crop_cycle_financials", {
  cycle_id: uuid("cycle_id"),
  total_expenses_etb: numeric("total_expenses_etb"),
  total_income_etb: numeric("total_income_etb"),
  profit_loss_etb: numeric("profit_loss_etb"),
}).as(sql`
  SELECT cycle_id,
         COALESCE(SUM(amount_etb) FILTER (WHERE NOT is_income),0) AS total_expenses_etb,
         COALESCE(SUM(amount_etb) FILTER (WHERE is_income),0)     AS total_income_etb,
         COALESCE(SUM(amount_etb) FILTER (WHERE is_income),0)
       - COALESCE(SUM(amount_etb) FILTER (WHERE NOT is_income),0) AS profit_loss_etb
  FROM farm_transactions WHERE deleted_at IS NULL GROUP BY cycle_id
`);

export const cropCyclesRelations = relations(cropCycles, ({ one, many }) => ({
  plot: one(plots, {
    fields: [cropCycles.plot_id],
    references: [plots.plot_id],
  }),
  crop: one(crops, {
    fields: [cropCycles.crop_id],
    references: [crops.crop_id],
  }),
  variety: one(cropVarieties, {
    fields: [cropCycles.variety_id],
    references: [cropVarieties.variety_id],
  }),
  fertilizerApplications: many(fertilizerApplications),
  activities: many(farmActivities),
  transactions: many(farmTransactions),
}));

export const fertilizerApplicationsRelations = relations(fertilizerApplications, ({ one }) => ({
  cycle: one(cropCycles, {
    fields: [fertilizerApplications.cycle_id],
    references: [cropCycles.cycle_id],
  }),
}));

export const farmActivitiesRelations = relations(farmActivities, ({ one }) => ({
  cycle: one(cropCycles, {
    fields: [farmActivities.cycle_id],
    references: [cropCycles.cycle_id],
  }),
  pesticide: one(pesticides, {
    fields: [farmActivities.pesticide_id],
    references: [pesticides.pesticide_id],
  }),
}));

export const farmTransactionsRelations = relations(farmTransactions, ({ one }) => ({
  cycle: one(cropCycles, {
    fields: [farmTransactions.cycle_id],
    references: [cropCycles.cycle_id],
  }),
}));
