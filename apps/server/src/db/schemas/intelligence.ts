import { pgTable, pgView, uuid, varchar, timestamp, date, jsonb, check, index, unique, numeric, integer, smallint, text, boolean, bigint } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/_relations";
import { sql } from "drizzle-orm";
import { cities, kebeles, geographyPoint } from "./tenancy.js";
import { farmers, plots } from "./farmers.js";
import { cropCycles } from "./crop-cycles.js";
import { users } from "./auth-schema.js";
import { crops, pestsDiseases } from "./catalog.js";
import { agroZone, soilType, seasonType, severityLevel } from "./enums.js";

export const pestDiagnoses = pgTable(
  "pest_diagnoses",
  {
    diagnosis_id: uuid("diagnosis_id").primaryKey().defaultRandom(),
    farmer_id: uuid("farmer_id")
      .notNull()
      .references(() => farmers.farmer_id),
    plot_id: uuid("plot_id").references(() => plots.plot_id),
    cycle_id: uuid("cycle_id").references(() => cropCycles.cycle_id),
    kebele_id: uuid("kebele_id").references(() => kebeles.kebele_id),
    location: geographyPoint("location"),
    image_urls: text("image_urls").array().notNull(),
    image_public_ids: text("image_public_ids").array(),
    ai_context: jsonb("ai_context"),
    ai_result: jsonb("ai_result"),
    pest_id: uuid("pest_id").references(() => pestsDiseases.pest_id),
    confidence: numeric("confidence", { precision: 4, scale: 3 }),
    severity: severityLevel("severity"),
    explanation_text: text("explanation_text"),
    explanation_audio_url: text("explanation_audio_url"),
    explanation_audio_public_id: varchar("explanation_audio_public_id", { length: 255 }),
    recommended_pesticide_ids: uuid("recommended_pesticide_ids").array(),
    needs_expert_review: boolean("needs_expert_review").notNull().default(false),
    review_outcome: varchar("review_outcome", { length: 10 }),
    reviewed_by: uuid("reviewed_by").references(() => users.id),
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
    deleted_at: timestamp("deleted_at", { withTimezone: true }),
    sync_version: bigint("sync_version", { mode: "number" }).notNull().default(0),
  },
  (table) => ({
    confidenceCheck: check("pest_diagnoses_confidence_check", sql`confidence between 0 and 1`),
    reviewOutcomeCheck: check("pest_diagnoses_review_outcome_check", sql`review_outcome in ('CONFIRMED','CORRECTED','REJECTED')`),
    idxDiagKebeleTime: index("idx_diag_kebele_time").on(table.kebele_id, table.created_at.desc()),
    idxDiagLocation: index("idx_diag_location").using("gist", table.location),
  })
);

export const cropRotationRules = pgTable(
  "crop_rotation_rules",
  {
    rule_id: uuid("rule_id").primaryKey().defaultRandom(),
    previous_crop_id: uuid("previous_crop_id")
      .notNull()
      .references(() => crops.crop_id),
    next_crop_id: uuid("next_crop_id")
      .notNull()
      .references(() => crops.crop_id),
    zone: agroZone("zone"),
    soil: soilType("soil"),
    score: smallint("score").notNull(),
    rationale: text("rationale"),
  },
  (table) => ({
    scoreCheck: check("crop_rotation_rules_score_check", sql`score between 0 and 100`),
  })
);

export const yieldBenchmarks = pgTable(
  "yield_benchmarks",
  {
    benchmark_id: uuid("benchmark_id").primaryKey().defaultRandom(),
    city_id: uuid("city_id")
      .notNull()
      .references(() => cities.city_id),
    crop_id: uuid("crop_id")
      .notNull()
      .references(() => crops.crop_id),
    soil: soilType("soil").notNull(),
    season_year: smallint("season_year").notNull(),
    season: seasonType("season").notNull(),
    sample_size: integer("sample_size").notNull(),
    median_yield_qt_ha: numeric("median_yield_qt_ha", { precision: 8, scale: 2 }),
    top_yield_qt_ha: numeric("top_yield_qt_ha", { precision: 8, scale: 2 }),
    avg_urea_kg_ha: numeric("avg_urea_kg_ha", { precision: 8, scale: 2 }),
    avg_nps_kg_ha: numeric("avg_nps_kg_ha", { precision: 8, scale: 2 }),
    avg_planting_doy: smallint("avg_planting_doy"),
    avg_first_weeding_dap: smallint("avg_first_weeding_dap"),
    computed_at: timestamp("computed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    uqBenchmark: unique("yield_benchmarks_city_crop_soil_year_season_key").on(
      table.city_id,
      table.crop_id,
      table.soil,
      table.season_year,
      table.season
    ),
  })
);

