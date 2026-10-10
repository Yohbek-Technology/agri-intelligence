import { pgTable, uuid, varchar, timestamp, date, boolean, check, index, uniqueIndex, numeric, integer, smallint } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/_relations";
import { sql } from "drizzle-orm";
import { cityOffices } from "./tenancy.js";
import { farmers, plots } from "./farmers.js";
import { crops, cropVarieties, registeredChemicals } from "./catalog.js";
import { users } from "./auth-schema.js";
import {
  cycleStage,
  cycleStatus,
  seedSource,
  fertilizerApplicationType,
  fertilizerProduct,
  skipReason,
  operationType,
  irrigationMethod,
  quantityUnit,
  ledgerCategory,
} from "./enums.js";

export const cropCycles = pgTable(
  "crop_cycles",
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
    cropId: uuid("crop_id")
      .notNull()
      .references(() => crops.id),
    varietyId: uuid("variety_id").references(() => cropVarieties.id),
    seasonYear: smallint("season_year").notNull(),
    stage: cycleStage("stage").notNull().default("land_preparation"),
    status: cycleStatus("status").notNull().default("active"),
    stageChangedAt: timestamp("stage_changed_at", { withTimezone: true }).notNull().defaultNow(),
    stageChangedByUserId: uuid("stage_changed_by_user_id").references(() => users.id),
    startedOn: date("started_on").notNull(),
    closedOn: date("closed_on"),
    createdByUserId: uuid("created_by_user_id").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    uqOneActive: uniqueIndex("uq_crop_cycles_one_active")
      .on(table.plotId)
      .where(sql`status = 'active' and deleted_at is null`),
    startedOnCheck: check("crop_cycles_started_on_check", sql`started_on <= current_date`),
    seasonYearCheck: check("crop_cycles_season_year_check", sql`season_year between 2000 and 2100`),
    closedStatusCheck: check("crop_cycles_closed_status_check", sql`status <> 'closed' or closed_on is not null`),
    closedDateCheck: check("crop_cycles_closed_date_check", sql`closed_on is null or closed_on >= started_on`),
    idxPlot: index("idx_cycles_plot").on(table.plotId),
    idxCohort: index("idx_cycles_cohort").on(
      table.cityOfficeId,
      table.cropId,
      table.seasonYear,
      table.status
    ),
    idxFarmer: index("idx_cycles_farmer").on(table.farmerId),
  })
);

export const sowingLogs = pgTable(
  "sowing_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cityOfficeId: uuid("city_office_id")
      .notNull()
      .references(() => cityOffices.id),
    farmerId: uuid("farmer_id")
      .notNull()
      .references(() => farmers.id, { onDelete: "cascade" }),
    cycleId: uuid("cycle_id")
      .notNull()
      .references(() => cropCycles.id, { onDelete: "cascade" }),
    plantingDate: date("planting_date").notNull(),
    seedVarietyId: uuid("seed_variety_id").references(() => cropVarieties.id),
    seedVarietyOther: varchar("seed_variety_other", { length: 120 }),
    seedSource: seedSource("seed_source").notNull(),
    seedQuantityKg: numeric("seed_quantity_kg", { precision: 10, scale: 3 }).notNull(),
    seedRateKgPerHa: numeric("seed_rate_kg_per_ha", { precision: 8, scale: 2 }),
    createdByUserId: uuid("created_by_user_id").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    plantingDateCheck: check("sowing_logs_planting_date_check", sql`planting_date <= current_date`),
    seedQuantityCheck: check("sowing_logs_seed_quantity_check", sql`seed_quantity_kg > 0`),
    varietyCheck: check(
      "sowing_logs_variety_check",
      sql`seed_variety_id is not null or seed_variety_other is not null`
    ),
    uqCycleActive: uniqueIndex("uq_sowing_logs_cycle_active")
      .on(table.cycleId)
      .where(sql`deleted_at is null`),
  })
);

