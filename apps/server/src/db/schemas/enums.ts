import { pgEnum } from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["farmer", "da", "officer", "system_admin"]);

export const appLanguage = pgEnum("app_language", ["am", "om", "ti", "en"]);

export const areaUnit = pgEnum("area_unit", ["timad", "kert", "hectare"]);

export const agroZone = pgEnum("agro_zone", ["dega", "weyna_dega", "kolla"]);

export const soilClass = pgEnum("soil_class", [
  "koticha_vertisol",
  "beda_nitisol",
  "sandy",
  "clay",
  "loam",
]);

export const drainageClass = pgEnum("drainage_class", [
  "waterlogs",
  "moderate",
  "free_draining",
]);

export const plotStatus = pgEnum("plot_status", ["active", "archived"]);

export const catalogStatus = pgEnum("catalog_status", ["active", "retired"]);

export const chemicalCategory = pgEnum("chemical_category", [
  "insecticide",
  "fungicide",
  "herbicide",
  "other",
]);

export const pestKind = pgEnum("pest_kind", ["pest", "disease"]);

export const cycleStage = pgEnum("cycle_stage", [
  "land_preparation",
  "sowing",
  "vegetative",
  "flowering",
  "grain_filling",
  "harvest",
]);

export const cycleStatus = pgEnum("cycle_status", ["active", "closed", "abandoned"]);

export const seedSource = pgEnum("seed_source", [
  "certified_improved",
  "recycled_local",
  "other",
]);

export const fertilizerApplicationType = pgEnum("fertilizer_application_type", [
  "basal",
  "urea_1",
  "urea_2",
]);

export const fertilizerProduct = pgEnum("fertilizer_product", [
  "nps",
  "nps_zinc",
  "urea",
]);

export const skipReason = pgEnum("skip_reason", [
  "unavailable",
  "unaffordable",
  "forgot",
  "other",
]);

export const operationType = pgEnum("operation_type", [
  "plowing",
  "weeding",
  "spraying",
  "irrigation",
]);

export const irrigationMethod = pgEnum("irrigation_method", [
  "flood",
  "furrow",
  "drip",
  "bucket",
  "other",
]);

export const quantityUnit = pgEnum("quantity_unit", ["quintal", "kg"]);

export const ledgerCategory = pgEnum("ledger_category", [
  "input_cost",
  "machinery_oxen_rental",
  "labor",
  "harvest_revenue",
  "other",
]);

export const yieldAnalysisStatus = pgEnum("yield_analysis_status", [
  "completed",
  "insufficient_data",
  "failed",
  "top_quartile",
]);

export const weatherAlertType = pgEnum("weather_alert_type", [
  "frost",
  "downpour",
  "dry_spell",
]);

export const mediaKind = pgEnum("media_kind", ["audio", "image", "document"]);

export const mediaStatus = pgEnum("media_status", [
  "pending",
  "uploading",
  "uploaded",
  "verified",
  "failed",
]);

export const jobStatus = pgEnum("job_status", [
  "queued",
  "processing",
  "completed",
  "failed",
]);

export const diagnosisSeverity = pgEnum("diagnosis_severity", ["low", "moderate", "high"]);

export const diagnosisReviewStatus = pgEnum("diagnosis_review_status", [
  "none",
  "pending_da_review",
  "reviewed",
]);

export const grievanceCategory = pgEnum("grievance_category", [
  "input_shortage",
  "pest_outbreak",
  "water_conflict",
  "adulterated_inputs",
]);

export const grievanceStatus = pgEnum("grievance_status", [
  "submitted",
  "received",
  "assigned",
  "in_progress",
  "resolved",
  "rejected",
  "reopened",
]);

export const grievancePriority = pgEnum("grievance_priority", [
  "low",
  "normal",
  "high",
  "urgent",
]);

export const messageKind = pgEnum("message_kind", ["text", "audio"]);

export const taskType = pgEnum("task_type", [
  "field_visit",
  "diagnosis_review",
  "grievance",
  "other",
]);

export const taskStatus = pgEnum("task_status", [
  "open",
  "in_progress",
  "done",
  "cancelled",
]);

export const surveyStatus = pgEnum("survey_status", ["draft", "verified", "superseded"]);

export const moderationStatus = pgEnum("moderation_status", [
  "pending",
  "verified",
  "rejected",
  "flagged",
]);

export const stockItemType = pgEnum("stock_item_type", ["urea", "nps", "seed"]);

export const stockMovementType = pgEnum("stock_movement_type", [
  "receipt",
  "issue",
  "adjustment",
]);

export const announcementType = pgEnum("announcement_type", [
  "seasonal_advice",
  "input_availability",
  "emergency",
]);

export const announcementStatus = pgEnum("announcement_status", [
  "draft",
  "published",
  "recalled",
]);

export const deliveryChannel = pgEnum("delivery_channel", ["app", "sms"]);

export const deliveryStatus = pgEnum("delivery_status", [
  "queued",
  "sent",
  "delivered",
  "failed",
]);

export const syncOperation = pgEnum("sync_operation", ["insert", "update", "delete"]);

export const syncMutationStatus = pgEnum("sync_mutation_status", [
  "applied",
  "rejected",
  "duplicate",
]);