export const yieldGapAnalyses = pgTable("yield_gap_analyses", {
  analysis_id: uuid("analysis_id").primaryKey().defaultRandom(),
  cycle_id: uuid("cycle_id")
    .notNull()
    .references(() => cropCycles.cycle_id),
  benchmark_id: uuid("benchmark_id").references(() => yieldBenchmarks.benchmark_id),
  own_yield_qt_ha: numeric("own_yield_qt_ha", { precision: 8, scale: 2 }),
  target_yield_qt_ha: numeric("target_yield_qt_ha", { precision: 8, scale: 2 }),
  gap_pct: numeric("gap_pct", { precision: 5, scale: 1 }),
  factors: jsonb("factors"),
  recommendations: jsonb("recommendations"),
  summary_text: text("summary_text"),
  summary_audio_url: text("summary_audio_url"),
  generated_at: timestamp("generated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const weatherForecasts = pgTable(
  "weather_forecasts",
  {
    forecast_id: uuid("forecast_id").primaryKey().defaultRandom(),
    kebele_id: uuid("kebele_id").references(() => kebeles.kebele_id),
    plot_id: uuid("plot_id").references(() => plots.plot_id),
    location: geographyPoint("location").notNull(),
    forecast_date: date("forecast_date").notNull(),
    temp_min_c: numeric("temp_min_c", { precision: 4, scale: 1 }),
    temp_max_c: numeric("temp_max_c", { precision: 4, scale: 1 }),
    rain_probability_pct: smallint("rain_probability_pct"),
    rain_mm: numeric("rain_mm", { precision: 6, scale: 1 }),
    humidity_pct: smallint("humidity_pct"),
    wind_kmh: numeric("wind_kmh", { precision: 5, scale: 1 }),
    est_soil_moisture: varchar("est_soil_moisture", { length: 12 }),
    plowing_ok: boolean("plowing_ok"),
    spraying_ok: boolean("spraying_ok"),
    spray_washoff_risk: boolean("spray_washoff_risk"),
    harvest_dry_ok: boolean("harvest_dry_ok"),
    advice_text: text("advice_text"),
    fetched_at: timestamp("fetched_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    rainProbCheck: check("weather_forecasts_rain_prob_check", sql`rain_probability_pct between 0 and 100`),
    soilMoistureCheck: check("weather_forecasts_soil_moisture_check", sql`est_soil_moisture in ('DRY','OPTIMAL','WET','WATERLOGGED')`),
    idxWeatherDate: index("idx_weather_date").on(table.forecast_date, table.kebele_id),
  })
);

export const vCycleYields = pgView("v_cycle_yields", {
  cycle_id: uuid("cycle_id"),
  city_id: uuid("city_id"),
  kebele_id: uuid("kebele_id"),
  plot_id: uuid("plot_id"),
  farmer_id: uuid("farmer_id"),
  season_year: smallint("season_year"),
  season: seasonType("season"),
  crop_id: uuid("crop_id"),
  variety_id: uuid("variety_id"),
  soil: soilType("soil"),
  zone: agroZone("zone"),
  area_hectares: numeric("area_hectares"),
  harvest_kg: numeric("harvest_kg"),
  yield_qt_ha: numeric("yield_qt_ha"),
}).as(sql`
  SELECT cc.cycle_id, p.city_id, p.kebele_id, p.plot_id, p.farmer_id,
         cc.season_year, cc.season, cc.crop_id, cc.variety_id, p.soil, p.zone,
         p.area_hectares, cc.harvest_kg, cc.yield_qt_ha
  FROM crop_cycles cc JOIN plots p ON p.plot_id = cc.plot_id
  WHERE cc.deleted_at IS NULL AND cc.harvest_kg IS NOT NULL
`);

export const vOutbreakHeatmap = pgView("v_outbreak_heatmap", {
  city_id: uuid("city_id"),
  kebele_id: uuid("kebele_id"),
  pest_id: uuid("pest_id"),
  report_count: bigint("report_count", { mode: "number" }),
  last_report_at: timestamp("last_report_at", { withTimezone: true }),
}).as(sql`
  SELECT k.city_id, pd.kebele_id, pd.pest_id, COUNT(*) AS report_count, MAX(pd.created_at) AS last_report_at
  FROM pest_diagnoses pd JOIN kebeles k ON k.kebele_id = pd.kebele_id
  WHERE pd.pest_id IS NOT NULL AND pd.deleted_at IS NULL AND pd.created_at > now() - INTERVAL '30 days'
  GROUP BY k.city_id, pd.kebele_id, pd.pest_id
`);

export const pestDiagnosesRelations = relations(pestDiagnoses, ({ one }) => ({
  farmer: one(farmers, {
    fields: [pestDiagnoses.farmer_id],
    references: [farmers.farmer_id],
  }),
  plot: one(plots, {
    fields: [pestDiagnoses.plot_id],
    references: [plots.plot_id],
  }),
  cycle: one(cropCycles, {
    fields: [pestDiagnoses.cycle_id],
    references: [cropCycles.cycle_id],
  }),
  kebele: one(kebeles, {
    fields: [pestDiagnoses.kebele_id],
    references: [kebeles.kebele_id],
  }),
  pest: one(pestsDiseases, {
    fields: [pestDiagnoses.pest_id],
    references: [pestsDiseases.pest_id],
  }),
  reviewer: one(users, {
    fields: [pestDiagnoses.reviewed_by],
    references: [users.id],
  }),
}));

export const yieldBenchmarksRelations = relations(yieldBenchmarks, ({ one }) => ({
  city: one(cities, {
    fields: [yieldBenchmarks.city_id],
    references: [cities.city_id],
  }),
  crop: one(crops, {
    fields: [yieldBenchmarks.crop_id],
    references: [crops.crop_id],
  }),
}));

export const yieldGapAnalysesRelations = relations(yieldGapAnalyses, ({ one }) => ({
  cycle: one(cropCycles, {
    fields: [yieldGapAnalyses.cycle_id],
    references: [cropCycles.cycle_id],
  }),
  benchmark: one(yieldBenchmarks, {
    fields: [yieldGapAnalyses.benchmark_id],
    references: [yieldBenchmarks.benchmark_id],
  }),
}));
