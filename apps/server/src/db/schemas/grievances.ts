import { pgTable, uuid, varchar, timestamp, jsonb, check, index } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { cityOffices, geography, kebeles } from "./tenancy.js";
import { farmers, plots } from "./farmers.js";
import {
  grievanceCategory,
  grievanceStatus,
  grievancePriority,
  messageKind,
  taskType,
  taskStatus,
} from "./enums.js";

// ============================================================
// GRIEVANCES — Voice Box (GRIEV-1 to GRIEV-8)
// ============================================================

export const grievances = pgTable(
  "grievances",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    
    cityOfficeId: uuid("city_office_id")
      .notNull()
      .references(() => cityOffices.id),
    farmerId: uuid("farmer_id")
      .notNull()
      .references(() => farmers.id),
    submittedByUserId: uuid("submitted_by_user_id"), // references users.id
    
    category: grievanceCategory("category").notNull(),
    plotId: uuid("plot_id").references(() => plots.id),
    kebeleId: uuid("kebele_id").references(() => kebeles.id),
    
    locationLat: varchar("location_lat"), // numeric(9,6)
    locationLng: varchar("location_lng"), // numeric(9,6)
    
    audioMediaId: uuid("audio_media_id"), // references media_files.id - set in index.ts
    textNote: varchar("text_note", { length: 1000 }),
    pestId: uuid("pest_id"), // references pest_catalog.id - set in index.ts
    
    status: grievanceStatus("status").notNull().default("submitted"),
    priority: grievancePriority("priority").notNull().default("normal"),
    assigneeUserId: uuid("assignee_user_id"), // references users.id
    
    mergedIntoId: uuid("merged_into_id").references(() => grievances.id),
    
    // Replaces grievance_photos: up to 3 photos
    photoMediaIds: uuid("photo_media_ids").array().notNull().default(sql`'{}'::uuid[]`),
    
    // Replaces grievance_status_events - maintained by trigger
    statusHistory: jsonb("status_history").notNull().default([]),
    
    submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
    receivedAt: timestamp("received_at", { withTimezone: true }),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    contentCheck: check(
      "grievances_content_check",
      sql`audio_media_id is not null or text_note is not null`
    ),
    assigneeCheck: check(
      "grievances_assignee_check",
      sql`status not in ('assigned', 'in_progress') or assignee_user_id is not null`
    ),
    resolvedCheck: check(
      "grievances_resolved_check",
      sql`resolved_at is null or received_at is null or resolved_at >= received_at`
    ),
    photoCountCheck: check(
      "grievances_photo_count_check",
      sql`cardinality(photo_media_ids) <= 3`
    ),
    historyCheck: check(
      "grievances_history_check",
      sql`jsonb_typeof(status_history) = 'array'`
    ),
    idxTriage: index("idx_grievances_triage").on(
      table.cityOfficeId,
      table.status,
      table.category,
      table.submittedAt
    ),
    idxAssignee: index("idx_grievances_assignee").on(table.assigneeUserId, table.status),
    idxFarmer: index("idx_grievances_farmer").on(table.farmerId, table.submittedAt),
  })
);

// ============================================================
// GRIEVANCE MESSAGES (GRIEV-5, TRG-4)
// Two-way threaded conversation
// Append-only except read_at and tts_media_id
// ============================================================

export const grievanceMessages = pgTable(
  "grievance_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    
    cityOfficeId: uuid("city_office_id")
      .notNull()
      .references(() => cityOffices.id),
    grievanceId: uuid("grievance_id")
      .notNull()
      .references(() => grievances.id, { onDelete: "cascade" }),
    senderUserId: uuid("sender_user_id").notNull(), // references users.id
    
    messageType: messageKind("message_type").notNull(),
    textBody: varchar("text_body", { length: 2000 }),
    audioMediaId: uuid("audio_media_id"), // references media_files.id - set in index.ts
    ttsMediaId: uuid("tts_media_id"), // references media_files.id - set in index.ts
    
    readAt: timestamp("read_at", { withTimezone: true }),
    
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    contentCheck: check(
      "grievance_messages_content_check",
      sql`
        (message_type = 'text' and text_body is not null)
        or (message_type = 'audio' and audio_media_id is not null)
      `
    ),
    idxGrievance: index("idx_grievance_messages").on(table.grievanceId, table.createdAt),
    idxUnread: index("idx_grievance_msg_unread")
      .on(table.grievanceId)
      .where(sql`read_at is null`),
  })
);

// ============================================================
// DA TASKS (ANLY-7, DIAG-6, TRG-3)
// ============================================================

export const daTasks = pgTable(
  "da_tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    
    cityOfficeId: uuid("city_office_id")
      .notNull()
      .references(() => cityOffices.id),
    assigneeUserId: uuid("assignee_user_id").notNull(), // references users.id
    createdByUserId: uuid("created_by_user_id"), // references users.id
    
    taskType: taskType("task_type").notNull(),
    status: taskStatus("status").notNull().default("open"),
    title: varchar("title", { length: 200 }).notNull(),
    checklist: jsonb("checklist"),
    
    farmerId: uuid("farmer_id").references(() => farmers.id),
    plotId: uuid("plot_id").references(() => plots.id),
    grievanceId: uuid("grievance_id").references(() => grievances.id),
    diagnosisCaseId: uuid("diagnosis_case_id"), // references diagnosis_cases.id - set in index.ts
    
    dueOn: varchar("due_on"), // date
    completedAt: timestamp("completed_at", { withTimezone: true }),
    
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    idxAssignee: index("idx_da_tasks_assignee").on(table.assigneeUserId, table.status),
  })
);

// ============================================================
// RELATIONS
// ============================================================

export const grievancesRelations = relations(grievances, ({ one, many }) => ({
  cityOffice: one(cityOffices, {
    fields: [grievances.cityOfficeId],
    references: [cityOffices.id],
  }),
  farmer: one(farmers, {
    fields: [grievances.farmerId],
    references: [farmers.id],
  }),
  plot: one(plots, {
    fields: [grievances.plotId],
    references: [plots.id],
  }),
  kebele: one(kebeles, {
    fields: [grievances.kebeleId],
    references: [kebeles.id],
  }),
  mergedInto: one(grievances, {
    fields: [grievances.mergedIntoId],
    references: [grievances.id],
  }),
  messages: many(grievanceMessages),
  tasks: many(daTasks),
}));

export const grievanceMessagesRelations = relations(grievanceMessages, ({ one }) => ({
  cityOffice: one(cityOffices, {
    fields: [grievanceMessages.cityOfficeId],
    references: [cityOffices.id],
  }),
  grievance: one(grievances, {
    fields: [grievanceMessages.grievanceId],
    references: [grievances.id],
  }),
}));

export const daTasksRelations = relations(daTasks, ({ one }) => ({
  cityOffice: one(cityOffices, {
    fields: [daTasks.cityOfficeId],
    references: [cityOffices.id],
  }),
  farmer: one(farmers, {
    fields: [daTasks.farmerId],
    references: [farmers.id],
  }),
  plot: one(plots, {
    fields: [daTasks.plotId],
    references: [plots.id],
  }),
  grievance: one(grievances, {
    fields: [daTasks.grievanceId],
    references: [grievances.id],
  }),
}));
