import { pgTable, uuid, varchar, timestamp, date, boolean, check, index, unique, uniqueIndex } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { cityOffices } from "./tenancy.js";
import { farmers } from "./farmers.js";
import { quantityUnit, surveyStatus, moderationStatus } from "./enums.js";

// ============================================================
// MARKET CENTRES
// ============================================================

export const marketCentres = pgTable(
  "market_centres",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    
    cityOfficeId: uuid("city_office_id")
      .notNull()
      .references(() => cityOffices.id, { onDelete: "cascade" }),
    
    name: varchar("name", { length: 80 }).notNull(),
    isHome: boolean("is_home").notNull().default(false),
    
    isActive: boolean("is_active").notNull().default(true),
    
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    uqName: unique("market_centres_office_name_key").on(table.cityOfficeId, table.name),
    uqOneHome: uniqueIndex("uq_market_centres_one_home")
      .on(table.cityOfficeId)
      .where(sql`is_home`),
  })
);

// ============================================================
// MARKET SURVEYS (SURV-1 to SURV-7)
// ============================================================

export const marketSurveys = pgTable(
  "market_surveys",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    
    cityOfficeId: uuid("city_office_id")
      .notNull()
      .references(() => cityOffices.id),
    marketCentreId: uuid("market_centre_id")
      .notNull()
      .references(() => marketCentres.id),
    cropId: uuid("crop_id").notNull(), // references crops.id - set in index.ts
    
    surveyDate: date("survey_date").notNull(),
    enteredUnit: quantityUnit("entered_unit").notNull(),
    
    minPriceEtbPerKg: varchar("min_price_etb_per_kg").notNull(), // numeric(10,2)
    avgPriceEtbPerKg: varchar("avg_price_etb_per_kg").notNull(), // numeric(10,2)
    maxPriceEtbPerKg: varchar("max_price_etb_per_kg").notNull(), // numeric(10,2)
    
    enumeratorUserId: uuid("enumerator_user_id").notNull(), // references users.id
    
    status: surveyStatus("status").notNull().default("draft"),
    version: varchar("version").notNull().default("1"), // integer
    supersedesId: uuid("supersedes_id").references(() => marketSurveys.id),
    
    verifiedBy: uuid("verified_by"), // references users.id
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    pricesCheck: check(
      "market_surveys_prices_check",
      sql`
        min_price_etb_per_kg::numeric > 0
        and min_price_etb_per_kg::numeric <= avg_price_etb_per_kg::numeric
        and avg_price_etb_per_kg::numeric <= max_price_etb_per_kg::numeric
      `
    ),
    verifiedCheck: check(
      "market_surveys_verified_check",
      sql`status <> 'verified' or verified_at is not null`
    ),
    uqCurrent: uniqueIndex("uq_market_surveys_current")
      .on(table.marketCentreId, table.cropId, table.surveyDate)
      .where(sql`status <> 'superseded'`),
    idxLookup: index("idx_surveys_lookup")
      .on(table.cityOfficeId, table.cropId, table.marketCentreId, table.surveyDate)
      .where(sql`status = 'verified'`),
  })
);

// ============================================================
// CROWD-SOURCED SALES (MKT-2, MKT-3, SURV-4)
// ============================================================

export const crowdTransactions = pgTable(
  "crowd_transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    
    cityOfficeId: uuid("city_office_id")
      .notNull()
      .references(() => cityOffices.id),
    farmerId: uuid("farmer_id")
      .notNull()
      .references(() => farmers.id),
    createdByUserId: uuid("created_by_user_id"), // references users.id
    
    cropId: uuid("crop_id").notNull(), // references crops.id - set in index.ts
    marketCentreId: uuid("market_centre_id")
      .notNull()
      .references(() => marketCentres.id),
    
    enteredPrice: varchar("entered_price").notNull(), // numeric(10,2)
    enteredUnit: quantityUnit("entered_unit").notNull(),
    priceEtbPerKg: varchar("price_etb_per_kg").notNull(), // numeric(10,2)
    volumeKg: varchar("volume_kg").notNull(), // numeric(12,3)
    saleDate: date("sale_date").notNull(),
    
    moderationStatus: moderationStatus("moderation_status").notNull().default("pending"),
    outlierFlag: boolean("outlier_flag").notNull().default(false),
    rejectionReason: varchar("rejection_reason", { length: 255 }),
    moderatedBy: uuid("moderated_by"), // references users.id
    moderatedAt: timestamp("moderated_at", { withTimezone: true }),
    
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    pricesCheck: check(
      "crowd_transactions_prices_check",
      sql`
        entered_price::numeric > 0 
        and price_etb_per_kg::numeric > 0 
        and volume_kg::numeric > 0
      `
    ),
    rejectionCheck: check(
      "crowd_transactions_rejection_check",
      sql`moderation_status <> 'rejected' or rejection_reason is not null`
    ),
    idxModeration: index("idx_crowd_moderation")
      .on(table.cityOfficeId, table.moderationStatus, table.createdAt)
      .where(sql`deleted_at is null`),
    idxPriceWindow: index("idx_crowd_price_window")
      .on(table.cropId, table.marketCentreId, table.saleDate)
      .where(sql`moderation_status = 'verified'`),
  })
);

// ============================================================
// RELATIONS
// ============================================================

export const marketCentresRelations = relations(marketCentres, ({ one, many }) => ({
  cityOffice: one(cityOffices, {
    fields: [marketCentres.cityOfficeId],
    references: [cityOffices.id],
  }),
  surveys: many(marketSurveys),
  crowdTransactions: many(crowdTransactions),
}));

export const marketSurveysRelations = relations(marketSurveys, ({ one }) => ({
  cityOffice: one(cityOffices, {
    fields: [marketSurveys.cityOfficeId],
    references: [cityOffices.id],
  }),
  marketCentre: one(marketCentres, {
    fields: [marketSurveys.marketCentreId],
    references: [marketCentres.id],
  }),
  supersedes: one(marketSurveys, {
    fields: [marketSurveys.supersedesId],
    references: [marketSurveys.id],
  }),
}));

export const crowdTransactionsRelations = relations(crowdTransactions, ({ one }) => ({
  cityOffice: one(cityOffices, {
    fields: [crowdTransactions.cityOfficeId],
    references: [cityOffices.id],
  }),
  farmer: one(farmers, {
    fields: [crowdTransactions.farmerId],
    references: [farmers.id],
  }),
  marketCentre: one(marketCentres, {
    fields: [crowdTransactions.marketCentreId],
    references: [marketCentres.id],
  }),
}));
