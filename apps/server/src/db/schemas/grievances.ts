import { pgTable, uuid, text, timestamp, boolean, index, bigint, varchar, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/_relations";
import { cities, kebeles, geographyPoint } from "./tenancy.js";
import { farmers, plots, fieldAgents } from "./farmers.js";
import { users } from "./auth-schema.js";
import { pestsDiseases } from "./catalog.js";
import {
  grievanceCategory,
  grievanceStatus,
  languageCode,
  severityLevel,
} from "./enums.js";

export const grievances = pgTable(
  "grievances",
  {
    grievance_id: uuid("grievance_id").primaryKey().defaultRandom(),
    farmer_id: uuid("farmer_id")
      .notNull()
      .references(() => farmers.farmer_id),
    city_id: uuid("city_id")
      .notNull()
      .references(() => cities.city_id),
    kebele_id: uuid("kebele_id").references(() => kebeles.kebele_id),
    plot_id: uuid("plot_id").references(() => plots.plot_id),
    category: grievanceCategory("category").notNull(),
    pest_id: uuid("pest_id").references(() => pestsDiseases.pest_id),
    description_text: text("description_text"),
    audio_url: text("audio_url"),
    audio_public_id: varchar("audio_public_id", { length: 255 }),
    audio_duration_sec: integer("audio_duration_sec"),
    audio_format: varchar("audio_format", { length: 10 }),
    audio_language: languageCode("audio_language"),
    location: geographyPoint("location"),
    severity: severityLevel("severity"),
    status: grievanceStatus("status").notNull().default("SUBMITTED"),
    assigned_to: uuid("assigned_to").references(() => fieldAgents.agent_id),
    assigned_at: timestamp("assigned_at", { withTimezone: true }),
    resolved_at: timestamp("resolved_at", { withTimezone: true }),
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
    deleted_at: timestamp("deleted_at", { withTimezone: true }),
    sync_version: bigint("sync_version", { mode: "number" }).notNull().default(0),
  },
  (table) => ({
    idxGrievCityStatus: index("idx_griev_city_status").on(table.city_id, table.status, table.created_at.desc()),
    idxGrievAssignee: index("idx_griev_assignee").on(table.assigned_to, table.status),
  })
);

export const grievanceResponses = pgTable("grievance_responses", {
  response_id: uuid("response_id").primaryKey().defaultRandom(),
  grievance_id: uuid("grievance_id")
    .notNull()
    .references(() => grievances.grievance_id),
  responder_id: uuid("responder_id")
    .notNull()
    .references(() => users.id),
  new_status: grievanceStatus("new_status"),
  message_text: text("message_text"),
  audio_url: text("audio_url"),
  audio_public_id: varchar("audio_public_id", { length: 255 }),
  audio_duration_sec: integer("audio_duration_sec"),
  is_read_by_farmer: boolean("is_read_by_farmer").notNull().default(false),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const grievancesRelations = relations(grievances, ({ one, many }) => ({
  farmer: one(farmers, {
    fields: [grievances.farmer_id],
    references: [farmers.farmer_id],
  }),
  city: one(cities, {
    fields: [grievances.city_id],
    references: [cities.city_id],
  }),
  kebele: one(kebeles, {
    fields: [grievances.kebele_id],
    references: [kebeles.kebele_id],
  }),
  plot: one(plots, {
    fields: [grievances.plot_id],
    references: [plots.plot_id],
  }),
  pest: one(pestsDiseases, {
    fields: [grievances.pest_id],
    references: [pestsDiseases.pest_id],
  }),
  assignee: one(fieldAgents, {
    fields: [grievances.assigned_to],
    references: [fieldAgents.agent_id],
  }),
  responses: many(grievanceResponses),
}));

export const grievanceResponsesRelations = relations(grievanceResponses, ({ one }) => ({
  grievance: one(grievances, {
    fields: [grievanceResponses.grievance_id],
    references: [grievances.grievance_id],
  }),
  responder: one(users, {
    fields: [grievanceResponses.responder_id],
    references: [users.id],
  }),
}));
