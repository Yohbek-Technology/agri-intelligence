/**
 * WatermelonDB / SQLite Schema Definition for Offline-First Android Client
 * Reconciled with Database Schema v1.3 (All synchronized local tables)
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
  // 1. Farmers
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

  // 2. Plots
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

  // 3. Crops Catalog Cache
  {
    name: 'crops',
    columns: [
      { name: 'name_en', type: 'string' },
      { name: 'name_am', type: 'string' },
      { name: 'name_om', type: 'string' },
      { name: 'name_ti', type: 'string' },
      { name: 'category', type: 'string' },
      { name: 'weeding_windows_json', type: 'string' },
      { name: 'recommended_successors_json', type: 'string' },
      { name: 'plausibility_ceiling_qt_per_ha', type: 'number' },
      { name: 'is_active', type: 'boolean' },
    ],
  },

  // 4. Crop Varieties
  {
    name: 'crop_varieties',
    columns: [
      { name: 'crop_id', type: 'string', isIndexed: true },
      { name: 'name', type: 'string' },
      { name: 'code', type: 'string' },
      { name: 'maturity_days_min', type: 'number' },
      { name: 'maturity_days_max', type: 'number' },
      { name: 'is_certified', type: 'boolean' },
      { name: 'suitable_zones_json', type: 'string' },
    ],
  },

  // 5. Crop Cycles
  {
    name: 'crop_cycles',
    columns: [
      { name: 'city_office_id', type: 'string', isIndexed: true },
      { name: 'farmer_id', type: 'string', isIndexed: true },
      { name: 'plot_id', type: 'string', isIndexed: true },
      { name: 'crop_id', type: 'string', isIndexed: true },
      { name: 'variety_id', type: 'string', isOptional: true },
      { name: 'season_year', type: 'number' },
      { name: 'season_name', type: 'string' },
      { name: 'stage', type: 'string' },
      { name: 'status', type: 'string' },
      { name: 'started_on', type: 'string' },
      { name: 'closed_on', type: 'string', isOptional: true },
      { name: 'created_at', type: 'number' },
      { name: 'updated_at', type: 'number' },
    ],
  },

  // 6. Sowing Logs
  {
    name: 'sowing_logs',
    columns: [
      { name: 'city_office_id', type: 'string' },
      { name: 'farmer_id', type: 'string', isIndexed: true },
      { name: 'cycle_id', type: 'string', isIndexed: true },
      { name: 'sowing_date', type: 'string' },
      { name: 'seed_variety_id', type: 'string', isOptional: true },
      { name: 'seed_rate_kg_per_ha', type: 'number' },
      { name: 'seed_source', type: 'string' },
      { name: 'planting_method', type: 'string' },
      { name: 'created_at', type: 'number' },
      { name: 'updated_at', type: 'number' },
    ],
  },

  // 7. Fertilizer Logs
  {
    name: 'fertilizer_logs',
    columns: [
      { name: 'city_office_id', type: 'string' },
      { name: 'farmer_id', type: 'string', isIndexed: true },
      { name: 'cycle_id', type: 'string', isIndexed: true },
      { name: 'application_type', type: 'string', isIndexed: true }, // basal, urea_1, urea_2
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

  // 8. Field Operations
  {
    name: 'field_operations',
    columns: [
      { name: 'city_office_id', type: 'string' },
      { name: 'farmer_id', type: 'string', isIndexed: true },
      { name: 'cycle_id', type: 'string', isIndexed: true },
      { name: 'operation_type', type: 'string' }, // plowing, weeding, spraying, irrigation
      { name: 'operation_date', type: 'string' },
      { name: 'duration_hours', type: 'number' },
      { name: 'labor_count', type: 'number' },
      { name: 'notes', type: 'string', isOptional: true },
      { name: 'created_at', type: 'number' },
      { name: 'updated_at', type: 'number' },
    ],
  },

  // 9. Harvest Records
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

  // 10. Ledger Entries
  {
    name: 'ledger_entries',
    columns: [
      { name: 'city_office_id', type: 'string' },
      { name: 'farmer_id', type: 'string', isIndexed: true },
      { name: 'cycle_id', type: 'string', isIndexed: true },
      { name: 'entry_type', type: 'string' }, // expense, income
      { name: 'category', type: 'string' },
      { name: 'amount_etb', type: 'number' },
      { name: 'description', type: 'string', isOptional: true },
      { name: 'entry_date', type: 'string' },
      { name: 'created_at', type: 'number' },
      { name: 'updated_at', type: 'number' },
    ],
  },

  // 11. Yield Gap Analyses
  {
    name: 'yield_gap_analyses',
    columns: [
      { name: 'city_office_id', type: 'string' },
      { name: 'farmer_id', type: 'string', isIndexed: true },
      { name: 'cycle_id', type: 'string', isIndexed: true },
      { name: 'status', type: 'string' },
      { name: 'plot_yield_qt_per_ha', type: 'number' },
      { name: 'cohort_median_qt_per_ha', type: 'number' },
      { name: 'cohort_top_quartile_qt_per_ha', type: 'number' },
      { name: 'gap_percent', type: 'number' },
      { name: 'top_causes_json', type: 'string' },
      { name: 'factor_results_json', type: 'string' },
      { name: 'recommendations_json', type: 'string' },
      { name: 'narration_text_am', type: 'string', isOptional: true },
      { name: 'narration_text_om', type: 'string', isOptional: true },
      { name: 'narration_text_ti', type: 'string', isOptional: true },
      { name: 'narration_text_en', type: 'string', isOptional: true },
      { name: 'created_at', type: 'number' },
    ],
  },

  // 12. Weather Forecasts
  {
    name: 'weather_forecasts',
    columns: [
      { name: 'plot_id', type: 'string', isIndexed: true },
      { name: 'forecast_date', type: 'string', isIndexed: true },
      { name: 'temp_min_c', type: 'number' },
      { name: 'temp_max_c', type: 'number' },
      { name: 'rainfall_prob_percent', type: 'number' },
      { name: 'rainfall_amount_mm', type: 'number' },
      { name: 'soil_moisture_index', type: 'number' },
      { name: 'plow_indicator', type: 'string' }, // go, wait, no
      { name: 'spray_indicator', type: 'string' },
      { name: 'harvest_indicator', type: 'string' },
      { name: 'is_stale', type: 'boolean' },
      { name: 'fetched_at', type: 'string' },
    ],
  },

  // 13. Weather Alerts
  {
    name: 'weather_alerts',
    columns: [
      { name: 'city_office_id', type: 'string', isIndexed: true },
      { name: 'alert_type', type: 'string' }, // frost, downpour, dry_spell
      { name: 'severity', type: 'string' }, // warning, emergency
      { name: 'title', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'valid_from', type: 'string' },
      { name: 'valid_to', type: 'string' },
      { name: 'is_acknowledged', type: 'boolean' },
    ],
  },

  // 14. Diagnosis Cases
  {
    name: 'diagnosis_cases',
    columns: [
      { name: 'city_office_id', type: 'string' },
      { name: 'farmer_id', type: 'string', isIndexed: true },
      { name: 'plot_id', type: 'string', isIndexed: true },
      { name: 'pest_id', type: 'string', isOptional: true },
      { name: 'diagnosis_label', type: 'string' },
      { name: 'confidence_score', type: 'number' },
      { name: 'review_status', type: 'string' }, // confirmed, pending_da_review, amended
      { name: 'treatment_advice_json', type: 'string' },
      { name: 'photo_media_ids_json', type: 'string' },
      { name: 'created_at', type: 'number' },
    ],
  },

  // 15. Registered Chemicals Cache
  {
    name: 'registered_chemicals',
    columns: [
      { name: 'trade_name', type: 'string', isIndexed: true },
      { name: 'active_ingredient', type: 'string' },
      { name: 'registration_number', type: 'string' },
      { name: 'category', type: 'string' },
      { name: 'target_crop_ids_json', type: 'string' },
      { name: 'target_pest_ids_json', type: 'string' },
      { name: 'dosage_am', type: 'string', isOptional: true },
      { name: 'dosage_om', type: 'string', isOptional: true },
      { name: 'dosage_ti', type: 'string', isOptional: true },
      { name: 'dosage_en', type: 'string', isOptional: true },
      { name: 'ppe_instructions_json', type: 'string' },
      { name: 'is_retired', type: 'boolean' },
    ],
  },

  // 16. Grievances
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
      { name: 'photo_media_ids_json', type: 'string' },
      { name: 'status_history_json', type: 'string' },
      { name: 'submitted_at', type: 'string' },
      { name: 'resolved_at', type: 'string', isOptional: true },
      { name: 'created_at', type: 'number' },
      { name: 'updated_at', type: 'number' },
    ],
  },

  // 17. Grievance Messages
  {
    name: 'grievance_messages',
    columns: [
      { name: 'grievance_id', type: 'string', isIndexed: true },
      { name: 'sender_user_id', type: 'string' },
      { name: 'message_type', type: 'string' }, // text, audio
      { name: 'text_body', type: 'string', isOptional: true },
      { name: 'audio_media_id', type: 'string', isOptional: true },
      { name: 'is_read', type: 'boolean' },
      { name: 'created_at', type: 'number' },
    ],
  },

  // 18. DA Tasks
  {
    name: 'da_tasks',
    columns: [
      { name: 'city_office_id', type: 'string' },
      { name: 'da_user_id', type: 'string', isIndexed: true },
      { name: 'farmer_id', type: 'string', isOptional: true },
      { name: 'plot_id', type: 'string', isOptional: true },
      { name: 'task_type', type: 'string' },
      { name: 'priority', type: 'string' },
      { name: 'status', type: 'string' },
      { name: 'notes', type: 'string', isOptional: true },
      { name: 'due_date', type: 'string', isOptional: true },
      { name: 'completed_at', type: 'string', isOptional: true },
      { name: 'created_at', type: 'number' },
    ],
  },

  // 19. Announcements
  {
    name: 'announcements',
    columns: [
      { name: 'city_office_id', type: 'string', isIndexed: true },
      { name: 'category', type: 'string' },
      { name: 'priority', type: 'string' },
      { name: 'title_am', type: 'string' },
      { name: 'title_om', type: 'string' },
      { name: 'title_ti', type: 'string' },
      { name: 'title_en', type: 'string' },
      { name: 'body_am', type: 'string' },
      { name: 'body_om', type: 'string' },
      { name: 'body_ti', type: 'string' },
      { name: 'body_en', type: 'string' },
      { name: 'is_emergency', type: 'boolean' },
      { name: 'is_acknowledged', type: 'boolean' },
      { name: 'published_at', type: 'string' },
    ],
  },

  // 20. Sync Mutations (Transactional Client Queue)
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
      { name: 'reject_reason', type: 'string', isOptional: true },
    ],
  },

  // 21. Sync Changes (Server Delta Tracking)
  {
    name: 'sync_changes',
    columns: [
      { name: 'sequence_number', type: 'number', isIndexed: true },
      { name: 'entity_type', type: 'string', isIndexed: true },
      { name: 'entity_id', type: 'string' },
      { name: 'operation', type: 'string' },
      { name: 'record_json', type: 'string' },
      { name: 'server_timestamp', type: 'string' },
    ],
  },
];
