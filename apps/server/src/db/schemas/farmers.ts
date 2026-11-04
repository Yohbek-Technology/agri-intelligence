import { pgTable, uuid, varchar, timestamp, boolean, check, index, unique, numeric, integer, smallint, char, bigint, text, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/_relations";
import { sql } from "drizzle-orm";
import { cities, kebeles, geographyPoint, geographyPolygon } from "./tenancy.js";
import { users } from "./auth-schema.js";
import { approvalStatus, landUnit, agroZone, soilType } from "./enums.js";

export const fieldAgents = pgTable("field_agents", {
  agent_id: uuid("agent_id").primaryKey().defaultRandom(),
  user_id: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id),
  city_id: uuid("city_id")
    .notNull()
    .references(() => cities.city_id),
  specialization: varchar("specialization", { length: 100 }),
  max_farmers: smallint("max_farmers").notNull().default(50),
  is_active: boolean("is_active").notNull().default(true),
});

export const farmers = pgTable(
  "farmers",
  {
    farmer_id: uuid("farmer_id").primaryKey().defaultRandom(),
    user_id: uuid("user_id").unique().references(() => users.id),
    city_id: uuid("city_id")
      .notNull()
      .references(() => cities.city_id),
    kebele_id: uuid("kebele_id")
      .notNull()
      .references(() => kebeles.kebele_id),
    agent_id: uuid("agent_id").references(() => fieldAgents.agent_id),
    local_id_number: varchar("local_id_number", { length: 50 }),
    full_name: varchar("full_name", { length: 150 }).notNull(),
    phone_number: varchar("phone_number", { length: 20 }),
    gender: char("gender", { length: 1 }),
    literacy_level: varchar("literacy_level", { length: 10 }),
    status: approvalStatus("status").notNull().default("PENDING"),
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
    deleted_at: timestamp("deleted_at", { withTimezone: true }),
    sync_version: bigint("sync_version", { mode: "number" }).notNull().default(0),
  },
  (table) => ({
    uqCityLocalId: unique("farmers_city_id_local_id_number_key").on(table.city_id, table.local_id_number),
    genderCheck: check("farmers_gender_check", sql`gender in ('M','F')`),
    literacyCheck: check("farmers_literacy_check", sql`literacy_level in ('NONE','BASIC','FULL')`),
    idxFarmersCityKebele: index("idx_farmers_city_kebele")
      .on(table.city_id, table.kebele_id)
      .where(sql`deleted_at is null`),
    idxFarmersAgent: index("idx_farmers_agent").on(table.agent_id),
  })
);

export const devices = pgTable("devices", {
  device_id: uuid("device_id").primaryKey().defaultRandom(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id),
  push_token: text("push_token"),
  is_shared_device: boolean("is_shared_device").notNull().default(false),
  last_sync_at: timestamp("last_sync_at", { withTimezone: true }),
  last_sync_cursor: bigint("last_sync_cursor", { mode: "number" }).notNull().default(0),
});

export const plots = pgTable(
  "plots",
  {
    plot_id: uuid("plot_id").primaryKey().defaultRandom(),
    farmer_id: uuid("farmer_id")
      .notNull()
      .references(() => farmers.farmer_id),
    city_id: uuid("city_id")
      .notNull()
      .references(() => cities.city_id),
    kebele_id: uuid("kebele_id")
      .notNull()
      .references(() => kebeles.kebele_id),
    plot_name: varchar("plot_name", { length: 100 }).notNull(),
    landmark: varchar("landmark", { length: 200 }),
    area_value: numeric("area_value", { precision: 10, scale: 3 }).notNull(),
    area_unit: landUnit("area_unit").notNull(),
    area_hectares: numeric("area_hectares", { precision: 10, scale: 4 }).notNull(),
    location: geographyPoint("location"),
    boundary: geographyPolygon("boundary"),
    gps_captured_at: timestamp("gps_captured_at", { withTimezone: true }),
    altitude_m: integer("altitude_m"),
    zone: agroZone("zone"),
    soil: soilType("soil").notNull(),
    drainage: varchar("drainage", { length: 10 }),
    rotation_plan: jsonb("rotation_plan"),
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
    deleted_at: timestamp("deleted_at", { withTimezone: true }),
    sync_version: bigint("sync_version", { mode: "number" }).notNull().default(0),
  },
  (table) => ({
    areaValueCheck: check("plots_area_value_check", sql`area_value > 0`),
    drainageCheck: check("plots_drainage_check", sql`drainage in ('POOR','MODERATE','GOOD','EXCESSIVE')`),
    idxPlotsBoundary: index("idx_plots_boundary").using("gist", table.boundary),
    idxPlotsFarmer: index("idx_plots_farmer").on(table.farmer_id).where(sql`deleted_at is null`),
    idxPlotsKebele: index("idx_plots_kebele").on(table.kebele_id),
    idxPlotsLocation: index("idx_plots_location").using("gist", table.location),
  })
);

export const fieldAgentsRelations = relations(fieldAgents, ({ one, many }) => ({
  user: one(users, {
    fields: [fieldAgents.user_id],
    references: [users.id],
  }),
  city: one(cities, {
    fields: [fieldAgents.city_id],
    references: [cities.city_id],
  }),
  farmers: many(farmers),
}));

export const farmersRelations = relations(farmers, ({ one, many }) => ({
  user: one(users, {
    fields: [farmers.user_id],
    references: [users.id],
  }),
  city: one(cities, {
    fields: [farmers.city_id],
    references: [cities.city_id],
  }),
  kebele: one(kebeles, {
    fields: [farmers.kebele_id],
    references: [kebeles.kebele_id],
  }),
  agent: one(fieldAgents, {
    fields: [farmers.agent_id],
    references: [fieldAgents.agent_id],
  }),
  plots: many(plots),
}));

export const devicesRelations = relations(devices, ({ one }) => ({
  user: one(users, {
    fields: [devices.user_id],
    references: [users.id],
  }),
}));

export const plotsRelations = relations(plots, ({ one }) => ({
  farmer: one(farmers, {
    fields: [plots.farmer_id],
    references: [farmers.farmer_id],
  }),
  city: one(cities, {
    fields: [plots.city_id],
    references: [cities.city_id],
  }),
  kebele: one(kebeles, {
    fields: [plots.kebele_id],
    references: [kebeles.kebele_id],
  }),
}));
