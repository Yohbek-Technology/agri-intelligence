import { pgTable, uuid, varchar, timestamp, bigint, bigserial, jsonb, check, index, integer, text } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/_relations";
import { sql } from "drizzle-orm";
import { users } from "./auth-schema.js";
import { devices, farmers } from "./farmers.js";
import { syncOpType, syncStatus } from "./enums.js";

export const syncQueue = pgTable(
  "sync_queue",
  {
    op_id: uuid("op_id").primaryKey(),
    batch_id: uuid("batch_id").notNull(),
    device_id: uuid("device_id")
      .notNull()
      .references(() => devices.device_id),
    user_id: uuid("user_id")
      .notNull()
      .references(() => users.id),
    on_behalf_of_farmer_id: uuid("on_behalf_of_farmer_id").references(() => farmers.farmer_id),
    seq_no: integer("seq_no").notNull(),
    table_name: varchar("table_name", { length: 60 }).notNull(),
    record_id: uuid("record_id").notNull(),
    op_type: syncOpType("op_type").notNull(),
    payload: jsonb("payload"),
    base_version: bigint("base_version", { mode: "number" }),
    client_ts: timestamp("client_ts", { withTimezone: true }).notNull(),
    status: syncStatus("status").notNull().default("PENDING"),
    server_value: jsonb("server_value"),
    resolution: varchar("resolution", { length: 12 }),
    error_message: text("error_message"),
    received_at: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    resolutionCheck: check(
      "sync_queue_resolution_check",
      sql`resolution is null or resolution in ('SERVER_WINS','CLIENT_WINS','MERGED','MANUAL')`
    ),
    idxSyncqBatch: index("idx_syncq_batch").on(table.batch_id, table.seq_no),
  })
);

export const syncChangeLog = pgTable(
  "sync_change_log",
  {
    change_id: bigserial("change_id", { mode: "number" }).primaryKey(),
    table_name: varchar("table_name", { length: 60 }).notNull(),
    record_id: uuid("record_id").notNull(),
    op_type: syncOpType("op_type").notNull(),
    city_id: uuid("city_id"),
    farmer_id: uuid("farmer_id"),
    changed_at: timestamp("changed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    idxChangelogScope: index("idx_changelog_scope").on(table.city_id, table.change_id),
  })
);

export const auditLogs = pgTable("audit_logs", {
  audit_log_id: bigserial("audit_log_id", { mode: "number" }).primaryKey(),
  user_id: uuid("user_id").references(() => users.id),
  city_id: uuid("city_id"),
  action: varchar("action", { length: 60 }).notNull(),
  entity_table: varchar("entity_table", { length: 60 }),
  entity_id: uuid("entity_id"),
  details: jsonb("details"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const syncQueueRelations = relations(syncQueue, ({ one }) => ({
  device: one(devices, {
    fields: [syncQueue.device_id],
    references: [devices.device_id],
  }),
  user: one(users, {
    fields: [syncQueue.user_id],
    references: [users.id],
  }),
  onBehalfOfFarmer: one(farmers, {
    fields: [syncQueue.on_behalf_of_farmer_id],
    references: [farmers.farmer_id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.user_id],
    references: [users.id],
  }),
}));
