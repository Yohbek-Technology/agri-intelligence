CREATE TYPE "agro_zone" AS ENUM('dega', 'weyna_dega', 'kolla');--> statement-breakpoint
CREATE TYPE "announcement_status" AS ENUM('draft', 'published', 'recalled');--> statement-breakpoint
CREATE TYPE "announcement_type" AS ENUM('seasonal_advice', 'input_availability', 'emergency');--> statement-breakpoint
CREATE TYPE "app_language" AS ENUM('am', 'om', 'ti', 'en');--> statement-breakpoint
CREATE TYPE "area_unit" AS ENUM('timad', 'kert', 'hectare');--> statement-breakpoint
CREATE TYPE "catalog_status" AS ENUM('active', 'retired');--> statement-breakpoint
CREATE TYPE "chemical_category" AS ENUM('insecticide', 'fungicide', 'herbicide', 'other');--> statement-breakpoint
CREATE TYPE "cycle_stage" AS ENUM('land_preparation', 'sowing', 'vegetative', 'flowering', 'grain_filling', 'harvest');--> statement-breakpoint
CREATE TYPE "cycle_status" AS ENUM('active', 'closed', 'abandoned');--> statement-breakpoint
CREATE TYPE "delivery_channel" AS ENUM('app', 'sms');--> statement-breakpoint
CREATE TYPE "delivery_status" AS ENUM('queued', 'sent', 'delivered', 'failed');--> statement-breakpoint
CREATE TYPE "diagnosis_review_status" AS ENUM('none', 'pending_da_review', 'reviewed');--> statement-breakpoint
CREATE TYPE "diagnosis_severity" AS ENUM('low', 'moderate', 'high');--> statement-breakpoint
CREATE TYPE "drainage_class" AS ENUM('waterlogs', 'moderate', 'free_draining');--> statement-breakpoint
CREATE TYPE "fertilizer_application_type" AS ENUM('basal', 'urea_1', 'urea_2');--> statement-breakpoint
CREATE TYPE "fertilizer_product" AS ENUM('nps', 'nps_zinc', 'urea');--> statement-breakpoint
CREATE TYPE "grievance_category" AS ENUM('input_shortage', 'pest_outbreak', 'water_conflict', 'adulterated_inputs');--> statement-breakpoint
CREATE TYPE "grievance_priority" AS ENUM('low', 'normal', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "grievance_status" AS ENUM('submitted', 'received', 'assigned', 'in_progress', 'resolved', 'rejected', 'reopened');--> statement-breakpoint
CREATE TYPE "irrigation_method" AS ENUM('flood', 'furrow', 'drip', 'bucket', 'other');--> statement-breakpoint
CREATE TYPE "job_status" AS ENUM('queued', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "ledger_category" AS ENUM('input_cost', 'machinery_oxen_rental', 'labor', 'harvest_revenue', 'other');--> statement-breakpoint
CREATE TYPE "media_kind" AS ENUM('audio', 'image', 'document');--> statement-breakpoint
CREATE TYPE "media_status" AS ENUM('pending', 'uploading', 'uploaded', 'verified', 'failed');--> statement-breakpoint
CREATE TYPE "message_kind" AS ENUM('text', 'audio');--> statement-breakpoint
CREATE TYPE "moderation_status" AS ENUM('pending', 'verified', 'rejected', 'flagged');--> statement-breakpoint
CREATE TYPE "operation_type" AS ENUM('plowing', 'weeding', 'spraying', 'irrigation');--> statement-breakpoint
CREATE TYPE "pest_kind" AS ENUM('pest', 'disease');--> statement-breakpoint
CREATE TYPE "plot_status" AS ENUM('active', 'archived');--> statement-breakpoint
CREATE TYPE "quantity_unit" AS ENUM('quintal', 'kg');--> statement-breakpoint
CREATE TYPE "seed_source" AS ENUM('certified_improved', 'recycled_local', 'other');--> statement-breakpoint
CREATE TYPE "skip_reason" AS ENUM('unavailable', 'unaffordable', 'forgot', 'other');--> statement-breakpoint
CREATE TYPE "soil_class" AS ENUM('koticha_vertisol', 'beda_nitisol', 'sandy', 'clay', 'loam');--> statement-breakpoint
CREATE TYPE "stock_item_type" AS ENUM('urea', 'nps', 'seed');--> statement-breakpoint
CREATE TYPE "stock_movement_type" AS ENUM('receipt', 'issue', 'adjustment');--> statement-breakpoint
CREATE TYPE "survey_status" AS ENUM('draft', 'verified', 'superseded');--> statement-breakpoint
CREATE TYPE "sync_mutation_status" AS ENUM('applied', 'rejected', 'duplicate');--> statement-breakpoint
CREATE TYPE "sync_op" AS ENUM('insert', 'update', 'delete');--> statement-breakpoint
CREATE TYPE "task_status" AS ENUM('open', 'in_progress', 'done', 'cancelled');--> statement-breakpoint
CREATE TYPE "task_type" AS ENUM('field_visit', 'diagnosis_review', 'grievance', 'other');--> statement-breakpoint
CREATE TYPE "user_role" AS ENUM('farmer', 'da', 'officer', 'system_admin');--> statement-breakpoint
CREATE TYPE "weather_alert_type" AS ENUM('frost', 'downpour', 'dry_spell');--> statement-breakpoint
CREATE TYPE "yield_analysis_status" AS ENUM('completed', 'insufficient_data', 'failed', 'top_quartile');--> statement-breakpoint
CREATE TABLE "city_offices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(120) NOT NULL UNIQUE,
	"jurisdiction(MultiPolygon, 4326)" geography,
	"default_language" "app_language" DEFAULT 'am'::"app_language" NOT NULL,
	"parameters" jsonb DEFAULT '{}' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "city_offices_parameters_check" CHECK (jsonb_typeof(parameters) = 'object')
);
--> statement-breakpoint
CREATE TABLE "kebeles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"city_office_id" uuid NOT NULL,
	"name" varchar(120) NOT NULL,
	"boundary(MultiPolygon, 4326)" geography,
	"centroid_lat" numeric(9,6),
	"centroid_lng" numeric(9,6),
	"radius_m" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "kebeles_territory_check" CHECK (boundary is not null or (centroid_lat is not null and centroid_lng is not null and radius_m > 0))
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "farmers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"city_office_id" uuid NOT NULL,
	"user_id" uuid,
	"full_name" varchar(120) NOT NULL,
	"phone_number" varchar(20),
	"no_phone" boolean DEFAULT false NOT NULL,
	"local_id_number" varchar(40) NOT NULL,
	"kebele_id" uuid NOT NULL,
	"assigned_da_id" uuid,
	"registered_by_user_id" uuid,
	"preferred_language" "app_language" DEFAULT 'am'::"app_language" NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"consent_agreed" boolean DEFAULT true NOT NULL,
	"consent_agreed_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "farmers_full_name_check" CHECK (full_name = btrim(full_name) and char_length(full_name) between 2 and 120),
	CONSTRAINT "farmers_no_phone_check" CHECK (no_phone = (phone_number is null)),
	CONSTRAINT "farmers_phone_format_check" CHECK (phone_number is null or phone_number ~ '^\+251[79][0-9]{8}$'),
	CONSTRAINT "farmers_consent_check" CHECK (not consent_agreed or consent_agreed_at is not null)
);
--> statement-breakpoint
CREATE TABLE "plot_crop_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"city_office_id" uuid NOT NULL,
	"farmer_id" uuid NOT NULL,
	"plot_id" uuid NOT NULL,
	"season_year" varchar NOT NULL,
	"crop_id" uuid,
	"fallow" boolean DEFAULT false NOT NULL,
	"created_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "plot_crop_history_fallow_check" CHECK (fallow = (crop_id is null))
);
--> statement-breakpoint
CREATE TABLE "plots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"city_office_id" uuid NOT NULL,
	"farmer_id" uuid NOT NULL,
	"name" varchar(60) NOT NULL,
	"area_value" varchar NOT NULL,
	"area_unit" varchar NOT NULL,
	"conversion_factor_used" varchar NOT NULL,
	"centroid_lat" varchar NOT NULL,
	"centroid_lng" varchar NOT NULL,
	"gps_accuracy_m" varchar NOT NULL,
	"elevation_m" varchar NOT NULL,
	"agro_zone_derived" varchar NOT NULL,
	"agro_zone" varchar NOT NULL,
	"agro_zone_override_reason" varchar(255),
	"kebele_id" uuid,
	"soil_class" varchar,
	"drainage" varchar,
	"planned_crop_id" uuid,
	"planned_season_year" varchar,
	"status" varchar DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "crop_varieties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"city_office_id" uuid NOT NULL,
	"crop_id" uuid NOT NULL,
	"name" varchar(120) NOT NULL,
	"is_certified" boolean DEFAULT true NOT NULL,
	"permitted_zones" "agro_zone"[] NOT NULL,
	"status" "catalog_status" DEFAULT 'active'::"catalog_status" NOT NULL,
	"effective_from" date DEFAULT now() NOT NULL,
	"effective_to" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "crop_varieties_crop_id_name_key" UNIQUE("crop_id","name")
);
--> statement-breakpoint
CREATE TABLE "crops" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"city_office_id" uuid NOT NULL,
	"code" varchar(40) NOT NULL,
	"name_en" varchar(100) NOT NULL,
	"name_am" varchar(100),
	"name_om" varchar(100),
	"name_ti" varchar(100),
	"max_plausible_yield_qt_ha" varchar DEFAULT '80' NOT NULL,
	"weeding_windows" jsonb DEFAULT '[]' NOT NULL,
	"recommended_successors" uuid[] DEFAULT '{}'::uuid[] NOT NULL,
	"status" "catalog_status" DEFAULT 'active'::"catalog_status" NOT NULL,
	"effective_from" date DEFAULT now() NOT NULL,
	"effective_to" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "crops_city_office_id_code_key" UNIQUE("city_office_id","code"),
	CONSTRAINT "crops_weeding_windows_check" CHECK (jsonb_typeof(weeding_windows) = 'array'),
	CONSTRAINT "crops_self_successor_check" CHECK (not (id = any(recommended_successors)))
);
--> statement-breakpoint
CREATE TABLE "fertilizer_rates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"city_office_id" uuid NOT NULL,
	"crop_id" uuid NOT NULL,
	"agro_zone" "agro_zone" NOT NULL,
	"urea_kg_ha" varchar NOT NULL,
	"nps_kg_ha" varchar NOT NULL,
	"seed_kg_ha" varchar NOT NULL,
	"rates_version" varchar NOT NULL,
	"effective_from" date NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fertilizer_rates_office_crop_zone_effective_key" UNIQUE("city_office_id","crop_id","agro_zone","effective_from"),
	CONSTRAINT "fertilizer_rates_check" CHECK (urea_kg_ha::numeric >= 0 and nps_kg_ha::numeric >= 0 and seed_kg_ha::numeric >= 0)
);
--> statement-breakpoint
CREATE TABLE "pest_catalog" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"city_office_id" uuid NOT NULL,
	"code" varchar(60) NOT NULL,
	"kind" "pest_kind" NOT NULL,
	"name" jsonb NOT NULL,
	"prevention_advice" jsonb,
	"reference_media_id" uuid,
	"is_quarantine" boolean DEFAULT false NOT NULL,
	"status" "catalog_status" DEFAULT 'active'::"catalog_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pest_catalog_city_office_id_code_key" UNIQUE("city_office_id","code")
);
--> statement-breakpoint
CREATE TABLE "registered_chemicals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"city_office_id" uuid NOT NULL,
	"brand_name" varchar(150) NOT NULL,
	"active_ingredient" varchar(200) NOT NULL,
	"registration_number" varchar(80) NOT NULL,
	"category" "chemical_category" NOT NULL,
	"dosage_text" jsonb NOT NULL,
	"ppe_text" jsonb,
	"safety_interval_days" varchar NOT NULL,
	"label_media_id" uuid,
	"permitted_zones" "agro_zone"[],
	"target_crop_ids" uuid[] DEFAULT '{}'::uuid[] NOT NULL,
	"target_pest_ids" uuid[] DEFAULT '{}'::uuid[] NOT NULL,
	"status" "catalog_status" DEFAULT 'active'::"catalog_status" NOT NULL,
	"effective_from" date DEFAULT now() NOT NULL,
	"effective_to" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "registered_chemicals_office_registration_key" UNIQUE("city_office_id","registration_number"),
	CONSTRAINT "registered_chemicals_safety_check" CHECK (safety_interval_days::integer >= 0)
);
--> statement-breakpoint
CREATE TABLE "media_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"city_office_id" uuid NOT NULL,
	"owner_user_id" uuid,
	"kind" "media_kind" NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"size_bytes" bigint,
	"duration_s" varchar,
	"storage_key" varchar(500) NOT NULL UNIQUE,
	"sha256" varchar(64),
	"status" "media_status" DEFAULT 'pending'::"media_status" NOT NULL,
	"bytes_received" bigint DEFAULT 0 NOT NULL,
	"upload_id" varchar(200),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_files_size_check" CHECK (size_bytes is null or size_bytes >= 0),
	CONSTRAINT "media_files_duration_check" CHECK (kind <> 'audio' or duration_s is null or duration_s::integer <= 180),
	CONSTRAINT "media_files_sha256_check" CHECK (sha256 is null or sha256 ~ '^[0-9a-f]{64}$')
);
--> statement-breakpoint
CREATE TABLE "crop_cycles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"city_office_id" uuid NOT NULL,
	"farmer_id" uuid NOT NULL,
	"plot_id" uuid NOT NULL,
	"crop_id" uuid NOT NULL,
	"variety_id" uuid,
	"season_year" varchar NOT NULL,
	"stage" "cycle_stage" DEFAULT 'land_preparation'::"cycle_stage" NOT NULL,
	"status" "cycle_status" DEFAULT 'active'::"cycle_status" NOT NULL,
	"stage_changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"stage_changed_by_user_id" uuid,
	"started_on" date NOT NULL,
	"closed_on" date,
	"created_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "fertilizer_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"city_office_id" uuid NOT NULL,
	"farmer_id" uuid NOT NULL,
	"cycle_id" uuid NOT NULL,
	"application_type" "fertilizer_application_type" NOT NULL,
	"fertilizer_product" "fertilizer_product" NOT NULL,
	"applied" boolean DEFAULT true NOT NULL,
	"skip_reason" "skip_reason",
	"quantity_kg" varchar,
	"application_date" date,
	"growth_stage_at_application" "cycle_stage",
	"rate_kg_per_ha" varchar,
	"days_after_sowing" varchar,
	"created_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "fertilizer_logs_product_check" CHECK (
        (application_type = 'basal' and fertilizer_product in ('nps', 'nps_zinc'))
        or (application_type in ('urea_1', 'urea_2') and fertilizer_product = 'urea')
      ),
	CONSTRAINT "fertilizer_logs_applied_check" CHECK (
        (applied and quantity_kg::numeric > 0 and quantity_kg::numeric <= 1000
           and application_date is not null
           and skip_reason is null)
        or
        (not applied and skip_reason is not null
           and quantity_kg is null and application_date is null)
      ),
	CONSTRAINT "fertilizer_logs_growth_stage_check" CHECK (
        not applied
        or application_type = 'basal'
        or growth_stage_at_application is not null
      )
);
--> statement-breakpoint
CREATE TABLE "field_operations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"city_office_id" uuid NOT NULL,
	"farmer_id" uuid NOT NULL,
	"cycle_id" uuid NOT NULL,
	"operation_type" "operation_type" NOT NULL,
	"operation_date" date NOT NULL,
	"sequence_no" varchar,
	"chemical_id" uuid,
	"product_rate" varchar,
	"rate_unit" varchar(20),
	"irrigation_method" "irrigation_method",
	"duration_minutes" varchar,
	"created_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "field_operations_type_check" CHECK (
        (operation_type = 'plowing' and sequence_no::integer between 1 and 10)
        or (operation_type = 'weeding' and sequence_no::integer between 1 and 6)
        or (operation_type = 'spraying'
            and chemical_id is not null and product_rate::numeric > 0 and rate_unit is not null)
        or (operation_type = 'irrigation'
            and irrigation_method is not null and duration_minutes::integer between 1 and 1440)
      )
);
--> statement-breakpoint
CREATE TABLE "harvest_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"city_office_id" uuid NOT NULL,
	"farmer_id" uuid NOT NULL,
	"cycle_id" uuid NOT NULL,
	"harvest_date" date NOT NULL,
	"entered_volume" varchar NOT NULL,
	"entered_unit" "quantity_unit" NOT NULL,
	"yield_qt_per_ha" varchar,
	"plausibility_confirmed" boolean DEFAULT false NOT NULL,
	"created_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "ledger_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"city_office_id" uuid NOT NULL,
	"farmer_id" uuid NOT NULL,
	"cycle_id" uuid NOT NULL,
	"category" "ledger_category" NOT NULL,
	"amount_etb" varchar NOT NULL,
	"entry_date" date NOT NULL,
	"created_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "sowing_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"city_office_id" uuid NOT NULL,
	"farmer_id" uuid NOT NULL,
	"cycle_id" uuid NOT NULL,
	"planting_date" date NOT NULL,
	"seed_variety_id" uuid,
	"seed_variety_other" varchar(120),
	"seed_source" "seed_source" NOT NULL,
	"seed_quantity_kg" varchar NOT NULL,
	"seed_rate_kg_per_ha" varchar,
	"created_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "sowing_logs_variety_check" CHECK (seed_variety_id is not null or seed_variety_other is not null)
);
--> statement-breakpoint
CREATE TABLE "diagnosis_cases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"city_office_id" uuid NOT NULL,
	"farmer_id" uuid NOT NULL,
	"plot_id" uuid NOT NULL,
	"cycle_id" uuid,
	"requested_by_user_id" uuid,
	"photo_media_ids" uuid[] DEFAULT '{}'::uuid[] NOT NULL,
	"job_status" "job_status" DEFAULT 'queued'::"job_status" NOT NULL,
	"context_snapshot" jsonb,
	"raw_result" jsonb,
	"pest_id" uuid,
	"diagnosis_label" varchar(150),
	"confidence" varchar,
	"severity" "diagnosis_severity",
	"filtered_recommendations" jsonb,
	"removed_chemicals" jsonb DEFAULT '[]' NOT NULL,
	"review_status" "diagnosis_review_status" DEFAULT 'none'::"diagnosis_review_status" NOT NULL,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"result_audio_id" uuid,
	"failure_reason" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "diagnosis_cases_confidence_check" CHECK (confidence is null or (confidence::numeric >= 0 and confidence::numeric <= 1)),
	CONSTRAINT "diagnosis_cases_photo_count_check" CHECK (cardinality(photo_media_ids) between 1 and 4)
);
--> statement-breakpoint
CREATE TABLE "outbreak_clusters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"city_office_id" uuid NOT NULL,
	"pest_id" uuid NOT NULL,
	"kebele_id" uuid,
	"centroid(Point, 4326)" geography NOT NULL,
	"radius_m" varchar NOT NULL,
	"case_count" varchar NOT NULL,
	"contributing_case_ids" uuid[] DEFAULT '{}'::uuid[] NOT NULL,
	"window_start" date NOT NULL,
	"window_end" date NOT NULL,
	"status" varchar(10) DEFAULT 'open' NOT NULL,
	"alert_sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "outbreak_clusters_case_count_check" CHECK (case_count::integer >= 1),
	CONSTRAINT "outbreak_clusters_window_check" CHECK (window_end >= window_start),
	CONSTRAINT "outbreak_clusters_status_check" CHECK (status in ('open', 'closed'))
);
--> statement-breakpoint
CREATE TABLE "weather_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"grid_lat" varchar NOT NULL,
	"grid_lng" varchar NOT NULL,
	"alert_type" "weather_alert_type" NOT NULL,
	"starts_on" date NOT NULL,
	"ends_on" date NOT NULL,
	"details" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "weather_alerts_grid_type_starts_key" UNIQUE("grid_lat","grid_lng","alert_type","starts_on"),
	CONSTRAINT "weather_alerts_ends_check" CHECK (ends_on >= starts_on)
);
--> statement-breakpoint
CREATE TABLE "weather_forecasts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"grid_lat" varchar NOT NULL,
	"grid_lng" varchar NOT NULL,
	"fetched_at" timestamp with time zone NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"current_obs" jsonb NOT NULL,
	"daily" jsonb NOT NULL,
	CONSTRAINT "weather_forecasts_grid_key" UNIQUE("grid_lat","grid_lng")
);
--> statement-breakpoint
CREATE TABLE "yield_gap_analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"city_office_id" uuid NOT NULL,
	"farmer_id" uuid NOT NULL,
	"cycle_id" uuid NOT NULL,
	"engine_version" varchar(20) NOT NULL,
	"status" "yield_analysis_status" NOT NULL,
	"cohort_definition" jsonb NOT NULL,
	"cohort_size" varchar NOT NULL,
	"plot_yield_qt_ha" varchar,
	"cohort_median_qt_ha" varchar,
	"cohort_p75_qt_ha" varchar,
	"gap_pct_vs_p75" varchar,
	"factor_results" jsonb DEFAULT '[]' NOT NULL,
	"rain_onset_date" date,
	"top_causes" jsonb DEFAULT '[]' NOT NULL,
	"recommendations" jsonb DEFAULT '[]' NOT NULL,
	"narration_lang" "app_language",
	"narration_text" varchar,
	"narration_audio_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "yield_gap_analyses_cycle_engine_key" UNIQUE("cycle_id","engine_version"),
	CONSTRAINT "yield_gap_analyses_cohort_check" CHECK (status <> 'completed' or cohort_size::integer >= 5),
	CONSTRAINT "yield_gap_analyses_factor_check" CHECK (jsonb_typeof(factor_results) = 'array')
);
--> statement-breakpoint
CREATE TABLE "da_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"city_office_id" uuid NOT NULL,
	"assignee_user_id" uuid NOT NULL,
	"created_by_user_id" uuid,
	"task_type" "task_type" NOT NULL,
	"status" "task_status" DEFAULT 'open'::"task_status" NOT NULL,
	"title" varchar(200) NOT NULL,
	"checklist" jsonb,
	"farmer_id" uuid,
	"plot_id" uuid,
	"grievance_id" uuid,
	"diagnosis_case_id" uuid,
	"due_on" varchar,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grievance_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"city_office_id" uuid NOT NULL,
	"grievance_id" uuid NOT NULL,
	"sender_user_id" uuid NOT NULL,
	"message_type" "message_kind" NOT NULL,
	"text_body" varchar(2000),
	"audio_media_id" uuid,
	"tts_media_id" uuid,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "grievance_messages_content_check" CHECK (
        (message_type = 'text' and text_body is not null)
        or (message_type = 'audio' and audio_media_id is not null)
      )
);
--> statement-breakpoint
CREATE TABLE "grievances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"city_office_id" uuid NOT NULL,
	"farmer_id" uuid NOT NULL,
	"submitted_by_user_id" uuid,
	"category" "grievance_category" NOT NULL,
	"plot_id" uuid,
	"kebele_id" uuid,
	"location_lat" varchar,
	"location_lng" varchar,
	"audio_media_id" uuid,
	"text_note" varchar(1000),
	"pest_id" uuid,
	"status" "grievance_status" DEFAULT 'submitted'::"grievance_status" NOT NULL,
	"priority" "grievance_priority" DEFAULT 'normal'::"grievance_priority" NOT NULL,
	"assignee_user_id" uuid,
	"merged_into_id" uuid,
	"photo_media_ids" uuid[] DEFAULT '{}'::uuid[] NOT NULL,
	"status_history" jsonb DEFAULT '[]' NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"received_at" timestamp with time zone,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "grievances_content_check" CHECK (audio_media_id is not null or text_note is not null),
	CONSTRAINT "grievances_assignee_check" CHECK (status not in ('assigned', 'in_progress') or assignee_user_id is not null),
	CONSTRAINT "grievances_resolved_check" CHECK (resolved_at is null or received_at is null or resolved_at >= received_at),
	CONSTRAINT "grievances_photo_count_check" CHECK (cardinality(photo_media_ids) <= 3),
	CONSTRAINT "grievances_history_check" CHECK (jsonb_typeof(status_history) = 'array')
);
--> statement-breakpoint
CREATE TABLE "crowd_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"city_office_id" uuid NOT NULL,
	"farmer_id" uuid NOT NULL,
	"created_by_user_id" uuid,
	"crop_id" uuid NOT NULL,
	"market_centre_id" uuid NOT NULL,
	"entered_price" varchar NOT NULL,
	"entered_unit" "quantity_unit" NOT NULL,
	"price_etb_per_kg" varchar NOT NULL,
	"volume_kg" varchar NOT NULL,
	"sale_date" date NOT NULL,
	"moderation_status" "moderation_status" DEFAULT 'pending'::"moderation_status" NOT NULL,
	"outlier_flag" boolean DEFAULT false NOT NULL,
	"rejection_reason" varchar(255),
	"moderated_by" uuid,
	"moderated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "crowd_transactions_prices_check" CHECK (
        entered_price::numeric > 0 
        and price_etb_per_kg::numeric > 0 
        and volume_kg::numeric > 0
      ),
	CONSTRAINT "crowd_transactions_rejection_check" CHECK (moderation_status <> 'rejected' or rejection_reason is not null)
);
--> statement-breakpoint
CREATE TABLE "market_centres" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"city_office_id" uuid NOT NULL,
	"name" varchar(80) NOT NULL,
	"is_home" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "market_centres_office_name_key" UNIQUE("city_office_id","name")
);
--> statement-breakpoint
CREATE TABLE "market_surveys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"city_office_id" uuid NOT NULL,
	"market_centre_id" uuid NOT NULL,
	"crop_id" uuid NOT NULL,
	"survey_date" date NOT NULL,
	"entered_unit" "quantity_unit" NOT NULL,
	"min_price_etb_per_kg" varchar NOT NULL,
	"avg_price_etb_per_kg" varchar NOT NULL,
	"max_price_etb_per_kg" varchar NOT NULL,
	"enumerator_user_id" uuid NOT NULL,
	"status" "survey_status" DEFAULT 'draft'::"survey_status" NOT NULL,
	"version" varchar DEFAULT '1' NOT NULL,
	"supersedes_id" uuid,
	"verified_by" uuid,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "market_surveys_prices_check" CHECK (
        min_price_etb_per_kg::numeric > 0
        and min_price_etb_per_kg::numeric <= avg_price_etb_per_kg::numeric
        and avg_price_etb_per_kg::numeric <= max_price_etb_per_kg::numeric
      ),
	CONSTRAINT "market_surveys_verified_check" CHECK (status <> 'verified' or verified_at is not null)
);
--> statement-breakpoint
CREATE TABLE "demand_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"city_office_id" uuid NOT NULL,
	"season_year" varchar NOT NULL,
	"safety_margin_pct" varchar DEFAULT '0' NOT NULL,
	"rates_version_ids" jsonb NOT NULL,
	"result" jsonb NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "demand_snapshots_margin_check" CHECK (safety_margin_pct::numeric between 0 and 30)
);
--> statement-breakpoint
CREATE TABLE "depot_stock_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"depot_id" uuid NOT NULL,
	"item_type" "stock_item_type" NOT NULL,
	"crop_id" uuid,
	"variety_id" uuid,
	"quantity" varchar DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "depot_stock_items_quantity_check" CHECK (quantity::numeric >= 0),
	CONSTRAINT "depot_stock_items_seed_crop_check" CHECK (item_type <> 'seed' or crop_id is not null)
);
--> statement-breakpoint
CREATE TABLE "depot_stock_movements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"depot_stock_item_id" uuid NOT NULL,
	"movement_type" "stock_movement_type" NOT NULL,
	"quantity_delta" varchar NOT NULL,
	"movement_date" date DEFAULT now() NOT NULL,
	"reference_note" varchar(255),
	"status" varchar(20) DEFAULT 'received' NOT NULL,
	"expected_on" date,
	"recorded_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "depot_stock_movements_status_check" CHECK (status in ('expected', 'confirmed', 'received', 'cancelled')),
	CONSTRAINT "depot_stock_movements_quantity_check" CHECK (
        (movement_type = 'receipt' and quantity_delta::numeric > 0)
        or (movement_type = 'issue' and quantity_delta::numeric < 0)
        or (movement_type = 'adjustment' and quantity_delta::numeric <> 0)
      ),
	CONSTRAINT "depot_stock_movements_receipt_check" CHECK (status = 'received' or movement_type = 'receipt')
);
--> statement-breakpoint
CREATE TABLE "depots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"city_office_id" uuid NOT NULL,
	"kebele_id" uuid,
	"name" varchar(120) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "depots_office_name_key" UNIQUE("city_office_id","name")
);
--> statement-breakpoint
CREATE TABLE "announcement_deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"announcement_id" uuid NOT NULL,
	"city_office_id" uuid NOT NULL,
	"farmer_id" uuid NOT NULL,
	"channel" "delivery_channel" NOT NULL,
	"status" "delivery_status" DEFAULT 'queued'::"delivery_status" NOT NULL,
	"provider_message_id" varchar(120),
	"segments" varchar,
	"cost_etb" varchar,
	"failure_reason" varchar(255),
	"queued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sent_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"read_at" timestamp with time zone,
	"acknowledged_at" timestamp with time zone,
	CONSTRAINT "announcement_deliveries_announcement_farmer_channel_key" UNIQUE("announcement_id","farmer_id","channel")
);
--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"city_office_id" uuid NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	"announcement_type" "announcement_type" NOT NULL,
	"status" "announcement_status" DEFAULT 'draft'::"announcement_status" NOT NULL,
	"target_all" boolean DEFAULT true NOT NULL,
	"target_kebele_ids" uuid[] DEFAULT '{}'::uuid[] NOT NULL,
	"target_crop_ids" uuid[] DEFAULT '{}'::uuid[] NOT NULL,
	"target_zones" "agro_zone"[] DEFAULT '{}'::"agro_zone"[] NOT NULL,
	"pest_id" uuid,
	"template_code" varchar(60),
	"template_variables" jsonb,
	"translations" jsonb DEFAULT '{}' NOT NULL,
	"requires_acknowledgement" boolean DEFAULT false NOT NULL,
	"sms_fallback_after_minutes" varchar,
	"expires_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"recalled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "announcements_target_check" CHECK (
        target_all 
        or cardinality(target_kebele_ids) + cardinality(target_crop_ids) + cardinality(target_zones) > 0
      ),
	CONSTRAINT "announcements_published_check" CHECK (status <> 'published' or published_at is not null),
	CONSTRAINT "announcements_translations_type_check" CHECK (jsonb_typeof(translations) = 'object'),
	CONSTRAINT "announcements_translations_keys_check" CHECK ((translations - 'am' - 'om' - 'ti' - 'en') = '{}'::jsonb),
	CONSTRAINT "announcements_translations_draft_check" CHECK (status = 'draft' or translations <> '{}'::jsonb)
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "audit_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"city_office_id" uuid,
	"actor_user_id" uuid,
	"action" varchar(80) NOT NULL,
	"entity_type" varchar(60),
	"entity_id" uuid,
	"changes_json" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "devices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"city_office_id" uuid,
	"device_identifier" varchar(120) NOT NULL,
	"app_version" varchar(20),
	"push_token" varchar,
	"last_cursor" bigint DEFAULT 0 NOT NULL,
	"last_sync_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "devices_user_device_key" UNIQUE("user_id","device_identifier")
);
--> statement-breakpoint
CREATE TABLE "sync_changes" (
	"seq" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sync_changes_seq_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"city_office_id" uuid NOT NULL,
	"entity" varchar(60) NOT NULL,
	"entity_id" uuid NOT NULL,
	"op" "sync_op" NOT NULL,
	"farmer_id" uuid,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sync_mutations" (
	"id" uuid PRIMARY KEY,
	"device_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"city_office_id" uuid NOT NULL,
	"entity" varchar(60) NOT NULL,
	"entity_id" uuid NOT NULL,
	"op" "sync_op" NOT NULL,
	"payload" jsonb NOT NULL,
	"payload_hash" varchar(64) NOT NULL,
	"client_seq" bigint NOT NULL,
	"client_created_at" timestamp with time zone NOT NULL,
	"status" "sync_mutation_status" NOT NULL,
	"reject_reason" varchar(255),
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sync_mutations_hash_check" CHECK (payload_hash ~ '^[0-9a-f]{64}$')
);
--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" ("identifier");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_farmers_phone_active" ON "farmers" ("phone_number") WHERE deleted_at is null and phone_number is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_farmers_local_id_active" ON "farmers" ("city_office_id","local_id_number") WHERE deleted_at is null;--> statement-breakpoint
CREATE INDEX "idx_farmers_office_verified" ON "farmers" ("city_office_id","is_verified") WHERE deleted_at is null;--> statement-breakpoint
CREATE INDEX "idx_farmers_da" ON "farmers" ("assigned_da_id") WHERE deleted_at is null;--> statement-breakpoint
CREATE INDEX "idx_farmers_kebele" ON "farmers" ("kebele_id");--> statement-breakpoint
CREATE INDEX "idx_farmers_name_fts" ON "farmers" USING gin (to_tsvector('simple', full_name));--> statement-breakpoint
CREATE UNIQUE INDEX "uq_plots_name_active" ON "plots" ("farmer_id",lower(name)) WHERE deleted_at is null;--> statement-breakpoint
CREATE INDEX "idx_plots_farmer" ON "plots" ("farmer_id") WHERE deleted_at is null;--> statement-breakpoint
CREATE INDEX "idx_plots_office_kebele" ON "plots" ("city_office_id","kebele_id") WHERE deleted_at is null;--> statement-breakpoint
CREATE INDEX "idx_plots_soil_zone" ON "plots" ("city_office_id","soil_class","agro_zone") WHERE deleted_at is null;--> statement-breakpoint
CREATE INDEX "idx_plots_planned_crop" ON "plots" ("city_office_id","planned_crop_id") WHERE deleted_at is null and planned_crop_id is not null;--> statement-breakpoint
CREATE INDEX "idx_chemicals_target_crops" ON "registered_chemicals" USING gin ("target_crop_ids") WHERE status = 'active';--> statement-breakpoint
CREATE INDEX "idx_chemicals_target_pests" ON "registered_chemicals" USING gin ("target_pest_ids") WHERE status = 'active';--> statement-breakpoint
CREATE INDEX "idx_media_owner" ON "media_files" ("owner_user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_media_status" ON "media_files" ("status") WHERE status in ('pending', 'uploading');--> statement-breakpoint
CREATE UNIQUE INDEX "uq_crop_cycles_one_active" ON "crop_cycles" ("plot_id") WHERE status = 'active' and deleted_at is null;--> statement-breakpoint
CREATE INDEX "idx_cycles_plot" ON "crop_cycles" ("plot_id");--> statement-breakpoint
CREATE INDEX "idx_cycles_cohort" ON "crop_cycles" ("city_office_id","crop_id","season_year","status");--> statement-breakpoint
CREATE INDEX "idx_cycles_farmer" ON "crop_cycles" ("farmer_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_fertilizer_logs_slot_active" ON "fertilizer_logs" ("cycle_id","application_type") WHERE deleted_at is null;--> statement-breakpoint
CREATE INDEX "idx_fertilizer_cycle" ON "fertilizer_logs" ("cycle_id") WHERE deleted_at is null;--> statement-breakpoint
CREATE INDEX "idx_operations_cycle" ON "field_operations" ("cycle_id","operation_type","operation_date") WHERE deleted_at is null;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_harvest_records_cycle_active" ON "harvest_records" ("cycle_id") WHERE deleted_at is null;--> statement-breakpoint
CREATE INDEX "idx_harvest_yield" ON "harvest_records" ("yield_qt_per_ha") WHERE deleted_at is null;--> statement-breakpoint
CREATE INDEX "idx_ledger_cycle" ON "ledger_entries" ("cycle_id") WHERE deleted_at is null;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_sowing_logs_cycle_active" ON "sowing_logs" ("cycle_id") WHERE deleted_at is null;--> statement-breakpoint
CREATE INDEX "idx_diagnosis_plot" ON "diagnosis_cases" ("plot_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_diagnosis_queue" ON "diagnosis_cases" ("job_status") WHERE job_status in ('queued', 'processing');--> statement-breakpoint
CREATE INDEX "idx_diagnosis_review" ON "diagnosis_cases" ("review_status") WHERE review_status = 'pending_da_review';--> statement-breakpoint
CREATE INDEX "idx_outbreak_office" ON "outbreak_clusters" ("city_office_id","status","window_end");--> statement-breakpoint
CREATE INDEX "idx_outbreak_case_ids" ON "outbreak_clusters" USING gin ("contributing_case_ids");--> statement-breakpoint
CREATE INDEX "idx_weather_alerts_grid" ON "weather_alerts" ("grid_lat","grid_lng","starts_on");--> statement-breakpoint
CREATE INDEX "idx_yield_gap_office" ON "yield_gap_analyses" ("city_office_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_da_tasks_assignee" ON "da_tasks" ("assignee_user_id","status");--> statement-breakpoint
CREATE INDEX "idx_grievance_messages" ON "grievance_messages" ("grievance_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_grievance_msg_unread" ON "grievance_messages" ("grievance_id") WHERE read_at is null;--> statement-breakpoint
CREATE INDEX "idx_grievances_triage" ON "grievances" ("city_office_id","status","category","submitted_at");--> statement-breakpoint
CREATE INDEX "idx_grievances_assignee" ON "grievances" ("assignee_user_id","status");--> statement-breakpoint
CREATE INDEX "idx_grievances_farmer" ON "grievances" ("farmer_id","submitted_at");--> statement-breakpoint
CREATE INDEX "idx_crowd_moderation" ON "crowd_transactions" ("city_office_id","moderation_status","created_at") WHERE deleted_at is null;--> statement-breakpoint
CREATE INDEX "idx_crowd_price_window" ON "crowd_transactions" ("crop_id","market_centre_id","sale_date") WHERE moderation_status = 'verified';--> statement-breakpoint
CREATE UNIQUE INDEX "uq_market_centres_one_home" ON "market_centres" ("city_office_id") WHERE is_home;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_market_surveys_current" ON "market_surveys" ("market_centre_id","crop_id","survey_date") WHERE status <> 'superseded';--> statement-breakpoint
CREATE INDEX "idx_surveys_lookup" ON "market_surveys" ("city_office_id","crop_id","market_centre_id","survey_date") WHERE status = 'verified';--> statement-breakpoint
CREATE INDEX "idx_stock_items_depot" ON "depot_stock_items" ("depot_id");--> statement-breakpoint
CREATE INDEX "idx_stock_movements_item" ON "depot_stock_movements" ("depot_stock_item_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_stock_movements_pending" ON "depot_stock_movements" ("depot_stock_item_id","expected_on") WHERE status in ('expected', 'confirmed');--> statement-breakpoint
CREATE INDEX "idx_deliveries_announcement" ON "announcement_deliveries" ("announcement_id","channel","status");--> statement-breakpoint
CREATE INDEX "idx_deliveries_farmer" ON "announcement_deliveries" ("farmer_id","queued_at");--> statement-breakpoint
CREATE INDEX "idx_deliveries_unread" ON "announcement_deliveries" ("farmer_id","queued_at") WHERE channel = 'app' and read_at is null;--> statement-breakpoint
CREATE INDEX "idx_announcements_office" ON "announcements" ("city_office_id","status","published_at");--> statement-breakpoint
CREATE INDEX "idx_audit_office" ON "audit_logs" ("city_office_id","id");--> statement-breakpoint
CREATE INDEX "idx_audit_entity" ON "audit_logs" ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "idx_audit_actor_action" ON "audit_logs" ("actor_user_id","action","created_at");--> statement-breakpoint
CREATE INDEX "idx_devices_user" ON "devices" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_sync_changes_pull" ON "sync_changes" ("city_office_id","seq");--> statement-breakpoint
CREATE INDEX "idx_sync_changes_farmer" ON "sync_changes" ("farmer_id","seq");--> statement-breakpoint
CREATE INDEX "idx_sync_mutations_device" ON "sync_mutations" ("device_id","client_seq");--> statement-breakpoint
ALTER TABLE "kebeles" ADD CONSTRAINT "kebeles_city_office_id_city_offices_id_fkey" FOREIGN KEY ("city_office_id") REFERENCES "city_offices"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "farmers" ADD CONSTRAINT "farmers_city_office_id_city_offices_id_fkey" FOREIGN KEY ("city_office_id") REFERENCES "city_offices"("id");--> statement-breakpoint
ALTER TABLE "farmers" ADD CONSTRAINT "farmers_kebele_id_kebeles_id_fkey" FOREIGN KEY ("kebele_id") REFERENCES "kebeles"("id");--> statement-breakpoint
ALTER TABLE "plot_crop_history" ADD CONSTRAINT "plot_crop_history_city_office_id_city_offices_id_fkey" FOREIGN KEY ("city_office_id") REFERENCES "city_offices"("id");--> statement-breakpoint
ALTER TABLE "plot_crop_history" ADD CONSTRAINT "plot_crop_history_farmer_id_farmers_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "farmers"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "plot_crop_history" ADD CONSTRAINT "plot_crop_history_plot_id_plots_id_fkey" FOREIGN KEY ("plot_id") REFERENCES "plots"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "plots" ADD CONSTRAINT "plots_city_office_id_city_offices_id_fkey" FOREIGN KEY ("city_office_id") REFERENCES "city_offices"("id");--> statement-breakpoint
ALTER TABLE "plots" ADD CONSTRAINT "plots_farmer_id_farmers_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "farmers"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "plots" ADD CONSTRAINT "plots_kebele_id_kebeles_id_fkey" FOREIGN KEY ("kebele_id") REFERENCES "kebeles"("id");--> statement-breakpoint
ALTER TABLE "crop_varieties" ADD CONSTRAINT "crop_varieties_city_office_id_city_offices_id_fkey" FOREIGN KEY ("city_office_id") REFERENCES "city_offices"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "crop_varieties" ADD CONSTRAINT "crop_varieties_crop_id_crops_id_fkey" FOREIGN KEY ("crop_id") REFERENCES "crops"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "crops" ADD CONSTRAINT "crops_city_office_id_city_offices_id_fkey" FOREIGN KEY ("city_office_id") REFERENCES "city_offices"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "fertilizer_rates" ADD CONSTRAINT "fertilizer_rates_city_office_id_city_offices_id_fkey" FOREIGN KEY ("city_office_id") REFERENCES "city_offices"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "fertilizer_rates" ADD CONSTRAINT "fertilizer_rates_crop_id_crops_id_fkey" FOREIGN KEY ("crop_id") REFERENCES "crops"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "pest_catalog" ADD CONSTRAINT "pest_catalog_city_office_id_city_offices_id_fkey" FOREIGN KEY ("city_office_id") REFERENCES "city_offices"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "registered_chemicals" ADD CONSTRAINT "registered_chemicals_city_office_id_city_offices_id_fkey" FOREIGN KEY ("city_office_id") REFERENCES "city_offices"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "media_files" ADD CONSTRAINT "media_files_city_office_id_city_offices_id_fkey" FOREIGN KEY ("city_office_id") REFERENCES "city_offices"("id");--> statement-breakpoint
ALTER TABLE "crop_cycles" ADD CONSTRAINT "crop_cycles_city_office_id_city_offices_id_fkey" FOREIGN KEY ("city_office_id") REFERENCES "city_offices"("id");--> statement-breakpoint
ALTER TABLE "crop_cycles" ADD CONSTRAINT "crop_cycles_farmer_id_farmers_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "farmers"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "crop_cycles" ADD CONSTRAINT "crop_cycles_plot_id_plots_id_fkey" FOREIGN KEY ("plot_id") REFERENCES "plots"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "fertilizer_logs" ADD CONSTRAINT "fertilizer_logs_city_office_id_city_offices_id_fkey" FOREIGN KEY ("city_office_id") REFERENCES "city_offices"("id");--> statement-breakpoint
ALTER TABLE "fertilizer_logs" ADD CONSTRAINT "fertilizer_logs_farmer_id_farmers_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "farmers"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "fertilizer_logs" ADD CONSTRAINT "fertilizer_logs_cycle_id_crop_cycles_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "crop_cycles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "field_operations" ADD CONSTRAINT "field_operations_city_office_id_city_offices_id_fkey" FOREIGN KEY ("city_office_id") REFERENCES "city_offices"("id");--> statement-breakpoint
ALTER TABLE "field_operations" ADD CONSTRAINT "field_operations_farmer_id_farmers_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "farmers"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "field_operations" ADD CONSTRAINT "field_operations_cycle_id_crop_cycles_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "crop_cycles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "harvest_records" ADD CONSTRAINT "harvest_records_city_office_id_city_offices_id_fkey" FOREIGN KEY ("city_office_id") REFERENCES "city_offices"("id");--> statement-breakpoint
ALTER TABLE "harvest_records" ADD CONSTRAINT "harvest_records_farmer_id_farmers_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "farmers"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "harvest_records" ADD CONSTRAINT "harvest_records_cycle_id_crop_cycles_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "crop_cycles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_city_office_id_city_offices_id_fkey" FOREIGN KEY ("city_office_id") REFERENCES "city_offices"("id");--> statement-breakpoint
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_farmer_id_farmers_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "farmers"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_cycle_id_crop_cycles_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "crop_cycles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "sowing_logs" ADD CONSTRAINT "sowing_logs_city_office_id_city_offices_id_fkey" FOREIGN KEY ("city_office_id") REFERENCES "city_offices"("id");--> statement-breakpoint
ALTER TABLE "sowing_logs" ADD CONSTRAINT "sowing_logs_farmer_id_farmers_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "farmers"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "sowing_logs" ADD CONSTRAINT "sowing_logs_cycle_id_crop_cycles_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "crop_cycles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "diagnosis_cases" ADD CONSTRAINT "diagnosis_cases_city_office_id_city_offices_id_fkey" FOREIGN KEY ("city_office_id") REFERENCES "city_offices"("id");--> statement-breakpoint
ALTER TABLE "diagnosis_cases" ADD CONSTRAINT "diagnosis_cases_farmer_id_farmers_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "farmers"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "diagnosis_cases" ADD CONSTRAINT "diagnosis_cases_plot_id_plots_id_fkey" FOREIGN KEY ("plot_id") REFERENCES "plots"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "diagnosis_cases" ADD CONSTRAINT "diagnosis_cases_cycle_id_crop_cycles_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "crop_cycles"("id");--> statement-breakpoint
ALTER TABLE "outbreak_clusters" ADD CONSTRAINT "outbreak_clusters_city_office_id_city_offices_id_fkey" FOREIGN KEY ("city_office_id") REFERENCES "city_offices"("id");--> statement-breakpoint
ALTER TABLE "yield_gap_analyses" ADD CONSTRAINT "yield_gap_analyses_city_office_id_city_offices_id_fkey" FOREIGN KEY ("city_office_id") REFERENCES "city_offices"("id");--> statement-breakpoint
ALTER TABLE "yield_gap_analyses" ADD CONSTRAINT "yield_gap_analyses_farmer_id_farmers_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "farmers"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "yield_gap_analyses" ADD CONSTRAINT "yield_gap_analyses_cycle_id_crop_cycles_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "crop_cycles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "da_tasks" ADD CONSTRAINT "da_tasks_city_office_id_city_offices_id_fkey" FOREIGN KEY ("city_office_id") REFERENCES "city_offices"("id");--> statement-breakpoint
ALTER TABLE "da_tasks" ADD CONSTRAINT "da_tasks_farmer_id_farmers_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "farmers"("id");--> statement-breakpoint
ALTER TABLE "da_tasks" ADD CONSTRAINT "da_tasks_plot_id_plots_id_fkey" FOREIGN KEY ("plot_id") REFERENCES "plots"("id");--> statement-breakpoint
ALTER TABLE "da_tasks" ADD CONSTRAINT "da_tasks_grievance_id_grievances_id_fkey" FOREIGN KEY ("grievance_id") REFERENCES "grievances"("id");--> statement-breakpoint
ALTER TABLE "grievance_messages" ADD CONSTRAINT "grievance_messages_city_office_id_city_offices_id_fkey" FOREIGN KEY ("city_office_id") REFERENCES "city_offices"("id");--> statement-breakpoint
ALTER TABLE "grievance_messages" ADD CONSTRAINT "grievance_messages_grievance_id_grievances_id_fkey" FOREIGN KEY ("grievance_id") REFERENCES "grievances"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "grievances" ADD CONSTRAINT "grievances_city_office_id_city_offices_id_fkey" FOREIGN KEY ("city_office_id") REFERENCES "city_offices"("id");--> statement-breakpoint
ALTER TABLE "grievances" ADD CONSTRAINT "grievances_farmer_id_farmers_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "farmers"("id");--> statement-breakpoint
ALTER TABLE "grievances" ADD CONSTRAINT "grievances_plot_id_plots_id_fkey" FOREIGN KEY ("plot_id") REFERENCES "plots"("id");--> statement-breakpoint
ALTER TABLE "grievances" ADD CONSTRAINT "grievances_kebele_id_kebeles_id_fkey" FOREIGN KEY ("kebele_id") REFERENCES "kebeles"("id");--> statement-breakpoint
ALTER TABLE "grievances" ADD CONSTRAINT "grievances_merged_into_fk" FOREIGN KEY ("merged_into_id") REFERENCES "grievances"("id");--> statement-breakpoint
ALTER TABLE "crowd_transactions" ADD CONSTRAINT "crowd_transactions_city_office_id_city_offices_id_fkey" FOREIGN KEY ("city_office_id") REFERENCES "city_offices"("id");--> statement-breakpoint
ALTER TABLE "crowd_transactions" ADD CONSTRAINT "crowd_transactions_farmer_id_farmers_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "farmers"("id");--> statement-breakpoint
ALTER TABLE "crowd_transactions" ADD CONSTRAINT "crowd_transactions_market_centre_id_market_centres_id_fkey" FOREIGN KEY ("market_centre_id") REFERENCES "market_centres"("id");--> statement-breakpoint
ALTER TABLE "market_centres" ADD CONSTRAINT "market_centres_city_office_id_city_offices_id_fkey" FOREIGN KEY ("city_office_id") REFERENCES "city_offices"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "market_surveys" ADD CONSTRAINT "market_surveys_city_office_id_city_offices_id_fkey" FOREIGN KEY ("city_office_id") REFERENCES "city_offices"("id");--> statement-breakpoint
ALTER TABLE "market_surveys" ADD CONSTRAINT "market_surveys_market_centre_id_market_centres_id_fkey" FOREIGN KEY ("market_centre_id") REFERENCES "market_centres"("id");--> statement-breakpoint
ALTER TABLE "market_surveys" ADD CONSTRAINT "market_surveys_supersedes_id_market_surveys_id_fkey" FOREIGN KEY ("supersedes_id") REFERENCES "market_surveys"("id");--> statement-breakpoint
ALTER TABLE "demand_snapshots" ADD CONSTRAINT "demand_snapshots_city_office_id_city_offices_id_fkey" FOREIGN KEY ("city_office_id") REFERENCES "city_offices"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "depot_stock_items" ADD CONSTRAINT "depot_stock_items_depot_id_depots_id_fkey" FOREIGN KEY ("depot_id") REFERENCES "depots"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "depot_stock_movements" ADD CONSTRAINT "depot_stock_movements_BDfOBEWURiTf_fkey" FOREIGN KEY ("depot_stock_item_id") REFERENCES "depot_stock_items"("id");--> statement-breakpoint
ALTER TABLE "depots" ADD CONSTRAINT "depots_city_office_id_city_offices_id_fkey" FOREIGN KEY ("city_office_id") REFERENCES "city_offices"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "depots" ADD CONSTRAINT "depots_kebele_id_kebeles_id_fkey" FOREIGN KEY ("kebele_id") REFERENCES "kebeles"("id");--> statement-breakpoint
ALTER TABLE "announcement_deliveries" ADD CONSTRAINT "announcement_deliveries_announcement_id_announcements_id_fkey" FOREIGN KEY ("announcement_id") REFERENCES "announcements"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "announcement_deliveries" ADD CONSTRAINT "announcement_deliveries_city_office_id_city_offices_id_fkey" FOREIGN KEY ("city_office_id") REFERENCES "city_offices"("id");--> statement-breakpoint
ALTER TABLE "announcement_deliveries" ADD CONSTRAINT "announcement_deliveries_farmer_id_farmers_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "farmers"("id");--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_city_office_id_city_offices_id_fkey" FOREIGN KEY ("city_office_id") REFERENCES "city_offices"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_city_office_id_city_offices_id_fkey" FOREIGN KEY ("city_office_id") REFERENCES "city_offices"("id");--> statement-breakpoint
ALTER TABLE "devices" ADD CONSTRAINT "devices_city_office_id_city_offices_id_fkey" FOREIGN KEY ("city_office_id") REFERENCES "city_offices"("id");--> statement-breakpoint
ALTER TABLE "sync_mutations" ADD CONSTRAINT "sync_mutations_device_id_devices_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "sync_mutations" ADD CONSTRAINT "sync_mutations_city_office_id_city_offices_id_fkey" FOREIGN KEY ("city_office_id") REFERENCES "city_offices"("id");