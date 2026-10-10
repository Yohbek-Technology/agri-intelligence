import { pgTable, uuid, varchar, timestamp, date, boolean, check, index, unique, uniqueIndex, jsonb, numeric, smallint } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/_relations";
import { sql } from "drizzle-orm";
import { cityOffices, kebeles } from "./tenancy.js";
import { crops, cropVarieties } from "./catalog.js";
import { users } from "./auth-schema.js";
import { stockItemType, stockMovementType } from "./enums.js";

export const depots = pgTable(
  "depots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cityOfficeId: uuid("city_office_id")
      .notNull()
      .references(() => cityOffices.id, { onDelete: "cascade" }),
    kebeleId: uuid("kebele_id").references(() => kebeles.id),
    name: varchar("name", { length: 120 }).notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    uqName: unique("depots_office_name_key").on(table.cityOfficeId, table.name),
  })
);

export const depotStockItems = pgTable(
  "depot_stock_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    depotId: uuid("depot_id")
      .notNull()
      .references(() => depots.id, { onDelete: "cascade" }),
    itemType: stockItemType("item_type").notNull(),
    cropId: uuid("crop_id").references(() => crops.id),
    varietyId: uuid("variety_id").references(() => cropVarieties.id),
    quantity: numeric("quantity", { precision: 14, scale: 3 }).notNull().default("0"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    quantityCheck: check(
      "depot_stock_items_quantity_check",
      sql`quantity >= 0`
    ),
    seedCropCheck: check(
      "depot_stock_items_seed_crop_check",
      sql`item_type <> 'seed' or crop_id is not null`
    ),
    uqDepotStockItems: uniqueIndex("uq_depot_stock_items").on(
      table.depotId,
      table.itemType,
      sql`coalesce(crop_id, '00000000-0000-0000-0000-000000000000'::uuid)`,
      sql`coalesce(variety_id, '00000000-0000-0000-0000-000000000000'::uuid)`
    ),
    idxDepot: index("idx_stock_items_depot").on(table.depotId),
  })
);

export const depotStockMovements = pgTable(
  "depot_stock_movements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    depotStockItemId: uuid("depot_stock_item_id")
      .notNull()
      .references(() => depotStockItems.id),
    movementType: stockMovementType("movement_type").notNull(),
    quantityDelta: numeric("quantity_delta", { precision: 14, scale: 3 }).notNull(),
    movementDate: date("movement_date").notNull().defaultNow(),
    referenceNote: varchar("reference_note", { length: 255 }),
    status: varchar("status", { length: 20 }).notNull().default("received"),
    expectedOn: date("expected_on"),
    recordedByUserId: uuid("recorded_by_user_id").notNull().references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    statusCheck: check(
      "depot_stock_movements_status_check",
      sql`status in ('expected', 'confirmed', 'received', 'cancelled')`
    ),
    quantityCheck: check(
      "depot_stock_movements_quantity_check",
      sql`
        (movement_type = 'receipt' and quantity_delta > 0)
        or (movement_type = 'issue' and quantity_delta < 0)
        or (movement_type = 'adjustment' and quantity_delta <> 0)
      `
    ),
    receiptStatusCheck: check(
      "depot_stock_movements_receipt_check",
      sql`status = 'received' or movement_type = 'receipt'`
    ),
    idxItem: index("idx_stock_movements_item").on(table.depotStockItemId, table.createdAt),
    idxPending: index("idx_stock_movements_pending")
      .on(table.depotStockItemId, table.expectedOn)
      .where(sql`status in ('expected', 'confirmed')`),
  })
);

export const demandSnapshots = pgTable(
  "demand_snapshots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cityOfficeId: uuid("city_office_id")
      .notNull()
      .references(() => cityOffices.id, { onDelete: "cascade" }),
    seasonYear: smallint("season_year").notNull(),
    safetyMarginPct: numeric("safety_margin_pct", { precision: 5, scale: 2 }).notNull().default("0"),
    ratesVersionIds: jsonb("rates_version_ids").notNull(),
    result: jsonb("result").notNull(),
    createdByUserId: uuid("created_by_user_id").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    safetyMarginCheck: check(
      "demand_snapshots_margin_check",
      sql`safety_margin_pct between 0 and 30`
    ),
  })
);

export const depotsRelations = relations(depots, ({ one, many }) => ({
  cityOffice: one(cityOffices, {
    fields: [depots.cityOfficeId],
    references: [cityOffices.id],
  }),
  kebele: one(kebeles, {
    fields: [depots.kebeleId],
    references: [kebeles.id],
  }),
  stockItems: many(depotStockItems),
}));

export const depotStockItemsRelations = relations(depotStockItems, ({ one, many }) => ({
  depot: one(depots, {
    fields: [depotStockItems.depotId],
    references: [depots.id],
  }),
  crop: one(crops, {
    fields: [depotStockItems.cropId],
    references: [crops.id],
  }),
  variety: one(cropVarieties, {
    fields: [depotStockItems.varietyId],
    references: [cropVarieties.id],
  }),
  movements: many(depotStockMovements),
}));

export const depotStockMovementsRelations = relations(depotStockMovements, ({ one }) => ({
  depotStockItem: one(depotStockItems, {
    fields: [depotStockMovements.depotStockItemId],
    references: [depotStockItems.id],
  }),
  recordedByUser: one(users, {
    fields: [depotStockMovements.recordedByUserId],
    references: [users.id],
  }),
}));

export const demandSnapshotsRelations = relations(demandSnapshots, ({ one }) => ({
  cityOffice: one(cityOffices, {
    fields: [demandSnapshots.cityOfficeId],
    references: [cityOffices.id],
  }),
  createdByUser: one(users, {
    fields: [demandSnapshots.createdByUserId],
    references: [users.id],
  }),
}));
