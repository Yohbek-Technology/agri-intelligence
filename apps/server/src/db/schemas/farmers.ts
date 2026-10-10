import { pgTable, uuid, varchar, timestamp, boolean, check, index, uniqueIndex, numeric, integer, smallint } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/_relations";
import { sql } from "drizzle-orm";
import { cityOffices, kebeles, geographyPoint } from "./tenancy.js";
import { users } from "./auth-schema.js";
import { appLanguage, areaUnit, agroZone, soilClass, drainageClass, plotStatus } from "./enums.js";

export const farmers = pgTable(
  "farmers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cityOfficeId: uuid("city_office_id")
      .notNull()
      .references(() => cityOffices.id),
    userId: uuid("user_id").unique().references(() => users.id, { onDelete: "set null" }),
    fullName: varchar("full_name", { length: 120 }).notNull(),
    phoneNumber: varchar("phone_number", { length: 20 }),
    hasNoPhone: boolean("has_no_phone").notNull().default(false),
    localIdNumber: varchar("local_id_number", { length: 40 }).notNull(),
    kebeleId: uuid("kebele_id")
      .notNull()
      .references(() => kebeles.id),
    assignedDaUserId: uuid("assigned_da_user_id").references(() => users.id),
    registeredByUserId: uuid("registered_by_user_id").references(() => users.id),
    preferredLanguage: appLanguage("preferred_language").notNull().default("am"),
    isVerified: boolean("is_verified").notNull().default(false),
    consentAgreed: boolean("consent_agreed").notNull().default(true),
    consentAgreedAt: timestamp("consent_agreed_at", { withTimezone: true }).defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    fullNameCheck: check(
      "farmers_full_name_check",
      sql`full_name = btrim(full_name) and char_length(full_name) between 2 and 120`
    ),
    noPhoneCheck: check(
      "farmers_has_no_phone_check",
      sql`has_no_phone = (phone_number is null)`
    ),
    phoneFormatCheck: check(
      "farmers_phone_format_check",
      sql`phone_number is null or phone_number ~ '^\\+251[79][0-9]{8}$'`
    ),
    consentCheck: check(
      "farmers_consent_check",
      sql`not consent_agreed or consent_agreed_at is not null`
    ),
    uqPhoneActive: uniqueIndex("uq_farmers_phone_active")
      .on(table.phoneNumber)
      .where(sql`deleted_at is null and phone_number is not null`),
    uqLocalIdActive: uniqueIndex("uq_farmers_local_id_active")
      .on(table.cityOfficeId, table.localIdNumber)
      .where(sql`deleted_at is null`),
    idxOfficeVerified: index("idx_farmers_office_verified")
      .on(table.cityOfficeId, table.isVerified)
      .where(sql`deleted_at is null`),
    idxDa: index("idx_farmers_da")
      .on(table.assignedDaUserId)
      .where(sql`deleted_at is null`),
    idxKebele: index("idx_farmers_kebele").on(table.kebeleId),
    idxNameFts: index("idx_farmers_name_fts")
      .using("gin", sql`to_tsvector('simple', full_name)`),
  })
);

