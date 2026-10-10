import { pgTable, uuid, varchar, timestamp, date, boolean, check, index, unique, uniqueIndex, numeric, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/_relations";
import { sql } from "drizzle-orm";
import { cityOffices } from "./tenancy.js";
import { farmers } from "./farmers.js";
import { crops } from "./catalog.js";
import { users } from "./auth-schema.js";
import { quantityUnit, surveyStatus, moderationStatus } from "./enums.js";

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

export const marketSurveys: ReturnType<typeof pgTable> = pgTable(
  "market_surveys",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cityOfficeId: uuid("city_office_id")
      .notNull()
      .references(() => cityOffices.id),
    marketCentreId: uuid("market_centre_id")
      .notNull()
      .references(() => marketCentres.id),
    cropId: uuid("crop_id")
      .notNull()
      .references(() => crops.id),
    surveyDate: date("survey_date").notNull(),
    enteredUnit: quantityUnit("entered_unit").notNull(),
    minPriceEtbPerKg: numeric("min_price_etb_per_kg", { precision: 10, scale: 2 }).notNull(),
    avgPriceEtbPerKg: numeric("avg_price_etb_per_kg", { precision: 10, scale: 2 }).notNull(),
    maxPriceEtbPerKg: numeric("max_price_etb_per_kg", { precision: 10, scale: 2 }).notNull(),
    enumeratorUserId: uuid("enumerator_user_id").notNull().references(() => users.id),
    status: surveyStatus("status").notNull().default("draft"),
    version: integer("version").notNull().default(1),
    supersedesId: uuid("supersedes_id").references(() => marketSurveys.id),
    verifiedByUserId: uuid("verified_by_user_id").references(() => users.id),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    surveyDateCheck: check("market_surveys_date_check", sql`survey_date <= current_date`),
    pricesCheck: check(
      "market_surveys_prices_check",
      sql`
        min_price_etb_per_kg > 0
        and min_price_etb_per_kg <= avg_price_etb_per_kg
        and avg_price_etb_per_kg <= max_price_etb_per_kg
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
    createdByUserId: uuid("created_by_user_id").references(() => users.id),
    cropId: uuid("crop_id")
      .notNull()
      .references(() => crops.id),
    marketCentreId: uuid("market_centre_id")
      .notNull()
      .references(() => marketCentres.id),
    enteredPrice: numeric("entered_price", { precision: 10, scale: 2 }).notNull(),
    enteredUnit: quantityUnit("entered_unit").notNull(),
    priceEtbPerKg: numeric("price_etb_per_kg", { precision: 10, scale: 2 }).notNull(),
    volumeKg: numeric("volume_kg", { precision: 12, scale: 3 }).notNull(),
    saleDate: date("sale_date").notNull(),
    moderationStatus: moderationStatus("moderation_status").notNull().default("pending"),
    outlierFlag: boolean("outlier_flag").notNull().default(false),
    rejectionReason: varchar("rejection_reason", { length: 255 }),
    moderatedByUserId: uuid("moderated_by_user_id").references(() => users.id),
    moderatedAt: timestamp("moderated_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    pricesCheck: check(
      "crowd_transactions_prices_check",
      sql`
        entered_price > 0 
        and price_etb_per_kg > 0 
        and volume_kg > 0
      `
    ),
    saleDateCheck: check(
      "crowd_transactions_date_check",
      sql`sale_date <= current_date and sale_date >= current_date - 30`
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
  crop: one(crops, {
    fields: [marketSurveys.cropId],
    references: [crops.id],
  }),
  enumeratorUser: one(users, {
    fields: [marketSurveys.enumeratorUserId],
    references: [users.id],
  }),
  supersedes: one(marketSurveys, {
    fields: [marketSurveys.supersedesId],
    references: [marketSurveys.id],
  }),
  verifiedByUser: one(users, {
    fields: [marketSurveys.verifiedByUserId],
    references: [users.id],
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
  crop: one(crops, {
    fields: [crowdTransactions.cropId],
    references: [crops.id],
  }),
  marketCentre: one(marketCentres, {
    fields: [crowdTransactions.marketCentreId],
    references: [marketCentres.id],
  }),
  createdByUser: one(users, {
    fields: [crowdTransactions.createdByUserId],
    references: [users.id],
  }),
  moderatedByUser: one(users, {
    fields: [crowdTransactions.moderatedByUserId],
    references: [users.id],
  }),
}));
