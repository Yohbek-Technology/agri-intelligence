import { pgTable, uuid, varchar, timestamp, boolean, unique } from "drizzle-orm/pg-core";
import { customType } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/_relations";

export const geographyPoint = customType<{ data: string; driverData: string }>({
  dataType() {
    return "geography(Point, 4326)";
  },
});

export const geographyPolygon = customType<{ data: string; driverData: string }>({
  dataType() {
    return "geography(Polygon, 4326)";
  },
});

export const geographyMultiPolygon = customType<{ data: string; driverData: string }>({
  dataType() {
    return "geography(MultiPolygon, 4326)";
  },
});

export const cities = pgTable("cities", {
  city_id: uuid("city_id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  region: varchar("region", { length: 100 }).notNull(),
  center_point: geographyPoint("center_point"),
  sms_sender_id: varchar("sms_sender_id", { length: 20 }),
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const kebeles = pgTable(
  "kebeles",
  {
    kebele_id: uuid("kebele_id").primaryKey().defaultRandom(),
    city_id: uuid("city_id")
      .notNull()
      .references(() => cities.city_id),
    name: varchar("name", { length: 100 }).notNull(),
    boundary: geographyMultiPolygon("boundary"),
    center_point: geographyPoint("center_point"),
  },
  (table) => ({
    uqCityName: unique("kebeles_city_id_name_key").on(table.city_id, table.name),
  })
);

export const citiesRelations = relations(cities, ({ many }) => ({
  kebeles: many(kebeles),
}));

export const kebelesRelations = relations(kebeles, ({ one }) => ({
  city: one(cities, {
    fields: [kebeles.city_id],
    references: [cities.city_id],
  }),
}));


