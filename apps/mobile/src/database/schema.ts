/**
 * WatermelonDB Schema Definition for Offline-First Android Client
 * Aligned with Database Schema v1.3 (19 synchronized local tables)
 */

export interface TableColumnDef {
  name: string;
  type: 'string' | 'number' | 'boolean';
  isOptional?: boolean;
  isIndexed?: boolean;
}

export interface TableSchemaDef {
  name: string;
  columns: TableColumnDef[];
}

export const mobileDatabaseSchema: TableSchemaDef[] = [
  {
    name: 'farmers',
    columns: [
      { name: 'city_office_id', type: 'string', isIndexed: true },
      { name: 'user_id', type: 'string', isOptional: true },
      { name: 'full_name', type: 'string' },
      { name: 'phone_number', type: 'string', isOptional: true },
      { name: 'has_no_phone', type: 'boolean' },
      { name: 'local_id_number', type: 'string', isIndexed: true },
      { name: 'kebele_id', type: 'string', isIndexed: true },
      { name: 'assigned_da_user_id', type: 'string', isOptional: true, isIndexed: true },
      { name: 'preferred_language', type: 'string' },
      { name: 'is_verified', type: 'boolean' },
      { name: 'consent_agreed', type: 'boolean' },
      { name: 'created_at', type: 'number' },
      { name: 'updated_at', type: 'number' },
    ],
  },
  {
    name: 'plots',
    columns: [
      { name: 'city_office_id', type: 'string', isIndexed: true },
      { name: 'farmer_id', type: 'string', isIndexed: true },
      { name: 'name', type: 'string' },
      { name: 'area_value', type: 'number' },
      { name: 'area_unit', type: 'string' },
      { name: 'hectares_per_unit_applied', type: 'number' },
      { name: 'area_hectares', type: 'number' },
      { name: 'centroid_latitude', type: 'number' },
      { name: 'centroid_longitude', type: 'number' },
      { name: 'gps_accuracy_meters', type: 'number' },
      { name: 'weather_grid_latitude', type: 'number' },
      { name: 'weather_grid_longitude', type: 'number' },
      { name: 'elevation_meters', type: 'number' },
      { name: 'agro_zone', type: 'string' },
      { name: 'agro_zone_derived', type: 'string' },
      { name: 'kebele_id', type: 'string', isOptional: true },
      { name: 'soil_class', type: 'string', isOptional: true },
      { name: 'drainage', type: 'string', isOptional: true },
      { name: 'planned_crop_id', type: 'string', isOptional: true },
      { name: 'planned_season_year', type: 'number', isOptional: true },
      { name: 'status', type: 'string' },
      { name: 'created_at', type: 'number' },
      { name: 'updated_at', type: 'number' },
    ],
  },
  {
    name: 'crop_cycles',
    columns: [
      { name: 'city_office_id', type: 'string', isIndexed: true },
      { name: 'farmer_id', type: 'string', isIndexed: true },
      { name: 'plot_id', type: 'string', isIndexed: true },
      { name: 'crop_id', type: 'string', isIndexed: true },
      { name: 'variety_id', type: 'string', isOptional: true },
      { name: 'season_year', type: 'number' },
      { name: 'stage', type: 'string' },
      { name: 'status', type: 'string' },
      { name: 'started_on', type: 'string' },
      { name: 'closed_on', type: 'string', isOptional: true },
      { name: 'created_at', type: 'number' },
      { name: 'updated_at', type: 'number' },
    ],
  },
  {
    name: 'fertilizer_logs',
    columns: [
      { name: 'city_office_id', type: 'string' },
      { name: 'farmer_id', type: 'string', isIndexed: true },
      { name: 'cycle_id', type: 'string', isIndexed: true },
      { name: 'application_type', type: 'string' },
      { name: 'fertilizer_product', type: 'string' },
      { name: 'applied', type: 'boolean' },
      { name: 'skip_reason', type: 'string', isOptional: true },
      { name: 'quantity_kg', type: 'number', isOptional: true },
      { name: 'application_date', type: 'string', isOptional: true },
      { name: 'growth_stage_at_application', type: 'string', isOptional: true },
      { name: 'rate_kg_per_ha', type: 'number', isOptional: true },
      { name: 'days_after_sowing', type: 'number', isOptional: true },
      { name: 'created_at', type: 'number' },
      { name: 'updated_at', type: 'number' },
    ],
  },
  {
    name: 'harvest_records',
    columns: [
      { name: 'city_office_id', type: 'string' },
      { name: 'farmer_id', type: 'string', isIndexed: true },
      { name: 'cycle_id', type: 'string', isIndexed: true },
      { name: 'harvest_date', type: 'string' },
      { name: 'entered_volume', type: 'number' },
      { name: 'entered_unit', type: 'string' },
      { name: 'volume_kg', type: 'number' },
      { name: 'yield_qt_per_ha', type: 'number' },
      { name: 'plausibility_confirmed', type: 'boolean' },
      { name: 'created_at', type: 'number' },
      { name: 'updated_at', type: 'number' },
    ],
  },
  {
    name: 'grievances',
    columns: [
      { name: 'city_office_id', type: 'string' },
      { name: 'farmer_id', type: 'string', isIndexed: true },
      { name: 'category', type: 'string' },
      { name: 'plot_id', type: 'string', isOptional: true },
      { name: 'audio_media_id', type: 'string', isOptional: true },
      { name: 'text_note', type: 'string', isOptional: true },
      { name: 'status', type: 'string' },
      { name: 'priority', type: 'string' },
      { name: 'photo_media_ids_json', type: 'string' }, // serialized json array
      { name: 'status_history_json', type: 'string' }, // serialized json array
      { name: 'submitted_at', type: 'string' },
      { name: 'resolved_at', type: 'string', isOptional: true },
      { name: 'created_at', type: 'number' },
      { name: 'updated_at', type: 'number' },
    ],
  },
  {
    name: 'sync_mutations',
    columns: [
      { name: 'entity_type', type: 'string', isIndexed: true },
      { name: 'entity_id', type: 'string', isIndexed: true },
      { name: 'operation', type: 'string' }, // insert | update | delete
      { name: 'payload_json', type: 'string' },
      { name: 'payload_hash', type: 'string' }, // SHA-256
      { name: 'client_sequence_number', type: 'number', isIndexed: true },
      { name: 'client_created_at', type: 'string' },
      { name: 'status', type: 'string' }, // pending | applied | rejected
      { name: 'retry_count', type: 'number' },
    ],
  },
];
