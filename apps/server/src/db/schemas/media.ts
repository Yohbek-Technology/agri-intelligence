import { pgTable, uuid, varchar, timestamp, bigint, check, unique, index } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { cityOffices } from "./tenancy.js";
import { mediaKind, mediaStatus } from "./enums.js";

export const mediaFiles = pgTable(
  "media_files",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cityOfficeId: uuid("city_office_id")
      .notNull()
      .references(() => cityOffices.id),
    ownerUserId: uuid("owner_user_id"),
    kind: mediaKind("kind").notNull(),
    mimeType: varchar("mime_type", { length: 100 }).notNull(),
    sizeBytes: bigint("size_bytes", { mode: "number" }),
    durationS: varchar("duration_s"),
    storageKey: varchar("storage_key", { length: 500 }).notNull().unique(),
    sha256: varchar("sha256", { length: 64 }),
    status: mediaStatus("status").notNull().default("pending"),
    bytesReceived: bigint("bytes_received", { mode: "number" }).notNull().default(0),
    uploadId: varchar("upload_id", { length: 200 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    sizeBytesCheck: check(
      "media_files_size_check",
      sql`size_bytes is null or size_bytes >= 0`
    ),
    durationCheck: check(
      "media_files_duration_check",
      sql`kind <> 'audio' or duration_s is null or duration_s::integer <= 180`
    ),
    sha256Check: check(
      "media_files_sha256_check",
      sql`sha256 is null or sha256 ~ '^[0-9a-f]{64}$'`
    ),
    idxOwner: index("idx_media_owner").on(table.ownerUserId, table.createdAt),
    idxStatus: index("idx_media_status")
      .on(table.status)
      .where(sql`status in ('pending', 'uploading')`),
  })
);

export const mediaFilesRelations = relations(mediaFiles, ({ one }) => ({
  cityOffice: one(cityOffices, {
    fields: [mediaFiles.cityOfficeId],
    references: [cityOffices.id],
  }),
}));
