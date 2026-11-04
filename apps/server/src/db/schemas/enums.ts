import { pgEnum } from "drizzle-orm/pg-core";

// Version 2.0 DDL Enums
export const userRole = pgEnum("user_role", ["FARMER", "DA", "CITY_ADMIN", "SUPER_ADMIN"]);
export const languageCode = pgEnum("language_code", ["am", "om", "ti", "en"]);
export const approvalStatus = pgEnum("approval_status", ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"]);
export const agroZone = pgEnum("agro_zone", ["DEGA", "WEYNA_DEGA", "KOLLA"]);
export const soilType = pgEnum("soil_type", ["KOTICHA_VERTISOL", "BEDA_NITISOL", "SANDY", "CLAY", "LOAM"]);
export const landUnit = pgEnum("land_unit", ["TIMAD", "KERT", "HECTARE"]);
export const seasonType = pgEnum("season_type", ["MEHER", "BELG"]);
export const growthStage = pgEnum("growth_stage", [
  "LAND_PREPARATION",
  "PLANTING",
  "GROWING",
  "FLOWERING",
  "GRAIN_FILLING",
  "HARVEST",
]);
export const fertilizerKind = pgEnum("fertilizer_kind", ["UREA", "NPS", "DAP", "COMPOST"]);
export const fertilizerStage = pgEnum("fertilizer_stage", ["BASAL", "UREA_FIRST", "UREA_SECOND", "OTHER"]);
export const activityType = pgEnum("activity_type", ["PLOWING", "WEEDING", "SPRAYING", "IRRIGATION"]);
export const txnCategory = pgEnum("txn_category", [
  "SEED",
  "FERTILIZER",
  "LABOR",
  "EQUIPMENT_RENTAL",
  "OTHER_EXPENSE",
  "CROP_SALE",
]);
export const weightUnit = pgEnum("weight_unit", ["KG", "QUINTAL"]);
export const severityLevel = pgEnum("severity_level", ["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
export const grievanceCategory = pgEnum("grievance_category", [
  "FERTILIZER_SHORTAGE",
  "SEED_SHORTAGE",
  "PEST_OUTBREAK",
  "WATER_CONFLICT",
  "ADULTERATED_INPUT",
  "OTHER",
]);
export const grievanceStatus = pgEnum("grievance_status", [
  "SUBMITTED",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
  "REJECTED",
]);
export const channelType = pgEnum("channel_type", ["APP_NEWSFEED", "SMS", "PUSH"]);
export const deliveryStatus = pgEnum("delivery_status", ["QUEUED", "SENT", "DELIVERED", "FAILED"]);
export const syncOpType = pgEnum("sync_op_type", ["INSERT", "UPDATE", "DELETE"]);
export const syncStatus = pgEnum("sync_status", ["PENDING", "APPLIED", "CONFLICT", "FAILED"]);


