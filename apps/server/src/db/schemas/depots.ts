import { pgTable, uuid, varchar, timestamp, date, boolean, check, index, unique } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { cityOffices, kebeles } from "./tenancy.js";
import { stockItemType, stockMovementType } from "./enums.js";

// ============================================================
// DEPOTS (REG-6, REG-7)
// ============================================================

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

// ============================================================
// DEPOT STOCK ITEMS
// Running balance (never below zero)
// ============================================================

export const depotStockItems = pgTable(
  "depot_stock_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    
    depotId: uuid("depot_id")
      .notNull()
      .references(() => depots.id, { onDelete: "cascade" }),
    
    itemType: stockItemType("item_type").notNull(),
    cropId: uuid("crop_id"), // references crops.id - set in index.ts
    varietyId: uuid("variety_id"), // references crop_varieties.id - set in index.ts
    
    quantity: varchar("quantity").notNull().default("0"), // numeric(14,3)
    
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    quantityCheck: check(
      "depot_stock_items_quantity_check",
      sql`quantity::numeric >= 0`
    ),
    seedCropCheck: check(
      "depot_stock_items_seed_crop_check",
      sql`item_type <> 'seed' or crop_id is not null`
    ),
    idxDepot: index("idx_stock_items_depot").on(table.depotId),
  })
);

// ============================================================
// DEPOT STOCK MOVEMENTS
// Ledger; also holds incoming shipments
// ============================================================

export const depotStockMovements = pgTable(
  "depot_stock_movements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    
    depotStockItemId: uuid("depot_stock_item_id")
      .notNull()
      .references(() => depotStockItems.id),
    
    movementType: stockMovementType("movement_type").notNull(),
    quantityDelta: varchar("quantity_delta").notNull(), // numeric(14,3)
    movementDate: date("movement_date").notNull().defaultNow(),
    referenceNote: varchar("reference_note", { length: 255 }),
    
    // 'received' = applied now; 'expected'/'confirmed' = incoming shipment
    status: varchar("status", { length: 20 }).notNull().default("received"),
    expectedOn: date("expected_on"),
    
    recordedBy: uuid("recorded_by").notNull(), // references users.id
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
        (movement_type = 'receipt' and quantity_delta::numeric > 0)
        or (movement_type = 'issue' and quantity_delta::numeric < 0)
        or (movement_type = 'adjustment' and quantity_delta::numeric <> 0)
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

// ============================================================
// DEMAND SNAPSHOTS (REG-4, REG-5)
// ============================================================

export const demandSnapshots = pgTable(
  "demand_snapshots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    
    cityOfficeId: uuid("city_office_id")
      .notNull()
      .references(() => cityOffices.id, { onDelete: "cascade" }),
    seasonYear: varchar("season_year").notNull(), // smallint
    
    safetyMarginPct: varchar("safety_margin_pct").notNull().default("0"), // numeric(5,2)
    ratesVersionIds: jsonb("rates_version_ids").notNull(), // {crop_id: rates_version}
    // result includes rows, totals, and overrides (replaces kebele_crop_overrides)
    result: jsonb("result").notNull(),
    
    createdBy: uuid("created_by"), // references users.id
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    safetyMarginCheck: check(
      "demand_snapshots_margin_check",
      sql`safety_margin_pct::numeric between 0 and 30`
    ),
  })
);

// ============================================================
// RELATIONS
// ============================================================

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
  movements: many(depotStockMovements),
}));

export const depotStockMovementsRelations = relations(depotStockMovements, ({ one }) => ({
  depotStockItem: one(depotStockItems, {
    fields: [depotStockMovements.depotStockItemId],
    references: [depotStockItems.id],
  }),
}));

export const demandSnapshotsRelations = relations(demandSnapshots, ({ one }) => ({
  cityOffice: one(cityOffices, {
    fields: [demandSnapshots.cityOfficeId],
    references: [cityOffices.id],
  }),
}));