export const fertilizerLogs = pgTable(
  "fertilizer_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cityOfficeId: uuid("city_office_id")
      .notNull()
      .references(() => cityOffices.id),
    farmerId: uuid("farmer_id")
      .notNull()
      .references(() => farmers.id, { onDelete: "cascade" }),
    cycleId: uuid("cycle_id")
      .notNull()
      .references(() => cropCycles.id, { onDelete: "cascade" }),
    applicationType: fertilizerApplicationType("application_type").notNull(),
    fertilizerProduct: fertilizerProduct("fertilizer_product").notNull(),
    applied: boolean("applied").notNull().default(true),
    skipReason: skipReason("skip_reason"),
    quantityKg: numeric("quantity_kg", { precision: 10, scale: 3 }),
    applicationDate: date("application_date"),
    growthStageAtApplication: cycleStage("growth_stage_at_application"),
    rateKgPerHa: numeric("rate_kg_per_ha", { precision: 8, scale: 2 }),
    daysAfterSowing: smallint("days_after_sowing"),
    createdByUserId: uuid("created_by_user_id").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    productTypeCheck: check(
      "fertilizer_logs_product_check",
      sql`
        (application_type = 'basal' and fertilizer_product in ('nps', 'nps_zinc'))
        or (application_type in ('urea_1', 'urea_2') and fertilizer_product = 'urea')
      `
    ),
    appliedCheck: check(
      "fertilizer_logs_applied_check",
      sql`
        (applied and quantity_kg > 0 and quantity_kg <= 1000
           and application_date is not null and application_date <= current_date
           and skip_reason is null)
        or
        (not applied and skip_reason is not null
           and quantity_kg is null and application_date is null)
      `
    ),
    growthStageCheck: check(
      "fertilizer_logs_growth_stage_check",
      sql`
        not applied
        or application_type = 'basal'
        or growth_stage_at_application is not null
      `
    ),
    uqSlotActive: uniqueIndex("uq_fertilizer_logs_slot_active")
      .on(table.cycleId, table.applicationType)
      .where(sql`deleted_at is null`),
    idxCycle: index("idx_fertilizer_cycle")
      .on(table.cycleId)
      .where(sql`deleted_at is null`),
  })
);

export const fieldOperations = pgTable(
  "field_operations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cityOfficeId: uuid("city_office_id")
      .notNull()
      .references(() => cityOffices.id),
    farmerId: uuid("farmer_id")
      .notNull()
      .references(() => farmers.id, { onDelete: "cascade" }),
    cycleId: uuid("cycle_id")
      .notNull()
      .references(() => cropCycles.id, { onDelete: "cascade" }),
    operationType: operationType("operation_type").notNull(),
    operationDate: date("operation_date").notNull(),
    sequenceNumber: smallint("sequence_number"),
    chemicalId: uuid("chemical_id").references(() => registeredChemicals.id),
    productApplicationRate: numeric("product_application_rate", { precision: 10, scale: 3 }),
    rateUnit: varchar("rate_unit", { length: 20 }),
    irrigationMethod: irrigationMethod("irrigation_method"),
    durationMinutes: integer("duration_minutes"),
    createdByUserId: uuid("created_by_user_id").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    operationDateCheck: check("field_operations_date_check", sql`operation_date <= current_date`),
    operationTypeCheck: check(
      "field_operations_type_check",
      sql`
        (operation_type = 'plowing' and sequence_number between 1 and 10)
        or (operation_type = 'weeding' and sequence_number between 1 and 6)
        or (operation_type = 'spraying'
            and chemical_id is not null and product_application_rate > 0 and rate_unit is not null)
        or (operation_type = 'irrigation'
            and irrigation_method is not null and duration_minutes between 1 and 1440)
      `
    ),
    idxCycle: index("idx_operations_cycle")
      .on(table.cycleId, table.operationType, table.operationDate)
      .where(sql`deleted_at is null`),
  })
);

export const harvestRecords = pgTable(
  "harvest_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cityOfficeId: uuid("city_office_id")
      .notNull()
      .references(() => cityOffices.id),
    farmerId: uuid("farmer_id")
      .notNull()
      .references(() => farmers.id, { onDelete: "cascade" }),
    cycleId: uuid("cycle_id")
      .notNull()
      .references(() => cropCycles.id, { onDelete: "cascade" }),
    harvestDate: date("harvest_date").notNull(),
    enteredVolume: numeric("entered_volume", { precision: 10, scale: 3 }).notNull(),
    enteredUnit: quantityUnit("entered_unit").notNull(),
    volumeKg: numeric("volume_kg", { precision: 12, scale: 3 }).generatedAlwaysAs(
      sql`case entered_unit when 'quintal' then entered_volume * 100 else entered_volume end`
    ),
    yieldQtPerHa: numeric("yield_qt_per_ha", { precision: 8, scale: 2 }),
    plausibilityConfirmed: boolean("plausibility_confirmed").notNull().default(false),
    createdByUserId: uuid("created_by_user_id").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    enteredVolumeCheck: check("harvest_records_volume_check", sql`entered_volume > 0`),
    harvestDateCheck: check("harvest_records_date_check", sql`harvest_date <= current_date`),
    uqCycleActive: uniqueIndex("uq_harvest_records_cycle_active")
      .on(table.cycleId)
      .where(sql`deleted_at is null`),
    idxYield: index("idx_harvest_yield")
      .on(table.yieldQtPerHa)
      .where(sql`deleted_at is null`),
  })
);

