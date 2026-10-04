import { pgTable, uuid, varchar, timestamp, boolean, jsonb, numeric, integer, check } from "drizzle-orm/pg-core";
import { customType } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/_relations";
import { appLanguage } from "./enums.js";

export const geography = customType<{ data: string; driverData: string }>({
  dataType() {
    return "geography";
  },
});

export const cityOffices = pgTable(
  "city_offices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 120 }).notNull().unique(),
    jurisdiction: geography("jurisdiction(MultiPolygon, 4326)"),
    defaultLanguage: appLanguage("default_language").notNull().default("am"),
    parameters: jsonb("parameters").notNull().default({}),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    parametersCheck: check(
      "city_offices_parameters_check",
      "jsonb_typeof(parameters) = 'object'"
    ),
  })
);

export const kebeles = pgTable(
  "kebeles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cityOfficeId: uuid("city_office_id")
      .notNull()
      .references(() => cityOffices.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 120 }).notNull(),
    boundary: geography("boundary(MultiPolygon, 4326)"),
    centroidLat: numeric("centroid_lat", { precision: 9, scale: 6 }),
    centroidLng: numeric("centroid_lng", { precision: 9, scale: 6 }),
    radiusM: integer("radius_m"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    territoryCheck: check(
      "kebeles_territory_check",
      "boundary is not null or (centroid_lat is not null and centroid_lng is not null and radius_m > 0)"
    ),
  })
);

export const cityOfficesRelations = relations(cityOffices, ({ many }) => ({
  kebeles: many(kebeles),
}));

export const kebelesRelations = relations(kebeles, ({ one }) => ({
  cityOffice: one(cityOffices, {
    fields: [kebeles.cityOfficeId],
    references: [cityOffices.id],
  }),
}));
