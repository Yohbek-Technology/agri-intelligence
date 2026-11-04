CREATE TYPE "activity_type" AS ENUM('PLOWING', 'WEEDING', 'SPRAYING', 'IRRIGATION');--> statement-breakpoint
CREATE TYPE "agro_zone" AS ENUM('DEGA', 'WEYNA_DEGA', 'KOLLA');--> statement-breakpoint
CREATE TYPE "approval_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');--> statement-breakpoint
CREATE TYPE "channel_type" AS ENUM('APP_NEWSFEED', 'SMS', 'PUSH');--> statement-breakpoint
CREATE TYPE "delivery_status" AS ENUM('QUEUED', 'SENT', 'DELIVERED', 'FAILED');--> statement-breakpoint
CREATE TYPE "fertilizer_kind" AS ENUM('UREA', 'NPS', 'DAP', 'COMPOST');--> statement-breakpoint
CREATE TYPE "fertilizer_stage" AS ENUM('BASAL', 'UREA_FIRST', 'UREA_SECOND', 'OTHER');--> statement-breakpoint
CREATE TYPE "grievance_category" AS ENUM('FERTILIZER_SHORTAGE', 'SEED_SHORTAGE', 'PEST_OUTBREAK', 'WATER_CONFLICT', 'ADULTERATED_INPUT', 'OTHER');--> statement-breakpoint
CREATE TYPE "grievance_status" AS ENUM('SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "growth_stage" AS ENUM('LAND_PREPARATION', 'PLANTING', 'GROWING', 'FLOWERING', 'GRAIN_FILLING', 'HARVEST');--> statement-breakpoint
CREATE TYPE "land_unit" AS ENUM('TIMAD', 'KERT', 'HECTARE');--> statement-breakpoint
CREATE TYPE "language_code" AS ENUM('am', 'om', 'ti', 'en');--> statement-breakpoint
CREATE TYPE "season_type" AS ENUM('MEHER', 'BELG');--> statement-breakpoint
CREATE TYPE "severity_level" AS ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');--> statement-breakpoint
CREATE TYPE "soil_type" AS ENUM('KOTICHA_VERTISOL', 'BEDA_NITISOL', 'SANDY', 'CLAY', 'LOAM');--> statement-breakpoint
CREATE TYPE "sync_op_type" AS ENUM('INSERT', 'UPDATE', 'DELETE');--> statement-breakpoint
CREATE TYPE "sync_status" AS ENUM('PENDING', 'APPLIED', 'CONFLICT', 'FAILED');--> statement-breakpoint
CREATE TYPE "txn_category" AS ENUM('SEED', 'FERTILIZER', 'LABOR', 'EQUIPMENT_RENTAL', 'OTHER_EXPENSE', 'CROP_SALE');--> statement-breakpoint
CREATE TYPE "user_role" AS ENUM('FARMER', 'DA', 'CITY_ADMIN', 'SUPER_ADMIN');--> statement-breakpoint
CREATE TYPE "weight_unit" AS ENUM('KG', 'QUINTAL');--> statement-breakpoint
CREATE TABLE "cities" (
	"city_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(100) NOT NULL UNIQUE,
	"region" varchar(100) NOT NULL,
	"center_point" geography(Point,4326),
	"sms_sender_id" varchar(20),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kebeles" (
	"kebele_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"city_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"boundary" geography(MultiPolygon,4326),
	"center_point" geography(Point,4326),
	CONSTRAINT "kebeles_city_id_name_key" UNIQUE("city_id","name")
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"provider_account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"token" text NOT NULL UNIQUE,
	"expires_at" timestamp with time zone NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"city_id" uuid,
	"role" "user_role" NOT NULL,
	"phone_number" varchar(20) NOT NULL UNIQUE,
	"full_name" varchar(150) NOT NULL,
	"email" varchar(255) NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image_url" text,
	"is_phone_verified" boolean DEFAULT false NOT NULL,
	"status" "approval_status" DEFAULT 'PENDING'::"approval_status" NOT NULL,
	"language" "language_code" DEFAULT 'am'::"language_code" NOT NULL,
	"auto_tts" boolean DEFAULT true NOT NULL,
	"voice_nav_enabled" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "devices" (
	"device_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"push_token" text,
	"is_shared_device" boolean DEFAULT false NOT NULL,
	"last_sync_at" timestamp with time zone,
	"last_sync_cursor" bigint DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "farmers" (
	"farmer_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid UNIQUE,
	"city_id" uuid NOT NULL,
	"kebele_id" uuid NOT NULL,
	"agent_id" uuid,
	"local_id_number" varchar(50),
	"full_name" varchar(150) NOT NULL,
	"phone_number" varchar(20),
	"gender" char(1),
	"literacy_level" varchar(10),
	"status" "approval_status" DEFAULT 'PENDING'::"approval_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"sync_version" bigint DEFAULT 0 NOT NULL,
	CONSTRAINT "farmers_city_id_local_id_number_key" UNIQUE("city_id","local_id_number"),
	CONSTRAINT "farmers_gender_check" CHECK (gender in ('M','F')),
	CONSTRAINT "farmers_literacy_check" CHECK (literacy_level in ('NONE','BASIC','FULL'))
);
--> statement-breakpoint
CREATE TABLE "field_agents" (
	"agent_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL UNIQUE,
	"city_id" uuid NOT NULL,
	"specialization" varchar(100),
	"max_farmers" smallint DEFAULT 50 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plots" (
	"plot_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"farmer_id" uuid NOT NULL,
	"city_id" uuid NOT NULL,
	"kebele_id" uuid NOT NULL,
	"plot_name" varchar(100) NOT NULL,
	"landmark" varchar(200),
	"area_value" numeric(10,3) NOT NULL,
	"area_unit" "land_unit" NOT NULL,
	"area_hectares" numeric(10,4) NOT NULL,
	"location" geography(Point,4326),
	"boundary" geography(Polygon,4326),
	"gps_captured_at" timestamp with time zone,
	"altitude_m" integer,
	"zone" "agro_zone",
	"soil" "soil_type" NOT NULL,
	"drainage" varchar(10),
	"rotation_plan" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"sync_version" bigint DEFAULT 0 NOT NULL,
	CONSTRAINT "plots_area_value_check" CHECK (area_value > 0),
	CONSTRAINT "plots_drainage_check" CHECK (drainage in ('POOR','MODERATE','GOOD','EXCESSIVE'))
);
--> statement-breakpoint
CREATE TABLE "city_pesticides" (
	"city_id" uuid,
	"pesticide_id" uuid,
	"is_available" boolean DEFAULT true NOT NULL,
	"verified_at" timestamp with time zone,
	CONSTRAINT "city_pesticides_pkey" PRIMARY KEY("city_id","pesticide_id")
);
--> statement-breakpoint
CREATE TABLE "crop_varieties" (
	"variety_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"crop_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"seed_class" varchar(20) NOT NULL,
	"potential_yield_qt_ha" numeric(8,2),
	"suitable_zones" "agro_zone"[],
	"is_approved" boolean DEFAULT true NOT NULL,
	CONSTRAINT "crop_varieties_crop_id_name_key" UNIQUE("crop_id","name"),
	CONSTRAINT "crop_varieties_seed_class_check" CHECK (seed_class in ('CERTIFIED_IMPROVED','RECYCLED_IMPROVED','LOCAL_LANDRACE'))
);
--> statement-breakpoint
CREATE TABLE "crops" (
	"crop_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"code" varchar(30) NOT NULL UNIQUE,
	"name_en" varchar(60) NOT NULL,
	"seed_rate_kg_ha" numeric(8,2),
	"urea_kg_ha" numeric(8,2),
	"nps_kg_ha" numeric(8,2),
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pesticides" (
	"pesticide_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"trade_name" varchar(100) NOT NULL,
	"active_ingredient" varchar(150) NOT NULL,
	"registration_number" varchar(60) UNIQUE,
	"is_registered" boolean DEFAULT true NOT NULL,
	"registration_expiry" date,
	"target_pest_ids" uuid[],
	"target_crop_ids" uuid[],
	"dosage_instructions" text,
	"rain_free_hours" smallint,
	"safety_notes" text
);
--> statement-breakpoint
CREATE TABLE "pests_diseases" (
	"pest_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"code" varchar(40) NOT NULL UNIQUE,
	"name_en" varchar(100) NOT NULL,
	"kind" varchar(10) NOT NULL,
	"is_quarantine" boolean DEFAULT false NOT NULL,
	"symptoms" text,
	"management_advice" text,
	CONSTRAINT "pests_diseases_kind_check" CHECK (kind in ('PEST','DISEASE','WEED','DEFICIENCY'))
);
--> statement-breakpoint
CREATE TABLE "crop_cycles" (
	"cycle_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"plot_id" uuid NOT NULL,
	"season_year" smallint NOT NULL,
	"season" "season_type" NOT NULL,
	"crop_id" uuid NOT NULL,
	"variety_id" uuid,
	"current_stage" "growth_stage" DEFAULT 'LAND_PREPARATION'::"growth_stage" NOT NULL,
	"stage_updated_at" timestamp with time zone,
	"status" varchar(10) DEFAULT 'ACTIVE' NOT NULL,
	"planting_date" date,
	"seed_type" varchar(100),
	"seed_source" varchar(12),
	"seed_amount_kg" numeric(10,2),
	"harvest_date" date,
	"harvest_value" numeric(12,2),
	"harvest_unit" "weight_unit",
	"harvest_kg" numeric(12,2),
	"yield_qt_ha" numeric(8,2),
	"grain_moisture_pct" numeric(4,1),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"sync_version" bigint DEFAULT 0 NOT NULL,
	CONSTRAINT "crop_cycles_status_check" CHECK (status in ('ACTIVE','HARVESTED','FAILED','ABANDONED')),
	CONSTRAINT "crop_cycles_seed_source_check" CHECK (seed_source in ('COOPERATIVE','MARKET','SAVED','OTHER'))
);
--> statement-breakpoint
CREATE TABLE "farm_activities" (
	"activity_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"cycle_id" uuid NOT NULL,
	"activity" "activity_type" NOT NULL,
	"activity_date" date NOT NULL,
	"quantity" numeric(10,2),
	"quantity_unit" varchar(20),
	"pesticide_id" uuid,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"sync_version" bigint DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "farm_transactions" (
	"txn_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"cycle_id" uuid NOT NULL,
	"category" "txn_category" NOT NULL,
	"is_income" boolean NOT NULL,
	"amount_etb" numeric(14,2) NOT NULL,
	"txn_date" date NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"sync_version" bigint DEFAULT 0 NOT NULL,
	CONSTRAINT "farm_transactions_amount_check" CHECK (amount_etb >= 0),
	CONSTRAINT "farm_transactions_income_category_check" CHECK ((category = 'CROP_SALE') = is_income)
);
--> statement-breakpoint
CREATE TABLE "fertilizer_applications" (
	"application_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"cycle_id" uuid NOT NULL,
	"fertilizer" "fertilizer_kind" NOT NULL,
	"stage" "fertilizer_stage" NOT NULL,
	"amount_kg" numeric(10,2) NOT NULL,
	"application_date" date NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"sync_version" bigint DEFAULT 0 NOT NULL,
	CONSTRAINT "fertilizer_applications_amount_check" CHECK (amount_kg > 0)
);
--> statement-breakpoint
CREATE TABLE "crop_rotation_rules" (
	"rule_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"previous_crop_id" uuid NOT NULL,
	"next_crop_id" uuid NOT NULL,
	"zone" "agro_zone",
	"soil" "soil_type",
	"score" smallint NOT NULL,
	"rationale" text,
	CONSTRAINT "crop_rotation_rules_score_check" CHECK (score between 0 and 100)
);
--> statement-breakpoint
CREATE TABLE "pest_diagnoses" (
	"diagnosis_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"farmer_id" uuid NOT NULL,
	"plot_id" uuid,
	"cycle_id" uuid,
	"kebele_id" uuid,
	"location" geography(Point,4326),
	"image_urls" text[] NOT NULL,
	"image_public_ids" text[],
	"ai_context" jsonb,
	"ai_result" jsonb,
	"pest_id" uuid,
	"confidence" numeric(4,3),
	"severity" "severity_level",
	"explanation_text" text,
	"explanation_audio_url" text,
	"explanation_audio_public_id" varchar(255),
	"recommended_pesticide_ids" uuid[],
	"needs_expert_review" boolean DEFAULT false NOT NULL,
	"review_outcome" varchar(10),
	"reviewed_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"sync_version" bigint DEFAULT 0 NOT NULL,
	CONSTRAINT "pest_diagnoses_confidence_check" CHECK (confidence between 0 and 1),
	CONSTRAINT "pest_diagnoses_review_outcome_check" CHECK (review_outcome in ('CONFIRMED','CORRECTED','REJECTED'))
);
--> statement-breakpoint
CREATE TABLE "weather_forecasts" (
	"forecast_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"kebele_id" uuid,
	"plot_id" uuid,
	"location" geography(Point,4326) NOT NULL,
	"forecast_date" date NOT NULL,
	"temp_min_c" numeric(4,1),
	"temp_max_c" numeric(4,1),
	"rain_probability_pct" smallint,
	"rain_mm" numeric(6,1),
	"humidity_pct" smallint,
	"wind_kmh" numeric(5,1),
	"est_soil_moisture" varchar(12),
	"plowing_ok" boolean,
	"spraying_ok" boolean,
	"spray_washoff_risk" boolean,
	"harvest_dry_ok" boolean,
	"advice_text" text,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "weather_forecasts_rain_prob_check" CHECK (rain_probability_pct between 0 and 100),
	CONSTRAINT "weather_forecasts_soil_moisture_check" CHECK (est_soil_moisture in ('DRY','OPTIMAL','WET','WATERLOGGED'))
);
--> statement-breakpoint
CREATE TABLE "yield_benchmarks" (
	"benchmark_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"city_id" uuid NOT NULL,
	"crop_id" uuid NOT NULL,
	"soil" "soil_type" NOT NULL,
	"season_year" smallint NOT NULL,
	"season" "season_type" NOT NULL,
	"sample_size" integer NOT NULL,
	"median_yield_qt_ha" numeric(8,2),
	"top_yield_qt_ha" numeric(8,2),
	"avg_urea_kg_ha" numeric(8,2),
	"avg_nps_kg_ha" numeric(8,2),
	"avg_planting_doy" smallint,
	"avg_first_weeding_dap" smallint,
	"computed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "yield_benchmarks_city_crop_soil_year_season_key" UNIQUE("city_id","crop_id","soil","season_year","season")
);
--> statement-breakpoint
CREATE TABLE "yield_gap_analyses" (
	"analysis_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"cycle_id" uuid NOT NULL,
	"benchmark_id" uuid,
	"own_yield_qt_ha" numeric(8,2),
	"target_yield_qt_ha" numeric(8,2),
	"gap_pct" numeric(5,1),
	"factors" jsonb,
	"recommendations" jsonb,
	"summary_text" text,
	"summary_audio_url" text,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grievance_responses" (
	"response_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"grievance_id" uuid NOT NULL,
	"responder_id" uuid NOT NULL,
	"new_status" "grievance_status",
	"message_text" text,
	"audio_url" text,
	"audio_public_id" varchar(255),
	"audio_duration_sec" integer,
	"is_read_by_farmer" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grievances" (
	"grievance_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"farmer_id" uuid NOT NULL,
	"city_id" uuid NOT NULL,
	"kebele_id" uuid,
	"plot_id" uuid,
	"category" "grievance_category" NOT NULL,
	"pest_id" uuid,
	"description_text" text,
	"audio_url" text,
	"audio_public_id" varchar(255),
	"audio_duration_sec" integer,
	"audio_format" varchar(10),
	"audio_language" "language_code",
	"location" geography(Point,4326),
	"severity" "severity_level",
	"status" "grievance_status" DEFAULT 'SUBMITTED'::"grievance_status" NOT NULL,
	"assigned_to" uuid,
	"assigned_at" timestamp with time zone,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"sync_version" bigint DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "announcement_deliveries" (
	"delivery_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"announcement_id" uuid NOT NULL,
	"farmer_id" uuid NOT NULL,
	"channel" "channel_type" NOT NULL,
	"status" "delivery_status" DEFAULT 'QUEUED'::"delivery_status" NOT NULL,
	"error_message" text,
	"sent_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "announcements" (
	"announcement_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"city_id" uuid NOT NULL,
	"created_by" uuid,
	"type" varchar(20) NOT NULL,
	"pest_id" uuid,
	"severity" "severity_level" DEFAULT 'LOW'::"severity_level" NOT NULL,
	"language" "language_code" DEFAULT 'am'::"language_code" NOT NULL,
	"title" varchar(200) NOT NULL,
	"body" text NOT NULL,
	"sms_text" varchar(480),
	"audio_url" text,
	"audio_public_id" varchar(255),
	"audio_duration_sec" integer,
	"channels" "channel_type"[] NOT NULL,
	"target_kebele_ids" uuid[],
	"published_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "announcements_type_check" CHECK (type in ('SEASONAL_ADVICE','INPUT_AVAILABILITY','EMERGENCY','QUARANTINE','WEATHER_ALERT','WEEKLY_WEATHER'))
);
--> statement-breakpoint
CREATE TABLE "knowledge_articles" (
	"article_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"crop_id" uuid,
	"topic" varchar(20) NOT NULL,
	"language" "language_code" NOT NULL,
	"title" varchar(200) NOT NULL,
	"content" text NOT NULL,
	"target_moisture_pct" numeric(4,1),
	"audio_url" text,
	CONSTRAINT "knowledge_articles_topic_check" CHECK (topic in ('MOISTURE_TEST','HERMETIC_BAG','STORAGE_PESTS','GENERAL'))
);
--> statement-breakpoint
CREATE TABLE "outbreak_cluster_alerts" (
	"cluster_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"city_id" uuid NOT NULL,
	"pest_id" uuid NOT NULL,
	"center_point" geography(Point,4326) NOT NULL,
	"radius_m" integer NOT NULL,
	"case_count" integer NOT NULL,
	"severity" "severity_level" NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coop_depots" (
	"depot_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"city_id" uuid NOT NULL,
	"kebele_id" uuid,
	"name" varchar(150) NOT NULL,
	"manager_name" varchar(150),
	"manager_phone" varchar(20),
	"location" geography(Point,4326)
);
--> statement-breakpoint
CREATE TABLE "depot_inventory" (
	"inventory_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"depot_id" uuid NOT NULL,
	"item_kind" varchar(10) NOT NULL,
	"fertilizer" "fertilizer_kind",
	"variety_id" uuid,
	"quantity_kg" numeric(14,2) DEFAULT '0' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "depot_inventory_item_kind_check" CHECK (item_kind in ('FERTILIZER','SEED')),
	CONSTRAINT "depot_inventory_consistency_check" CHECK ((item_kind='FERTILIZER' AND fertilizer IS NOT NULL AND variety_id IS NULL) OR (item_kind='SEED' AND variety_id IS NOT NULL AND fertilizer IS NULL))
);
--> statement-breakpoint
CREATE TABLE "input_demand_reports" (
	"report_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"city_id" uuid NOT NULL,
	"kebele_id" uuid,
	"crop_id" uuid NOT NULL,
	"season_year" smallint NOT NULL,
	"season" "season_type" NOT NULL,
	"area_ha" numeric(14,2) NOT NULL,
	"urea_kg_required" numeric(14,2),
	"nps_kg_required" numeric(14,2),
	"seed_kg_required" numeric(14,2),
	"urea_kg_in_stock" numeric(14,2),
	"nps_kg_in_stock" numeric(14,2),
	"seed_kg_in_stock" numeric(14,2),
	"shortfall" boolean DEFAULT false NOT NULL,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "yield_audits" (
	"audit_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"city_id" uuid NOT NULL,
	"cycle_id" uuid NOT NULL,
	"opened_by" uuid NOT NULL,
	"suspected_cause" varchar(20),
	"finding" text,
	"status" varchar(10) DEFAULT 'OPEN' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"closed_at" timestamp with time zone,
	CONSTRAINT "yield_audits_suspected_cause_check" CHECK (suspected_cause is null or suspected_cause in ('FERTILIZER_DOSE','UREA_TIMING','SOWING_DATE','WEEDING','SEED_VARIETY','WEATHER','PEST','OTHER')),
	CONSTRAINT "yield_audits_status_check" CHECK (status in ('OPEN','IN_REVIEW','CLOSED'))
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"audit_log_id" bigserial PRIMARY KEY,
	"user_id" uuid,
	"city_id" uuid,
	"action" varchar(60) NOT NULL,
	"entity_table" varchar(60),
	"entity_id" uuid,
	"details" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sync_change_log" (
	"change_id" bigserial PRIMARY KEY,
	"table_name" varchar(60) NOT NULL,
	"record_id" uuid NOT NULL,
	"op_type" "sync_op_type" NOT NULL,
	"city_id" uuid,
	"farmer_id" uuid,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sync_queue" (
	"op_id" uuid PRIMARY KEY,
	"batch_id" uuid NOT NULL,
	"device_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"on_behalf_of_farmer_id" uuid,
	"seq_no" integer NOT NULL,
	"table_name" varchar(60) NOT NULL,
	"record_id" uuid NOT NULL,
	"op_type" "sync_op_type" NOT NULL,
	"payload" jsonb,
	"base_version" bigint,
	"client_ts" timestamp with time zone NOT NULL,
	"status" "sync_status" DEFAULT 'PENDING'::"sync_status" NOT NULL,
	"server_value" jsonb,
	"resolution" varchar(12),
	"error_message" text,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sync_queue_resolution_check" CHECK (resolution is null or resolution in ('SERVER_WINS','CLIENT_WINS','MERGED','MANUAL'))
);
--> statement-breakpoint
CREATE INDEX "idx_accounts_user" ON "accounts" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_sessions_user" ON "sessions" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_verifications_identifier" ON "verifications" ("identifier","expires_at");--> statement-breakpoint
CREATE INDEX "idx_farmers_city_kebele" ON "farmers" ("city_id","kebele_id") WHERE deleted_at is null;--> statement-breakpoint
CREATE INDEX "idx_farmers_agent" ON "farmers" ("agent_id");--> statement-breakpoint
CREATE INDEX "idx_plots_boundary" ON "plots" USING gist ("boundary");--> statement-breakpoint
CREATE INDEX "idx_plots_farmer" ON "plots" ("farmer_id") WHERE deleted_at is null;--> statement-breakpoint
CREATE INDEX "idx_plots_kebele" ON "plots" ("kebele_id");--> statement-breakpoint
CREATE INDEX "idx_plots_location" ON "plots" USING gist ("location");--> statement-breakpoint
CREATE INDEX "idx_cycles_plot_season" ON "crop_cycles" ("plot_id","season_year","season");--> statement-breakpoint
CREATE INDEX "idx_cycles_crop" ON "crop_cycles" ("crop_id","season_year");--> statement-breakpoint
CREATE INDEX "idx_activity_cycle" ON "farm_activities" ("cycle_id","activity");--> statement-breakpoint
CREATE INDEX "idx_txn_cycle" ON "farm_transactions" ("cycle_id");--> statement-breakpoint
CREATE INDEX "idx_fert_cycle" ON "fertilizer_applications" ("cycle_id");--> statement-breakpoint
CREATE INDEX "idx_diag_kebele_time" ON "pest_diagnoses" ("kebele_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_diag_location" ON "pest_diagnoses" USING gist ("location");--> statement-breakpoint
CREATE INDEX "idx_weather_date" ON "weather_forecasts" ("forecast_date","kebele_id");--> statement-breakpoint
CREATE INDEX "idx_griev_city_status" ON "grievances" ("city_id","status","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_griev_assignee" ON "grievances" ("assigned_to","status");--> statement-breakpoint
CREATE INDEX "idx_deliveries" ON "announcement_deliveries" ("announcement_id","status");--> statement-breakpoint
CREATE INDEX "idx_outbreak_active" ON "outbreak_cluster_alerts" ("city_id","is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_depot_fert" ON "depot_inventory" ("depot_id","fertilizer") WHERE item_kind = 'FERTILIZER';--> statement-breakpoint
CREATE UNIQUE INDEX "uq_depot_seed" ON "depot_inventory" ("depot_id","variety_id") WHERE item_kind = 'SEED';--> statement-breakpoint
CREATE INDEX "idx_changelog_scope" ON "sync_change_log" ("city_id","change_id");--> statement-breakpoint
CREATE INDEX "idx_syncq_batch" ON "sync_queue" ("batch_id","seq_no");--> statement-breakpoint
ALTER TABLE "kebeles" ADD CONSTRAINT "kebeles_city_id_cities_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("city_id");--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_city_id_cities_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("city_id");--> statement-breakpoint
ALTER TABLE "devices" ADD CONSTRAINT "devices_user_id_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id");--> statement-breakpoint
ALTER TABLE "farmers" ADD CONSTRAINT "farmers_user_id_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id");--> statement-breakpoint
ALTER TABLE "farmers" ADD CONSTRAINT "farmers_city_id_cities_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("city_id");--> statement-breakpoint
ALTER TABLE "farmers" ADD CONSTRAINT "farmers_kebele_id_kebeles_kebele_id_fkey" FOREIGN KEY ("kebele_id") REFERENCES "kebeles"("kebele_id");--> statement-breakpoint
ALTER TABLE "farmers" ADD CONSTRAINT "farmers_agent_id_field_agents_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "field_agents"("agent_id");--> statement-breakpoint
ALTER TABLE "field_agents" ADD CONSTRAINT "field_agents_user_id_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id");--> statement-breakpoint
ALTER TABLE "field_agents" ADD CONSTRAINT "field_agents_city_id_cities_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("city_id");--> statement-breakpoint
ALTER TABLE "plots" ADD CONSTRAINT "plots_farmer_id_farmers_farmer_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "farmers"("farmer_id");--> statement-breakpoint
ALTER TABLE "plots" ADD CONSTRAINT "plots_city_id_cities_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("city_id");--> statement-breakpoint
ALTER TABLE "plots" ADD CONSTRAINT "plots_kebele_id_kebeles_kebele_id_fkey" FOREIGN KEY ("kebele_id") REFERENCES "kebeles"("kebele_id");--> statement-breakpoint
ALTER TABLE "city_pesticides" ADD CONSTRAINT "city_pesticides_city_id_cities_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("city_id");--> statement-breakpoint
ALTER TABLE "city_pesticides" ADD CONSTRAINT "city_pesticides_pesticide_id_pesticides_pesticide_id_fkey" FOREIGN KEY ("pesticide_id") REFERENCES "pesticides"("pesticide_id");--> statement-breakpoint
ALTER TABLE "crop_varieties" ADD CONSTRAINT "crop_varieties_crop_id_crops_crop_id_fkey" FOREIGN KEY ("crop_id") REFERENCES "crops"("crop_id");--> statement-breakpoint
ALTER TABLE "crop_cycles" ADD CONSTRAINT "crop_cycles_plot_id_plots_plot_id_fkey" FOREIGN KEY ("plot_id") REFERENCES "plots"("plot_id");--> statement-breakpoint
ALTER TABLE "crop_cycles" ADD CONSTRAINT "crop_cycles_crop_id_crops_crop_id_fkey" FOREIGN KEY ("crop_id") REFERENCES "crops"("crop_id");--> statement-breakpoint
ALTER TABLE "crop_cycles" ADD CONSTRAINT "crop_cycles_variety_id_crop_varieties_variety_id_fkey" FOREIGN KEY ("variety_id") REFERENCES "crop_varieties"("variety_id");--> statement-breakpoint
ALTER TABLE "farm_activities" ADD CONSTRAINT "farm_activities_cycle_id_crop_cycles_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "crop_cycles"("cycle_id");--> statement-breakpoint
ALTER TABLE "farm_activities" ADD CONSTRAINT "farm_activities_pesticide_id_pesticides_pesticide_id_fkey" FOREIGN KEY ("pesticide_id") REFERENCES "pesticides"("pesticide_id");--> statement-breakpoint
ALTER TABLE "farm_transactions" ADD CONSTRAINT "farm_transactions_cycle_id_crop_cycles_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "crop_cycles"("cycle_id");--> statement-breakpoint
ALTER TABLE "fertilizer_applications" ADD CONSTRAINT "fertilizer_applications_cycle_id_crop_cycles_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "crop_cycles"("cycle_id");--> statement-breakpoint
ALTER TABLE "crop_rotation_rules" ADD CONSTRAINT "crop_rotation_rules_previous_crop_id_crops_crop_id_fkey" FOREIGN KEY ("previous_crop_id") REFERENCES "crops"("crop_id");--> statement-breakpoint
ALTER TABLE "crop_rotation_rules" ADD CONSTRAINT "crop_rotation_rules_next_crop_id_crops_crop_id_fkey" FOREIGN KEY ("next_crop_id") REFERENCES "crops"("crop_id");--> statement-breakpoint
ALTER TABLE "pest_diagnoses" ADD CONSTRAINT "pest_diagnoses_farmer_id_farmers_farmer_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "farmers"("farmer_id");--> statement-breakpoint
ALTER TABLE "pest_diagnoses" ADD CONSTRAINT "pest_diagnoses_plot_id_plots_plot_id_fkey" FOREIGN KEY ("plot_id") REFERENCES "plots"("plot_id");--> statement-breakpoint
ALTER TABLE "pest_diagnoses" ADD CONSTRAINT "pest_diagnoses_cycle_id_crop_cycles_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "crop_cycles"("cycle_id");--> statement-breakpoint
ALTER TABLE "pest_diagnoses" ADD CONSTRAINT "pest_diagnoses_kebele_id_kebeles_kebele_id_fkey" FOREIGN KEY ("kebele_id") REFERENCES "kebeles"("kebele_id");--> statement-breakpoint
ALTER TABLE "pest_diagnoses" ADD CONSTRAINT "pest_diagnoses_pest_id_pests_diseases_pest_id_fkey" FOREIGN KEY ("pest_id") REFERENCES "pests_diseases"("pest_id");--> statement-breakpoint
ALTER TABLE "pest_diagnoses" ADD CONSTRAINT "pest_diagnoses_reviewed_by_users_user_id_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("user_id");--> statement-breakpoint
ALTER TABLE "weather_forecasts" ADD CONSTRAINT "weather_forecasts_kebele_id_kebeles_kebele_id_fkey" FOREIGN KEY ("kebele_id") REFERENCES "kebeles"("kebele_id");--> statement-breakpoint
ALTER TABLE "weather_forecasts" ADD CONSTRAINT "weather_forecasts_plot_id_plots_plot_id_fkey" FOREIGN KEY ("plot_id") REFERENCES "plots"("plot_id");--> statement-breakpoint
ALTER TABLE "yield_benchmarks" ADD CONSTRAINT "yield_benchmarks_city_id_cities_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("city_id");--> statement-breakpoint
ALTER TABLE "yield_benchmarks" ADD CONSTRAINT "yield_benchmarks_crop_id_crops_crop_id_fkey" FOREIGN KEY ("crop_id") REFERENCES "crops"("crop_id");--> statement-breakpoint
ALTER TABLE "yield_gap_analyses" ADD CONSTRAINT "yield_gap_analyses_cycle_id_crop_cycles_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "crop_cycles"("cycle_id");--> statement-breakpoint
ALTER TABLE "yield_gap_analyses" ADD CONSTRAINT "yield_gap_analyses_VL502d9IO7Lc_fkey" FOREIGN KEY ("benchmark_id") REFERENCES "yield_benchmarks"("benchmark_id");--> statement-breakpoint
ALTER TABLE "grievance_responses" ADD CONSTRAINT "grievance_responses_grievance_id_grievances_grievance_id_fkey" FOREIGN KEY ("grievance_id") REFERENCES "grievances"("grievance_id");--> statement-breakpoint
ALTER TABLE "grievance_responses" ADD CONSTRAINT "grievance_responses_responder_id_users_user_id_fkey" FOREIGN KEY ("responder_id") REFERENCES "users"("user_id");--> statement-breakpoint
ALTER TABLE "grievances" ADD CONSTRAINT "grievances_farmer_id_farmers_farmer_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "farmers"("farmer_id");--> statement-breakpoint
ALTER TABLE "grievances" ADD CONSTRAINT "grievances_city_id_cities_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("city_id");--> statement-breakpoint
ALTER TABLE "grievances" ADD CONSTRAINT "grievances_kebele_id_kebeles_kebele_id_fkey" FOREIGN KEY ("kebele_id") REFERENCES "kebeles"("kebele_id");--> statement-breakpoint
ALTER TABLE "grievances" ADD CONSTRAINT "grievances_plot_id_plots_plot_id_fkey" FOREIGN KEY ("plot_id") REFERENCES "plots"("plot_id");--> statement-breakpoint
ALTER TABLE "grievances" ADD CONSTRAINT "grievances_pest_id_pests_diseases_pest_id_fkey" FOREIGN KEY ("pest_id") REFERENCES "pests_diseases"("pest_id");--> statement-breakpoint
ALTER TABLE "grievances" ADD CONSTRAINT "grievances_assigned_to_field_agents_agent_id_fkey" FOREIGN KEY ("assigned_to") REFERENCES "field_agents"("agent_id");--> statement-breakpoint
ALTER TABLE "announcement_deliveries" ADD CONSTRAINT "announcement_deliveries_6PD9TzQohs1r_fkey" FOREIGN KEY ("announcement_id") REFERENCES "announcements"("announcement_id");--> statement-breakpoint
ALTER TABLE "announcement_deliveries" ADD CONSTRAINT "announcement_deliveries_farmer_id_farmers_farmer_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "farmers"("farmer_id");--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_city_id_cities_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("city_id");--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_created_by_users_user_id_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id");--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_pest_id_pests_diseases_pest_id_fkey" FOREIGN KEY ("pest_id") REFERENCES "pests_diseases"("pest_id");--> statement-breakpoint
ALTER TABLE "knowledge_articles" ADD CONSTRAINT "knowledge_articles_crop_id_crops_crop_id_fkey" FOREIGN KEY ("crop_id") REFERENCES "crops"("crop_id");--> statement-breakpoint
ALTER TABLE "outbreak_cluster_alerts" ADD CONSTRAINT "outbreak_cluster_alerts_city_id_cities_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("city_id");--> statement-breakpoint
ALTER TABLE "outbreak_cluster_alerts" ADD CONSTRAINT "outbreak_cluster_alerts_pest_id_pests_diseases_pest_id_fkey" FOREIGN KEY ("pest_id") REFERENCES "pests_diseases"("pest_id");--> statement-breakpoint
ALTER TABLE "coop_depots" ADD CONSTRAINT "coop_depots_city_id_cities_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("city_id");--> statement-breakpoint
ALTER TABLE "coop_depots" ADD CONSTRAINT "coop_depots_kebele_id_kebeles_kebele_id_fkey" FOREIGN KEY ("kebele_id") REFERENCES "kebeles"("kebele_id");--> statement-breakpoint
ALTER TABLE "depot_inventory" ADD CONSTRAINT "depot_inventory_depot_id_coop_depots_depot_id_fkey" FOREIGN KEY ("depot_id") REFERENCES "coop_depots"("depot_id");--> statement-breakpoint
ALTER TABLE "depot_inventory" ADD CONSTRAINT "depot_inventory_variety_id_crop_varieties_variety_id_fkey" FOREIGN KEY ("variety_id") REFERENCES "crop_varieties"("variety_id");--> statement-breakpoint
ALTER TABLE "input_demand_reports" ADD CONSTRAINT "input_demand_reports_city_id_cities_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("city_id");--> statement-breakpoint
ALTER TABLE "input_demand_reports" ADD CONSTRAINT "input_demand_reports_kebele_id_kebeles_kebele_id_fkey" FOREIGN KEY ("kebele_id") REFERENCES "kebeles"("kebele_id");--> statement-breakpoint
ALTER TABLE "input_demand_reports" ADD CONSTRAINT "input_demand_reports_crop_id_crops_crop_id_fkey" FOREIGN KEY ("crop_id") REFERENCES "crops"("crop_id");--> statement-breakpoint
ALTER TABLE "yield_audits" ADD CONSTRAINT "yield_audits_city_id_cities_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("city_id");--> statement-breakpoint
ALTER TABLE "yield_audits" ADD CONSTRAINT "yield_audits_cycle_id_crop_cycles_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "crop_cycles"("cycle_id");--> statement-breakpoint
ALTER TABLE "yield_audits" ADD CONSTRAINT "yield_audits_opened_by_users_user_id_fkey" FOREIGN KEY ("opened_by") REFERENCES "users"("user_id");--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id");--> statement-breakpoint
ALTER TABLE "sync_queue" ADD CONSTRAINT "sync_queue_device_id_devices_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("device_id");--> statement-breakpoint
ALTER TABLE "sync_queue" ADD CONSTRAINT "sync_queue_user_id_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id");--> statement-breakpoint
ALTER TABLE "sync_queue" ADD CONSTRAINT "sync_queue_on_behalf_of_farmer_id_farmers_farmer_id_fkey" FOREIGN KEY ("on_behalf_of_farmer_id") REFERENCES "farmers"("farmer_id");--> statement-breakpoint
CREATE VIEW "v_crop_cycle_financials" AS (
  SELECT cycle_id,
         COALESCE(SUM(amount_etb) FILTER (WHERE NOT is_income),0) AS total_expenses_etb,
         COALESCE(SUM(amount_etb) FILTER (WHERE is_income),0)     AS total_income_etb,
         COALESCE(SUM(amount_etb) FILTER (WHERE is_income),0)
       - COALESCE(SUM(amount_etb) FILTER (WHERE NOT is_income),0) AS profit_loss_etb
  FROM farm_transactions WHERE deleted_at IS NULL GROUP BY cycle_id
);--> statement-breakpoint
CREATE VIEW "v_cycle_yields" AS (
  SELECT cc.cycle_id, p.city_id, p.kebele_id, p.plot_id, p.farmer_id,
         cc.season_year, cc.season, cc.crop_id, cc.variety_id, p.soil, p.zone,
         p.area_hectares, cc.harvest_kg, cc.yield_qt_ha
  FROM crop_cycles cc JOIN plots p ON p.plot_id = cc.plot_id
  WHERE cc.deleted_at IS NULL AND cc.harvest_kg IS NOT NULL
);--> statement-breakpoint
CREATE VIEW "v_outbreak_heatmap" AS (
  SELECT k.city_id, pd.kebele_id, pd.pest_id, COUNT(*) AS report_count, MAX(pd.created_at) AS last_report_at
  FROM pest_diagnoses pd JOIN kebeles k ON k.kebele_id = pd.kebele_id
  WHERE pd.pest_id IS NOT NULL AND pd.deleted_at IS NULL AND pd.created_at > now() - INTERVAL '30 days'
  GROUP BY k.city_id, pd.kebele_id, pd.pest_id
);