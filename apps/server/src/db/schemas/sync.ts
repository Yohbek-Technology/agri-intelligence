import { pgTable, uuid, varchar, timestamp, bigint, jsonb, check, index, unique, text, char } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/_relations";
import { sql } from "drizzle-orm";
import { cityOffices } from "./tenancy.js";
import { users } from "./auth-schema.js";
import { syncOperation, syncMutationStatus, devicePlatform } from "./enums.js";

export const devices = pgTable(
  "devices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    cityOfficeId: uuid("city_office_id").references(() => cityOffices.id),
    deviceIdentifier: varchar("device_identifier", { length: 120 }).notNull(),
    platform: devicePlatform("platform").notNull().default("pwa"),
    appVersion: varchar("app_version", { length: 20 }),
    webPushSubscription: text("web_push_subscription"),
    fcmToken: text("fcm_token"),
    lastSyncCursor: bigint("last_sync_cursor", { mode: "number" }).notNull().default(0),
    lastSyncAt: timestamp("last_sync_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    uqUserDevice: unique("devices_user_device_key").on(table.userId, table.deviceIdentifier),
    idxUser: index("idx_devices_user").on(table.userId),
    devicesAndroidNoWebPush: check(
      "devices_android_no_web_push",
      sql`platform <> 'android' or web_push_subscription is null`
    ),
    devicesPwaNoFcm: check(
      "devices_pwa_no_fcm",
      sql`platform <> 'pwa' or fcm_token is null`
    ),
  })
);

export const syncMutations = pgTable(
  "sync_mutations",
  {
    id: uuid("id").primaryKey(),
    deviceId: uuid("device_id")
      .notNull()
      .references(() => devices.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    cityOfficeId: uuid("city_office_id")
      .notNull()
      .references(() => cityOffices.id),
    entityType: varchar("entity_type", { length: 60 }).notNull(),
    entityId: uuid("entity_id").notNull(),
    operation: syncOperation("operation").notNull(),
    payload: jsonb("payload").notNull(),
    payloadHash: char("payload_hash", { length: 64 }).notNull(),
    clientSequenceNumber: bigint("client_sequence_number", { mode: "number" }).notNull(),
    clientCreatedAt: timestamp("client_created_at", { withTimezone: true }).notNull(),
    status: syncMutationStatus("status").notNull(),
    rejectReason: varchar("reject_reason", { length: 255 }),
    receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    payloadHashCheck: check(
      "sync_mutations_hash_check",
      sql`payload_hash ~ '^[0-9a-f]{64}$'`
    ),
    idxDevice: index("idx_sync_mutations_device").on(table.deviceId, table.clientSequenceNumber),
  })
);

export const syncChanges = pgTable(
  "sync_changes",
  {
    sequenceNumber: bigint("sequence_number", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    cityOfficeId: uuid("city_office_id").notNull(),
    entityType: varchar("entity_type", { length: 60 }).notNull(),
    entityId: uuid("entity_id").notNull(),
    operation: syncOperation("operation").notNull(),
    farmerId: uuid("farmer_id"),
    changedAt: timestamp("changed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    idxPull: index("idx_sync_changes_pull").on(table.cityOfficeId, table.sequenceNumber),
    idxFarmer: index("idx_sync_changes_farmer").on(table.farmerId, table.sequenceNumber),
  })
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    cityOfficeId: uuid("city_office_id").references(() => cityOffices.id),
    actorUserId: uuid("actor_user_id").references(() => users.id),
    action: varchar("action", { length: 80 }).notNull(),
    entityType: varchar("entity_type", { length: 60 }),
    entityId: uuid("entity_id"),
    changesJson: jsonb("changes_json"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    idxOffice: index("idx_audit_office").on(table.cityOfficeId, table.id),
    idxEntity: index("idx_audit_entity").on(table.entityType, table.entityId),
    idxActorAction: index("idx_audit_actor_action").on(
      table.actorUserId,
      table.action,
      table.createdAt
    ),
  })
);

export const devicesRelations = relations(devices, ({ one, many }) => ({
  cityOffice: one(cityOffices, {
    fields: [devices.cityOfficeId],
    references: [cityOffices.id],
  }),
  user: one(users, {
    fields: [devices.userId],
    references: [users.id],
  }),
  syncMutations: many(syncMutations),
}));

export const syncMutationsRelations = relations(syncMutations, ({ one }) => ({
  device: one(devices, {
    fields: [syncMutations.deviceId],
    references: [devices.id],
  }),
  cityOffice: one(cityOffices, {
    fields: [syncMutations.cityOfficeId],
    references: [cityOffices.id],
  }),
  user: one(users, {
    fields: [syncMutations.userId],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  cityOffice: one(cityOffices, {
    fields: [auditLogs.cityOfficeId],
    references: [cityOffices.id],
  }),
  actorUser: one(users, {
    fields: [auditLogs.actorUserId],
    references: [users.id],
  }),
}));

export const AUDIT_ACTIONS = {
  FARMER_VERIFY: "farmer.verify",
  OFFICE_PARAMETERS_UPDATE: "office.parameters_update",
  LOG_CORRECT: "log.correct",
  AUTH_SIGNUP: "auth.signup",
  AUTH_LOGIN_FAILED: "auth.login_failed",
  AUTH_LOCKOUT: "auth.lockout",
  AUTH_PASSWORD_RESET: "auth.password_reset",
  AUTH_LOGOUT: "auth.logout",
  AUTH_CLIENT_DENIED: "auth.client_denied",
  // Staff management
  STAFF_CREATED: "staff.created",
  STAFF_UPDATED: "staff.updated",
  STAFF_DEACTIVATED: "staff.deactivated",
  // Catalog management
  CATALOG_CROP_CREATED: "catalog.crop_created",
  CATALOG_CROP_UPDATED: "catalog.crop_updated",
  CATALOG_VARIETY_CREATED: "catalog.variety_created",
  CATALOG_VARIETY_UPDATED: "catalog.variety_updated",
  CATALOG_FERTILIZER_RATE_UPSERTED: "catalog.fertilizer_rate_upserted",
  CATALOG_PEST_CREATED: "catalog.pest_created",
  CATALOG_PEST_UPDATED: "catalog.pest_updated",
  CATALOG_CHEMICAL_CREATED: "catalog.chemical_created",
  CATALOG_CHEMICAL_UPDATED: "catalog.chemical_updated",
  CATALOG_CHEMICAL_RETIRED: "catalog.chemical_retired",
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS] | (string & {});

export const enforceAndroidDeviceRolesTriggerSql = sql`
create or replace function enforce_android_device_roles()
returns trigger
language plpgsql
as $$
declare
  r user_role;
begin
  if new.platform = 'android' then
    select role into r from users where id = new.user_id;
    if r is null or r not in ('farmer', 'da') then
      raise exception 'client_not_permitted' using errcode = '23514';
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_devices_android_roles
before insert or update of platform, user_id on devices
for each row execute function enforce_android_device_roles();
`;

