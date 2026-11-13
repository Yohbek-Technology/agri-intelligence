/**
 * WatermelonDB App Schema for AgrIntel Mobile
 * Mirrors server PostgreSQL tables:
 * - farmers, plots, crop_cycles, fertilizer_applications, farm_activities,
 *   farm_transactions, pest_diagnoses, grievances, grievance_responses,
 *   announcements, and op_queue_items.
 */

export interface TableColumnSchema {
  name: string;
  type: 'string' | 'number' | 'boolean';
  isOptional?: boolean;
  isIndexed?: boolean;
}

export interface TableSchemaDefinition {
  name: string;
  columns: TableColumnSchema[];
}

export interface AppSchemaDefinition {
  version: number;
  tables: TableSchemaDefinition[];
}

export function tableSchema(def: TableSchemaDefinition): TableSchemaDefinition {
  return def;
}

export function appSchema({
  version,
  tables,
}: {
  version: number;
  tables: TableSchemaDefinition[];
}): AppSchemaDefinition {
  return { version, tables };
}

export const schema = appSchema({
  version: 2,
  tables: [
    tableSchema({
      name: 'farmers',
      columns: [
        { name: 'user_id', type: 'string', isOptional: true },
        { name: 'city_id', type: 'string', isIndexed: true },
        { name: 'kebele_id', type: 'string', isIndexed: true },
        { name: 'local_id_number', type: 'string' },
        { name: 'full_name', type: 'string' },
        { name: 'phone_number', type: 'string', isOptional: true },
        { name: 'gender', type: 'string', isOptional: true },
        { name: 'literacy_level', type: 'string', isOptional: true },
        { name: 'status', type: 'string', isIndexed: true },
        { name: 'sync_version', type: 'number' },
        { name: 'created_at', type: 'string' },
        { name: 'updated_at', type: 'string' },
        { name: 'deleted_at', type: 'string', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'plots',
      columns: [
        { name: 'farmer_id', type: 'string', isIndexed: true },
        { name: 'city_id', type: 'string' },
        { name: 'kebele_id', type: 'string' },
        { name: 'plot_name', type: 'string' },
        { name: 'landmark', type: 'string', isOptional: true },
        { name: 'area_value', type: 'number' },
        { name: 'area_unit', type: 'string' },
        { name: 'area_hectares', type: 'number' },
        { name: 'latitude', type: 'number', isOptional: true },
        { name: 'longitude', type: 'number', isOptional: true },
        { name: 'altitude_m', type: 'number', isOptional: true },
        { name: 'zone', type: 'string' },
        { name: 'soil', type: 'string' },
        { name: 'drainage', type: 'string', isOptional: true },
        { name: 'rotation_plan', type: 'string', isOptional: true },
        { name: 'sync_version', type: 'number' },
        { name: 'created_at', type: 'string' },
        { name: 'updated_at', type: 'string' },
        { name: 'deleted_at', type: 'string', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'crop_cycles',
      columns: [
        { name: 'plot_id', type: 'string', isIndexed: true },
        { name: 'season_year', type: 'number' },
        { name: 'season', type: 'string' },
        { name: 'crop_id', type: 'string', isIndexed: true },
        { name: 'variety_id', type: 'string', isOptional: true },
        { name: 'current_stage', type: 'string' },
        { name: 'status', type: 'string' },
        { name: 'planting_date', type: 'string', isOptional: true },
        { name: 'seed_type', type: 'string', isOptional: true },
        { name: 'seed_source', type: 'string', isOptional: true },
        { name: 'seed_amount_kg', type: 'number', isOptional: true },
        { name: 'harvest_date', type: 'string', isOptional: true },
        { name: 'harvest_value', type: 'number', isOptional: true },
        { name: 'harvest_unit', type: 'string', isOptional: true },
        { name: 'yield_qt_ha', type: 'number', isOptional: true },
        { name: 'grain_moisture_pct', type: 'number', isOptional: true },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'sync_version', type: 'number' },
        { name: 'created_at', type: 'string' },
        { name: 'updated_at', type: 'string' },
        { name: 'deleted_at', type: 'string', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'fertilizer_applications',
      columns: [
        { name: 'cycle_id', type: 'string', isIndexed: true },
        { name: 'fertilizer', type: 'string' },
        { name: 'stage', type: 'string' },
        { name: 'amount_kg', type: 'number' },
        { name: 'application_date', type: 'string' },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'sync_version', type: 'number' },
        { name: 'created_at', type: 'string' },
        { name: 'updated_at', type: 'string' },
        { name: 'deleted_at', type: 'string', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'farm_activities',
      columns: [
        { name: 'cycle_id', type: 'string', isIndexed: true },
        { name: 'activity', type: 'string' },
        { name: 'activity_date', type: 'string' },
        { name: 'quantity', type: 'number', isOptional: true },
        { name: 'quantity_unit', type: 'string', isOptional: true },
        { name: 'pesticide_id', type: 'string', isOptional: true },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'sync_version', type: 'number' },
        { name: 'created_at', type: 'string' },
        { name: 'updated_at', type: 'string' },
        { name: 'deleted_at', type: 'string', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'farm_transactions',
      columns: [
        { name: 'cycle_id', type: 'string', isIndexed: true },
        { name: 'category', type: 'string' },
        { name: 'is_income', type: 'boolean' },
        { name: 'amount_etb', type: 'number' },
        { name: 'txn_date', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'sync_version', type: 'number' },
        { name: 'created_at', type: 'string' },
        { name: 'updated_at', type: 'string' },
        { name: 'deleted_at', type: 'string', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'pest_diagnoses',
      columns: [
        { name: 'farmer_id', type: 'string', isIndexed: true },
        { name: 'plot_id', type: 'string', isOptional: true },
        { name: 'cycle_id', type: 'string', isOptional: true },
        { name: 'kebele_id', type: 'string', isOptional: true },
        { name: 'image_urls', type: 'string' },
        { name: 'pest_id', type: 'string', isOptional: true },
        { name: 'confidence', type: 'number', isOptional: true },
        { name: 'severity', type: 'string', isOptional: true },
        { name: 'explanation_text', type: 'string', isOptional: true },
        { name: 'explanation_audio_url', type: 'string', isOptional: true },
        { name: 'needs_expert_review', type: 'boolean' },
        { name: 'review_outcome', type: 'string', isOptional: true },
        { name: 'sync_version', type: 'number' },
        { name: 'created_at', type: 'string' },
        { name: 'updated_at', type: 'string' },
        { name: 'deleted_at', type: 'string', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'grievances',
      columns: [
        { name: 'farmer_id', type: 'string', isIndexed: true },
        { name: 'city_id', type: 'string' },
        { name: 'kebele_id', type: 'string', isOptional: true },
        { name: 'category', type: 'string' },
        { name: 'description_text', type: 'string', isOptional: true },
        { name: 'audio_url', type: 'string', isOptional: true },
        { name: 'audio_language', type: 'string', isOptional: true },
        { name: 'status', type: 'string', isIndexed: true },
        { name: 'assigned_to', type: 'string', isOptional: true },
        { name: 'sync_version', type: 'number' },
        { name: 'created_at', type: 'string' },
        { name: 'updated_at', type: 'string' },
        { name: 'deleted_at', type: 'string', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'grievance_responses',
      columns: [
        { name: 'grievance_id', type: 'string', isIndexed: true },
        { name: 'responder_id', type: 'string' },
        { name: 'new_status', type: 'string', isOptional: true },
        { name: 'message_text', type: 'string', isOptional: true },
        { name: 'audio_url', type: 'string', isOptional: true },
        { name: 'sync_version', type: 'number' },
        { name: 'created_at', type: 'string' },
      ],
    }),
    tableSchema({
      name: 'announcements',
      columns: [
        { name: 'city_id', type: 'string', isIndexed: true },
        { name: 'type', type: 'string' },
        { name: 'severity', type: 'string' },
        { name: 'language', type: 'string' },
        { name: 'title', type: 'string' },
        { name: 'body', type: 'string' },
        { name: 'audio_url', type: 'string', isOptional: true },
        { name: 'published_at', type: 'string', isOptional: true },
        { name: 'expires_at', type: 'string', isOptional: true },
        { name: 'created_at', type: 'string' },
      ],
    }),
    tableSchema({
      name: 'op_queue_items',
      columns: [
        { name: 'op_id', type: 'string', isIndexed: true },
        { name: 'table_name', type: 'string', isIndexed: true },
        { name: 'record_id', type: 'string' },
        { name: 'op_type', type: 'string' },
        { name: 'payload', type: 'string' },
        { name: 'base_version', type: 'number' },
        { name: 'client_ts', type: 'string' },
        { name: 'status', type: 'string', isIndexed: true },
        { name: 'retry_count', type: 'number' },
        { name: 'error_message', type: 'string', isOptional: true },
        { name: 'created_at', type: 'string' },
      ],
    }),
  ],
});
