import { sql } from "drizzle-orm";
import { pgTable, uuid, varchar, timestamp, boolean, jsonb, numeric, integer, check, uniqueIndex, index } from "drizzle-orm/pg-core";
import { customType } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/_relations";
import { appLanguage } from "./enums.js";

export const geographyMultiPolygon = customType<{ data: string; driverData: string }>({
  dataType() {
    return "geography(MultiPolygon, 4326)";
  },
});

export const geographyPoint = customType<{ data: string; driverData: string }>({
  dataType() {
    return "geography(Point, 4326)";
  },
});

export const cityOffices = pgTable(
  "city_offices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 120 }).notNull().unique(),
    jurisdiction: geographyMultiPolygon("jurisdiction"),
    defaultLanguage: appLanguage("default_language").notNull().default("am"),
    parameters: jsonb("parameters").notNull().default({}),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    parametersCheck: check(
      "city_offices_parameters_check",
      sql`jsonb_typeof(parameters) = 'object'`
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
    boundary: geographyMultiPolygon("boundary"),
    centroidLatitude: numeric("centroid_latitude", { precision: 9, scale: 6 }),
    centroidLongitude: numeric("centroid_longitude", { precision: 9, scale: 6 }),
    radiusMeters: integer("radius_meters"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    territoryCheck: check(
      "kebeles_territory_check",
      sql`boundary is not null or (centroid_latitude is not null and centroid_longitude is not null and radius_meters > 0)`
    ),
    uqKebelesNameActive: uniqueIndex("uq_kebeles_name_active")
      .on(table.cityOfficeId, sql`lower(name)`)
      .where(sql`deleted_at is null`),
    idxKebelesOffice: index("idx_kebeles_office").on(table.cityOfficeId),
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
