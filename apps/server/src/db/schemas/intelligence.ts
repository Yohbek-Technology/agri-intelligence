import { pgTable, uuid, varchar, timestamp, date, jsonb, check, index, unique } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { cityOffices, geography } from "./tenancy.js";
import { farmers, plots } from "./farmers.js";
import { cropCycles } from "./crop-cycles.js";
import {
  yieldAnalysisStatus,
  appLanguage,
  weatherAlertType,
  jobStatus,
  diagnosisSeverity,
  diagnosisReviewStatus,
} from "./enums.js";

export const yieldGapAnalyses = pgTable(
  "yield_gap_analyses",
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
    engineVersion: varchar("engine_version", { length: 20 }).notNull(),
    status: yieldAnalysisStatus("status").notNull(),
    cohortDefinition: jsonb("cohort_definition").notNull(),
    cohortSize: varchar("cohort_size").notNull(),
    plotYieldQtHa: varchar("plot_yield_qt_ha"),
    cohortMedianQtHa: varchar("cohort_median_qt_ha"),
    cohortP75QtHa: varchar("cohort_p75_qt_ha"),
    gapPctVsP75: varchar("gap_pct_vs_p75"),
    factorResults: jsonb("factor_results").notNull().default([]),
    rainOnsetDate: date("rain_onset_date"),
    topCauses: jsonb("top_causes").notNull().default([]),
    recommendations: jsonb("recommendations").notNull().default([]),
    narrationLang: appLanguage("narration_lang"),
    narrationText: varchar("narration_text"),
    narrationAudioId: uuid("narration_audio_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    uqCycleEngine: unique("yield_gap_analyses_cycle_engine_key").on(
      table.cycleId,
      table.engineVersion
    ),
    cohortSizeCheck: check(
      "yield_gap_analyses_cohort_check",
      sql`status <> 'completed' or cohort_size::integer >= 5`
    ),
    factorResultsCheck: check(
      "yield_gap_analyses_factor_check",
      sql`jsonb_typeof(factor_results) = 'array'`
    ),
    idxOffice: index("idx_yield_gap_office").on(table.cityOfficeId, table.createdAt),
  })
);

export const weatherForecasts = pgTable(
  "weather_forecasts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    gridLat: varchar("grid_lat").notNull(),
    gridLng: varchar("grid_lng").notNull(),
    fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    currentObs: jsonb("current_obs").notNull(),
    daily: jsonb("daily").notNull(),
  },
  (table) => ({
    uqGrid: unique("weather_forecasts_grid_key").on(table.gridLat, table.gridLng),
  })
);

export const weatherAlerts = pgTable(
  "weather_alerts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    gridLat: varchar("grid_lat").notNull(),
    gridLng: varchar("grid_lng").notNull(),
    alertType: weatherAlertType("alert_type").notNull(),
    startsOn: date("starts_on").notNull(),
    endsOn: date("ends_on").notNull(),
    details: jsonb("details").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    uqAlert: unique("weather_alerts_grid_type_starts_key").on(
      table.gridLat,
      table.gridLng,
      table.alertType,
      table.startsOn
    ),
    endsOnCheck: check("weather_alerts_ends_check", sql`ends_on >= starts_on`),
    idxGrid: index("idx_weather_alerts_grid").on(table.gridLat, table.gridLng, table.startsOn),
  })
);