export const plots = pgTable(
  "plots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cityOfficeId: uuid("city_office_id")
      .notNull()
      .references(() => cityOffices.id),
    farmerId: uuid("farmer_id")
      .notNull()
      .references(() => farmers.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 60 }).notNull(),
    areaValue: numeric("area_value", { precision: 10, scale: 3 }).notNull(),
    areaUnit: areaUnit("area_unit").notNull(),
    hectaresPerUnitApplied: numeric("hectares_per_unit_applied", { precision: 10, scale: 6 }).notNull(),
    areaHectares: numeric("area_hectares", { precision: 10, scale: 4 }).generatedAlwaysAs(
      sql`round(area_value * hectares_per_unit_applied, 4)`
    ),
    centroidLatitude: numeric("centroid_latitude", { precision: 9, scale: 6 }).notNull(),
    centroidLongitude: numeric("centroid_longitude", { precision: 9, scale: 6 }).notNull(),
    centroidGeom: geographyPoint("centroid_geom").generatedAlwaysAs(
      sql`st_setsrid(st_makepoint(centroid_longitude, centroid_latitude), 4326)::geography`
    ),
    gpsAccuracyMeters: numeric("gps_accuracy_meters", { precision: 6, scale: 1 }).notNull(),
    weatherGridLatitude: numeric("weather_grid_latitude", { precision: 5, scale: 1 }).generatedAlwaysAs(
      sql`round(centroid_latitude, 1)`
    ),
    weatherGridLongitude: numeric("weather_grid_longitude", { precision: 5, scale: 1 }).generatedAlwaysAs(
      sql`round(centroid_longitude, 1)`
    ),
    elevationMeters: integer("elevation_meters").notNull(),
    agroZoneDerived: agroZone("agro_zone_derived").notNull(),
    agroZone: agroZone("agro_zone").notNull(),
    agroZoneOverrideReason: varchar("agro_zone_override_reason", { length: 255 }),
    kebeleId: uuid("kebele_id").references(() => kebeles.id),
    soilClass: soilClass("soil_class"),
    drainage: drainageClass("drainage"),
    plannedCropId: uuid("planned_crop_id"),
    plannedSeasonYear: smallint("planned_season_year"),
    status: plotStatus("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    areaCheck: check("plots_area_check", sql`area_value > 0 and area_value <= 1000`),
    conversionFactorCheck: check("plots_conversion_check", sql`hectares_per_unit_applied > 0`),
    coordsCheck: check(
      "plots_coords_check",
      sql`centroid_latitude between -90 and 90 and centroid_longitude between -180 and 180`
    ),
    elevationCheck: check("plots_elevation_check", sql`elevation_meters between 0 and 4500`),
    agroZoneCheck: check(
      "plots_agro_zone_check",
      sql`agro_zone = agro_zone_derived or agro_zone_override_reason is not null`
    ),
    plannedCropCheck: check(
      "plots_planned_crop_check",
      sql`(planned_crop_id is null) = (planned_season_year is null)`
    ),
    plannedYearCheck: check(
      "plots_planned_year_check",
      sql`planned_season_year is null or planned_season_year between 2000 and 2100`
    ),
    uqNameActive: uniqueIndex("uq_plots_name_active")
      .on(table.farmerId, sql`lower(name)`)
      .where(sql`deleted_at is null`),
    idxFarmer: index("idx_plots_farmer")
      .on(table.farmerId)
      .where(sql`deleted_at is null`),
    idxOfficeKebele: index("idx_plots_office_kebele")
      .on(table.cityOfficeId, table.kebeleId)
      .where(sql`deleted_at is null`),
    idxCentroid: index("idx_plots_centroid")
      .using("gist", table.centroidGeom),
    idxWeatherGrid: index("idx_plots_weather_grid")
      .on(table.weatherGridLatitude, table.weatherGridLongitude),
    idxSoilZone: index("idx_plots_soil_zone")
      .on(table.cityOfficeId, table.soilClass, table.agroZone)
      .where(sql`deleted_at is null`),
    idxPlannedCrop: index("idx_plots_planned_crop")
      .on(table.cityOfficeId, table.plannedCropId)
      .where(sql`deleted_at is null and planned_crop_id is not null`),
  })
);

export const plotCropHistory = pgTable(
  "plot_crop_history",
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
    seasonYear: smallint("season_year").notNull(),
    cropId: uuid("crop_id"),
    fallow: boolean("fallow").notNull().default(false),
    createdByUserId: uuid("created_by_user_id").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    uqSeason: uniqueIndex("uq_plot_crop_history_season").on(table.plotId, table.seasonYear),
    seasonCheck: check("plot_crop_history_season_check", sql`season_year between 2000 and 2100`),
    fallowCheck: check(
      "plot_crop_history_fallow_check",
      sql`fallow = (crop_id is null)`
    ),
  })
);

export const farmersRelations = relations(farmers, ({ one, many }) => ({
  cityOffice: one(cityOffices, {
    fields: [farmers.cityOfficeId],
    references: [cityOffices.id],
  }),
  kebele: one(kebeles, {
    fields: [farmers.kebeleId],
    references: [kebeles.id],
  }),
  user: one(users, {
    fields: [farmers.userId],
    references: [users.id],
  }),
  assignedDa: one(users, {
    fields: [farmers.assignedDaUserId],
    references: [users.id],
  }),
  plots: many(plots),
  plotCropHistory: many(plotCropHistory),
}));

export const plotsRelations = relations(plots, ({ one, many }) => ({
  cityOffice: one(cityOffices, {
    fields: [plots.cityOfficeId],
    references: [cityOffices.id],
  }),
  farmer: one(farmers, {
    fields: [plots.farmerId],
    references: [farmers.id],
  }),
  kebele: one(kebeles, {
    fields: [plots.kebeleId],
    references: [kebeles.id],
  }),
  plotCropHistory: many(plotCropHistory),
}));

export const plotCropHistoryRelations = relations(plotCropHistory, ({ one }) => ({
  cityOffice: one(cityOffices, {
    fields: [plotCropHistory.cityOfficeId],
    references: [cityOffices.id],
  }),
  farmer: one(farmers, {
    fields: [plotCropHistory.farmerId],
    references: [farmers.id],
  }),
  plot: one(plots, {
    fields: [plotCropHistory.plotId],
    references: [plots.id],
  }),
}));