export const ledgerEntries = pgTable(
  "ledger_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cityOfficeId: uuid("city_office_id")
      .notNull()
      .references(() => cityOffices.id),
    farmerId: uuid("farmer_id")
      .notNull()
      .references(() => farmers.id, { onDelete: "cascade" }),
    cycleId: uuid("cycle_id")
      .notNull()
      .references(() => cropCycles.id, { onDelete: "cascade" }),
    category: ledgerCategory("category").notNull(),
    amountEtb: numeric("amount_etb", { precision: 12, scale: 2 }).notNull(),
    entryDate: date("entry_date").notNull(),
    createdByUserId: uuid("created_by_user_id").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    amountCheck: check("ledger_entries_amount_check", sql`amount_etb > 0 and amount_etb <= 10000000`),
    entryDateCheck: check("ledger_entries_date_check", sql`entry_date <= current_date`),
    idxCycle: index("idx_ledger_cycle")
      .on(table.cycleId)
      .where(sql`deleted_at is null`),
  })
);

export const cropCyclesRelations = relations(cropCycles, ({ one, many }) => ({
  cityOffice: one(cityOffices, {
    fields: [cropCycles.cityOfficeId],
    references: [cityOffices.id],
  }),
  farmer: one(farmers, {
    fields: [cropCycles.farmerId],
    references: [farmers.id],
  }),
  plot: one(plots, {
    fields: [cropCycles.plotId],
    references: [plots.id],
  }),
  crop: one(crops, {
    fields: [cropCycles.cropId],
    references: [crops.id],
  }),
  variety: one(cropVarieties, {
    fields: [cropCycles.varietyId],
    references: [cropVarieties.id],
  }),
  sowingLogs: many(sowingLogs),
  fertilizerLogs: many(fertilizerLogs),
  fieldOperations: many(fieldOperations),
  harvestRecords: many(harvestRecords),
  ledgerEntries: many(ledgerEntries),
}));

export const sowingLogsRelations = relations(sowingLogs, ({ one }) => ({
  cityOffice: one(cityOffices, {
    fields: [sowingLogs.cityOfficeId],
    references: [cityOffices.id],
  }),
  farmer: one(farmers, {
    fields: [sowingLogs.farmerId],
    references: [farmers.id],
  }),
  cycle: one(cropCycles, {
    fields: [sowingLogs.cycleId],
    references: [cropCycles.id],
  }),
  seedVariety: one(cropVarieties, {
    fields: [sowingLogs.seedVarietyId],
    references: [cropVarieties.id],
  }),
}));

export const fertilizerLogsRelations = relations(fertilizerLogs, ({ one }) => ({
  cityOffice: one(cityOffices, {
    fields: [fertilizerLogs.cityOfficeId],
    references: [cityOffices.id],
  }),
  farmer: one(farmers, {
    fields: [fertilizerLogs.farmerId],
    references: [farmers.id],
  }),
  cycle: one(cropCycles, {
    fields: [fertilizerLogs.cycleId],
    references: [cropCycles.id],
  }),
}));

export const fieldOperationsRelations = relations(fieldOperations, ({ one }) => ({
  cityOffice: one(cityOffices, {
    fields: [fieldOperations.cityOfficeId],
    references: [cityOffices.id],
  }),
  farmer: one(farmers, {
    fields: [fieldOperations.farmerId],
    references: [farmers.id],
  }),
  cycle: one(cropCycles, {
    fields: [fieldOperations.cycleId],
    references: [cropCycles.id],
  }),
  chemical: one(registeredChemicals, {
    fields: [fieldOperations.chemicalId],
    references: [registeredChemicals.id],
  }),
}));

export const harvestRecordsRelations = relations(harvestRecords, ({ one }) => ({
  cityOffice: one(cityOffices, {
    fields: [harvestRecords.cityOfficeId],
    references: [cityOffices.id],
  }),
  farmer: one(farmers, {
    fields: [harvestRecords.farmerId],
    references: [farmers.id],
  }),
  cycle: one(cropCycles, {
    fields: [harvestRecords.cycleId],
    references: [cropCycles.id],
  }),
}));

export const ledgerEntriesRelations = relations(ledgerEntries, ({ one }) => ({
  cityOffice: one(cityOffices, {
    fields: [ledgerEntries.cityOfficeId],
    references: [cityOffices.id],
  }),
  farmer: one(farmers, {
    fields: [ledgerEntries.farmerId],
    references: [farmers.id],
  }),
  cycle: one(cropCycles, {
    fields: [ledgerEntries.cycleId],
    references: [cropCycles.id],
  }),
}));