export const diagnosisCases = pgTable(
  "diagnosis_cases",
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
    cycleId: uuid("cycle_id").references(() => cropCycles.id),
    requestedByUserId: uuid("requested_by_user_id"),
    photoMediaIds: uuid("photo_media_ids").array().notNull().default(sql`'{}'::uuid[]`),
    jobStatus: jobStatus("job_status").notNull().default("queued"),
    contextSnapshot: jsonb("context_snapshot"),
    rawResult: jsonb("raw_result"),
    pestId: uuid("pest_id"),
    diagnosisLabel: varchar("diagnosis_label", { length: 150 }),
    confidence: varchar("confidence"),
    severity: diagnosisSeverity("severity"),
    filteredRecommendations: jsonb("filtered_recommendations"),
    removedChemicals: jsonb("removed_chemicals").notNull().default([]),
    reviewStatus: diagnosisReviewStatus("review_status").notNull().default("none"),
    reviewedBy: uuid("reviewed_by"),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    resultAudioId: uuid("result_audio_id"),
    failureReason: varchar("failure_reason", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    confidenceCheck: check(
      "diagnosis_cases_confidence_check",
      sql`confidence is null or (confidence::numeric >= 0 and confidence::numeric <= 1)`
    ),
    photoCountCheck: check(
      "diagnosis_cases_photo_count_check",
      sql`cardinality(photo_media_ids) between 1 and 4`
    ),
    idxPlot: index("idx_diagnosis_plot").on(table.plotId, table.createdAt),
    idxQueue: index("idx_diagnosis_queue")
      .on(table.jobStatus)
      .where(sql`job_status in ('queued', 'processing')`),
    idxReview: index("idx_diagnosis_review")
      .on(table.reviewStatus)
      .where(sql`review_status = 'pending_da_review'`),
  })
);

export const outbreakClusters = pgTable(
  "outbreak_clusters",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cityOfficeId: uuid("city_office_id")
      .notNull()
      .references(() => cityOffices.id),
    pestId: uuid("pest_id").notNull(),
    kebeleId: uuid("kebele_id"),
    centroid: geography("centroid(Point, 4326)").notNull(),
    radiusM: varchar("radius_m").notNull(),
    caseCount: varchar("case_count").notNull(),
    contributingCaseIds: uuid("contributing_case_ids").array().notNull().default(sql`'{}'::uuid[]`),
    windowStart: date("window_start").notNull(),
    windowEnd: date("window_end").notNull(),
    status: varchar("status", { length: 10 }).notNull().default("open"),
    alertSentAt: timestamp("alert_sent_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    caseCountCheck: check("outbreak_clusters_case_count_check", sql`case_count::integer >= 1`),
    windowCheck: check("outbreak_clusters_window_check", sql`window_end >= window_start`),
    statusCheck: check("outbreak_clusters_status_check", sql`status in ('open', 'closed')`),
    idxOffice: index("idx_outbreak_office").on(table.cityOfficeId, table.status, table.windowEnd),
    idxCaseIds: index("idx_outbreak_case_ids").using("gin", table.contributingCaseIds),
  })
);

export const yieldGapAnalysesRelations = relations(yieldGapAnalyses, ({ one }) => ({
  cityOffice: one(cityOffices, {
    fields: [yieldGapAnalyses.cityOfficeId],
    references: [cityOffices.id],
  }),
  farmer: one(farmers, {
    fields: [yieldGapAnalyses.farmerId],
    references: [farmers.id],
  }),
  cycle: one(cropCycles, {
    fields: [yieldGapAnalyses.cycleId],
    references: [cropCycles.id],
  }),
}));

export const diagnosisCasesRelations = relations(diagnosisCases, ({ one }) => ({
  cityOffice: one(cityOffices, {
    fields: [diagnosisCases.cityOfficeId],
    references: [cityOffices.id],
  }),
  farmer: one(farmers, {
    fields: [diagnosisCases.farmerId],
    references: [farmers.id],
  }),
  plot: one(plots, {
    fields: [diagnosisCases.plotId],
    references: [plots.id],
  }),
  cycle: one(cropCycles, {
    fields: [diagnosisCases.cycleId],
    references: [cropCycles.id],
  }),
}));

export const outbreakClustersRelations = relations(outbreakClusters, ({ one }) => ({
  cityOffice: one(cityOffices, {
    fields: [outbreakClusters.cityOfficeId],
    references: [cityOffices.id],
  }),
}));
