---
title: "Database Schema, Entities & API Surface — Agricultural Intelligence & Extension System (Version 1)"
version: 1.0
status: final (consolidated, 42 base tables)
date: 2026-10-04
project: Autonomous Agricultural Intelligence & Extension System (Ethiopia)
stack: PostgreSQL 15+ / PostGIS
---

# Database Schema, Entities & API Surface

**Autonomous Agricultural Intelligence & Extension System — Version 1**

> [!note] How to read this document
> Section 1 lists the entities. Section 2 describes the four authentication core tables (`users`, `accounts`, `sessions`, `verifications`) and the roles. Section 3 is the full PostgreSQL DDL. Section 4 is the API surface. Section 5 traces every SRS module to its tables and routes. Section 6 lists the base tables and Section 7 records what changed from v1.2. Requirement IDs in comments (e.g. `CROP-6`) refer to the SRS.

---

## 1. Core Entities (Overview)

| Entity | Description |
|---|---|
| `users` | **Auth core.** Base identity for every login (farmer, DA, officer, system admin): name, email, phone, role, city office, language, ban state, and `assigned_kebele_ids` (the kebeles a DA covers) |
| `accounts` | **Auth core.** Credential record per user (`provider_id = 'credential'` holds the password hash for officers and admins) |
| `sessions` | **Auth core.** Active login sessions (opaque token, expiry, IP, user agent) |
| `verifications` | **Auth core.** Short-lived OTP codes (phone login, officer/admin second step) and password-reset values |
| `city_offices` | Tenant boundary; one autonomous office per city/woreda with jurisdiction polygon and the `parameters` jsonb configuration (land-unit factors, weather and alert thresholds, agro-climatic boundaries, quotas) |
| `kebeles` | Kebele territory inside a city office (polygon or centroid + radius) |
| `farmers` | Farmer profile, `is_verified` flag (no approval workflow), assigned DA, single consent flag; may exist before the farmer has a login (DA-registered) |
| `plots` | Plot area, GPS centroid, soil, drainage, agro-zone and the planned crop for the coming season |
| `plot_crop_history` | 1–3 season crop history (the planned crop for demand aggregation is stored on `plots`) |
| `crops` / `crop_varieties` | Office-approved crop and variety catalog; `crops` also carries critical weeding windows and recommended successor crops |
| `fertilizer_rates` | Versioned recommended Urea/NPS/seed rates per crop and agro-zone |
| `pest_catalog` | Pests and diseases (names, prevention advice) |
| `registered_chemicals` | Legally registered, locally available agro-chemicals with target crop and pest arrays (safety-filter source of truth) |
| `crop_cycles` | A crop cycle on a plot and its current stage |
| `sowing_logs` | Planting date, seed variety, source, rate |
| `fertilizer_logs` | Granular split-fertilizer log: basal (NPS/NPS-Zinc), 1st Urea, 2nd Urea, including explicit skips |
| `field_operations` | Plowing, weeding, spraying, irrigation events |
| `harvest_records` | Actual harvest volume and computed yield (qt/ha) |
| `ledger_entries` | Per-cycle cash ledger |
| `yield_gap_analyses` | Server-computed peer comparison, ranked root causes, narration |
| `weather_forecasts` / `weather_alerts` | Cached 7-day forecast per 0.1° grid cell and extreme-weather alerts (historical rainfall for rain-onset is fetched on demand, not stored) |
| `media_files` | Audio and photo metadata, resumable upload state, SHA-256 |
| `diagnosis_cases` | Gemini Vision diagnosis requests (1–4 photo ids on the row) and filtered results |
| `outbreak_clusters` | Detected pest outbreak clusters, with contributing case ids stored on the row |
| `grievances` / `grievance_messages` | Voice Box tickets (photo ids and status history stored on the ticket) and the two-way farmer / extension-desk message thread |
| `da_tasks` | Tasks pushed to DAs (field visits, diagnosis reviews, grievance work) |
| `market_centres` / `market_surveys` | Market centres and weekly officer-verified price surveys |
| `crowd_transactions` | Farmer-submitted sale records awaiting moderation |
| `depots` / `depot_stock_items` / `depot_stock_movements` | Cooperative depot inventory ledger; `depot_stock_movements` also carries expected and confirmed incoming shipments (`status`, `expected_on`) |
| `demand_snapshots` | Frozen demand-aggregation results, including officer kebele-level overrides |
| `announcements` / `announcement_deliveries` | Multi-channel broadcasting (app feed + SMS); localized title, body and audio live in `announcements.translations`; per-recipient delivery state |
| `devices` | Registered mobile devices: sync cursor, push token |
| `sync_mutations` / `sync_changes` | Idempotent client write log and server change feed for delta-sync |
| `audit_logs` | Append-only audit trail, including parameter changes and privileged log corrections |

---

## 2. Authentication Model

Authentication uses exactly the **four Better Auth core tables**: `users`, `accounts`, `sessions`, `verifications`. Credentials live in `accounts`, not in `users`. No other auth tables exist (no two-factor table, no rate-limit table, no OTP table: OTP codes are rows in `verifications`).

### 2.1 Tables and relations

> [!note] v1.3 change to the auth core
> The four tables keep their v1.2 definitions. The single, directed exception is one added column, `users.assigned_kebele_ids uuid[]`, which replaces the dropped `da_kebele_assignments` junction table. Nothing else in `users`, `accounts`, `sessions` or `verifications` changed.

| Table | Columns | Relations |
|---|---|---|
| `users` | `id`, `name`, `email`, `email_verified`, `image`, `phone_number`, `phone_number_verified`, `role`, `banned`, `ban_reason`, `ban_expires`, `city_office_id`, `preferred_language`, `assigned_kebele_ids`, `created_at`, `updated_at`, `deleted_at` | `city_office_id` → `city_offices.id`; `assigned_kebele_ids[]` → `kebeles.id` (validated by trigger, Section 3.4) |
| `accounts` | `id`, `account_id`, `provider_id`, `user_id`, `access_token`, `refresh_token`, `id_token`, `access_token_expires_at`, `refresh_token_expires_at`, `scope`, `password`, `created_at`, `updated_at` | `user_id` → `users.id` (cascade) |
| `sessions` | `id`, `user_id`, `token`, `expires_at`, `ip_address`, `user_agent`, `created_at`, `updated_at` | `user_id` → `users.id` (cascade) |
| `verifications` | `id`, `identifier`, `value`, `expires_at`, `created_at`, `updated_at` | none (looked up by `identifier`, e.g. a phone number) |

Domain tables link to identity only through `users.id`: `farmers.user_id`, `devices.user_id`, and the `*_user_id` / `created_by` / `actor_user_id` audit columns.

### 2.2 How each actor logs in

| Actor | Method | Storage |
|---|---|---|
| Farmer | Phone number + SMS OTP (PLOT-1) | OTP value in `verifications` (`identifier` = phone number, 10-minute expiry, 5 failed attempts). On first successful verification the `users` row is created with `role = farmer` and a placeholder email (`<digits>@phone.agri.invalid`), because `users.email` is required and unique. The farmer is **active immediately**; there is no approval step. |
| DA | Phone number + SMS OTP | Same as farmer; an Officer pre-creates the user and sets `role = 'da'` and `assigned_kebele_ids`. |
| Officer, System Admin | Email + password, then a mandatory SMS OTP (ADM-8) | Password hash in `accounts.password` (`provider_id = 'credential'`); the second-step OTP is a `verifications` row. A `sessions` row is created only after both steps succeed. Lockout (5 failures, 15 minutes) and OTP request throttling are enforced by the API using `audit_logs` (`action = 'auth.login_failed'`) and `verifications.created_at`. |
| Farmer without a phone | **No login.** | Exists only as a `farmers` row (`user_id` null, `no_phone = true`), registered by a DA (AGENT-2). Claiming the profile later links `farmers.user_id` after the farmer completes OTP. |

### 2.3 Sessions and offline use

`sessions.token` is an opaque bearer token with a 30-day sliding expiry, longer than the 14-day offline requirement (SRS 4.4). The mobile app stores it in the Android Keystore and keeps working offline with the stored token; the API validates it on the next online call. The web dashboard sends the same token as a cookie and expires it after 30 minutes of inactivity (ADM-8). Revoking access means deleting the user's `sessions` rows.

> [!note] Deviation to resolve: JWT vs server-side sessions
> SRS 4.2 specifies a 15-minute access JWT with a rotating refresh token. This schema uses revocable server-side session tokens. Amend SRS 4.2 to "revocable server-side session tokens with 30-day sliding expiry".

### 2.4 Roles

`users.role` is the Postgres enum `user_role`: `farmer`, `da`, `officer`, `system_admin`. Enforcement is layered:

1. A role check on every route (declared per endpoint in Section 4).
2. A tenant scope that filters every query by `city_office_id`. `system_admin` has no office and has no access to farmer agronomic data except through audited support operations (SRS 4.2).
3. Optional defense in depth: PostgreSQL row-level security keyed on a per-transaction setting (see Section 3.4).

### 2.5 Account lifecycle rules

- **Office assignment.** A farmer's `users.city_office_id` is null at first OTP sign-up and is set when the farmer creates a profile (`POST /v1/farmers/me`). DAs and officers always have an office; `system_admin` has none. The check constraint on `users` allows exactly these cases.
- **Soft delete (`DELETE /v1/users/me`).** Sets `users.deleted_at`, deletes all the user's `sessions`, then rewrites `email` to `deleted+<id>@phone.agri.invalid` and nulls `phone_number`. This frees the identifiers for reuse while keeping plain unique constraints. Session creation is rejected for users with `deleted_at` set.
- **Bans / deactivation.** `users.banned = true` (optionally with `ban_reason`, `ban_expires`); the user's sessions are deleted.
- **Phone uniqueness.** `users.phone_number` is globally unique (PLOT-1). `farmers.phone_number` mirrors it for farmers with a login and holds the number for DA-registered farmers.
- **DA kebele coverage.** A DA covers one or two kebeles, stored as `users.assigned_kebele_ids` (used only when `role = 'da'`). The trigger `validate_user_kebele_ids()` rejects ids that are duplicated, soft-deleted or in another office, and rejects a non-empty array on any other role.
- **Farmer verification is not a login gate.** `farmers.is_verified` never blocks any feature (Section 3.3.1).

---

# 3. Database Schema (DDL)

Conventions applied to every table unless stated otherwise:

- `id uuid primary key default gen_random_uuid()`. Records created offline on a device supply their own UUID (client-generated), which doubles as the idempotency key (SYNC-5).
- `city_office_id uuid not null` on every office-owned table (tenancy, ADM-1).
- `created_at`, `updated_at timestamptz` in UTC; `updated_at` is maintained by trigger (Section 3.4).
- `deleted_at timestamptz` on mutable entities (soft delete). Every list endpoint filters `deleted_at is null` by default.
- `version integer not null default 1` on entities with optimistic concurrency; incremented by the application on update.
- Weights and quantities are `numeric(12,3)`, money is `numeric(12,2)` in ETB, agronomic event dates are `date`.
- Media is never stored in rows; rows reference `media_files(id)`: a single audio file through a foreign key, and photo sets (`diagnosis_cases.photo_media_ids`, `grievances.photo_media_ids`) through `uuid[]` columns validated by the trigger `validate_photo_media_ids()` (Section 3.4).
- Mobile mapping (React Native + WatermelonDB): `uuid[]` and `jsonb` columns are carried through sync as JSON arrays and objects and stored on the device as serialized JSON fields.

## 3.1 Extensions & Enums

```sql
-- ============================================================
-- EXTENSIONS
-- ============================================================

create extension if not exists pgcrypto;   -- gen_random_uuid(), digest()
create extension if not exists postgis;    -- geography, spatial indexes


-- ============================================================
-- ENUMS
-- ============================================================

create type user_role as enum ('farmer', 'da', 'officer', 'system_admin');

create type app_language as enum ('am', 'om', 'ti', 'en');


create type area_unit as enum ('timad', 'kert', 'hectare');

create type agro_zone as enum ('dega', 'weyna_dega', 'kolla');

create type soil_class as enum (
  'koticha_vertisol', 'beda_nitisol', 'sandy', 'clay', 'loam'
);

create type drainage_class as enum ('waterlogs', 'moderate', 'free_draining');

create type plot_status as enum ('active', 'archived');

create type catalog_status as enum ('active', 'retired');

create type chemical_category as enum ('insecticide', 'fungicide', 'herbicide', 'other');

create type pest_kind as enum ('pest', 'disease');

create type cycle_stage as enum (
  'land_preparation', 'sowing', 'vegetative', 'flowering', 'grain_filling', 'harvest'
);

create type cycle_status as enum ('active', 'closed', 'abandoned');

create type seed_source as enum ('certified_improved', 'recycled_local', 'other');

create type fertilizer_application_type as enum ('basal', 'urea_1', 'urea_2');

create type fertilizer_product as enum ('nps', 'nps_zinc', 'urea');

create type skip_reason as enum ('unavailable', 'unaffordable', 'forgot', 'other');

create type operation_type as enum ('plowing', 'weeding', 'spraying', 'irrigation');

create type irrigation_method as enum ('flood', 'furrow', 'drip', 'bucket', 'other');

create type quantity_unit as enum ('quintal', 'kg');

create type ledger_category as enum (
  'input_cost', 'machinery_oxen_rental', 'labor', 'harvest_revenue', 'other'
);

create type yield_analysis_status as enum (
  'completed', 'insufficient_data', 'failed', 'top_quartile'
);

create type weather_alert_type as enum ('frost', 'downpour', 'dry_spell');

create type media_kind as enum ('audio', 'image', 'document');

create type media_status as enum ('pending', 'uploading', 'uploaded', 'verified', 'failed');

create type job_status as enum ('queued', 'processing', 'completed', 'failed');

create type diagnosis_severity as enum ('low', 'moderate', 'high');

create type diagnosis_review_status as enum ('none', 'pending_da_review', 'reviewed');

create type grievance_category as enum (
  'input_shortage', 'pest_outbreak', 'water_conflict', 'adulterated_inputs'
);

create type grievance_status as enum (
  'submitted', 'received', 'assigned', 'in_progress', 'resolved', 'rejected', 'reopened'
);

create type grievance_priority as enum ('low', 'normal', 'high', 'urgent');

create type message_kind as enum ('text', 'audio');

create type task_type as enum ('field_visit', 'diagnosis_review', 'grievance', 'other');

create type task_status as enum ('open', 'in_progress', 'done', 'cancelled');

create type survey_status as enum ('draft', 'verified', 'superseded');

create type moderation_status as enum ('pending', 'verified', 'rejected', 'flagged');

create type stock_item_type as enum ('urea', 'nps', 'seed');

create type stock_movement_type as enum ('receipt', 'issue', 'adjustment');

create type announcement_type as enum ('seasonal_advice', 'input_availability', 'emergency');

create type announcement_status as enum ('draft', 'published', 'recalled');

create type delivery_channel as enum ('app', 'sms');

create type delivery_status as enum ('queued', 'sent', 'delivered', 'failed');

create type sync_op as enum ('insert', 'update', 'delete');

create type sync_mutation_status as enum ('applied', 'rejected', 'duplicate');


```

## 3.2 Tenancy & Identity (auth core tables)

```sql
-- ============================================================
-- TENANCY: CITY OFFICES
-- One autonomous office per city/woreda. No parent hierarchy in V1.
-- ============================================================

create table city_offices (
  id                uuid primary key default gen_random_uuid(),

  name              varchar(120) not null unique,

  -- Jurisdiction used to validate plot centroids (PLOT-5).
  -- Must be set before farmer registration is enabled for the office.
  jurisdiction      geography(MultiPolygon, 4326),

  default_language  app_language not null default 'am',

  -- Office configuration (ADM-6). Replaces the office_parameters key-value table.
  -- Flat, dotted keys; the value in force is the value stored here (no effective dating:
  -- every change is written to audit_logs with action 'office.parameters_update' and
  -- before/after in changes_json). Seeded with SRS defaults when the office is provisioned.
  --
  -- Expected keys (SRS defaults in brackets):
  --   land_unit.timad_to_ha [0.25]   land_unit.kert_to_ha [NONE - must be set]
  --   land_unit.hectare_to_ha [1]    local_id.regex
  --   agro_zone.kolla_max_m [1500]   agro_zone.dega_min_m [2300]
  --   voice.intent_confidence_threshold [0.65]
  --   weather.spray_wind_max_kmh [15]  weather.spray_washoff_hours [6]
  --   weather.harvest_rain_prob_max_pct [20]  weather.frost_min_c [2]
  --   weather.downpour_mm_per_day [50]  weather.dry_spell_days [10]
  --   rain_onset.accumulation_mm [20]  rain_onset.window_days [3]
  --   yield.cohort_min_size [5]
  --   diagnosis.low_confidence [0.6]
  --   outbreak.radius_km [5]  outbreak.window_days [7]  outbreak.min_cases [3]
  --   triage.overdue_hours [72]
  --   demand.critical_gap_pct [20]  demand.max_margin_pct [30]
  --   market.stale_days [14]  market.plausibility_band_pct [50]
  --   broadcast.sms_fallback_minutes [30]
  --   broadcast.quiet_hours [{"start":"20:00","end":"07:00"}]
  --   ai.daily_call_quota   (enforced by the Redis rate limiter, not by a table)
  parameters        jsonb not null default '{}',

  is_active         boolean not null default true,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  check (jsonb_typeof(parameters) = 'object')
);


create table kebeles (
  id               uuid primary key default gen_random_uuid(),

  city_office_id   uuid not null references city_offices(id) on delete cascade,

  name             varchar(120) not null,

  -- ADM-5: territory is either a drawn polygon or a centroid + radius.
  -- Boundaries are approximate and may overlap; no database rule rejects overlap.
  -- A plot that falls in several kebeles gets the smallest containing one; otherwise the nearest centroid.
  boundary         geography(MultiPolygon, 4326),
  centroid_lat     numeric(9,6),
  centroid_lng     numeric(9,6),
  radius_m         integer,

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  deleted_at       timestamptz,

  check (
    boundary is not null
    or (centroid_lat is not null and centroid_lng is not null and radius_m > 0)
  )
);

create unique index uq_kebeles_name_active
on kebeles(city_office_id, lower(name))
where deleted_at is null;


-- ============================================================
-- AUTH CORE: users
-- Phone-only users get a placeholder *.invalid email (Section 2.2).
-- ============================================================

create table users (
  id                       uuid primary key default gen_random_uuid(),

  name                     varchar(255) not null,
  email                    varchar(255) not null unique,
  email_verified           boolean not null default false,
  image                    varchar(500),

  phone_number             varchar(20) unique,
  phone_number_verified    boolean not null default false,

  role                     user_role not null default 'farmer',
  banned                   boolean not null default false,
  ban_reason               text,
  ban_expires              timestamptz,

  -- null for system_admin, and for a farmer who has not created a profile yet (Section 2.5)
  city_office_id           uuid references city_offices(id),
  preferred_language       app_language not null default 'am',

  -- Kebeles covered by a DA (1-2 in practice); used when role = 'da', empty otherwise.
  -- Integrity (same office, not deleted, no duplicates, DA role only) is enforced by
  -- trg_users_kebele_ids in Section 3.4. Replaces the da_kebele_assignments table.
  assigned_kebele_ids      uuid[] not null default '{}',

  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),

  -- Soft delete: closure hides the user without erasing history.
  -- On closure the app also tombstones email/phone (Section 2.5).
  deleted_at               timestamptz,

  check (phone_number is null or phone_number ~ '^\+251[79][0-9]{8}$'),
  check (role in ('system_admin', 'farmer') or city_office_id is not null)
);


-- ============================================================
-- AUTH CORE: accounts
-- One row per login method per user. Officers/admins have a
-- 'credential' row holding the password hash. Phone-OTP users
-- normally have no account row.
-- ============================================================

create table accounts (
  id                        uuid primary key default gen_random_uuid(),

  account_id                varchar(255) not null,   -- provider-side id; for 'credential' = user id
  provider_id               varchar(100) not null,   -- 'credential' | 'google' | ...

  user_id                   uuid not null references users(id) on delete cascade,

  access_token              text,
  refresh_token             text,
  id_token                  text,
  access_token_expires_at   timestamptz,
  refresh_token_expires_at  timestamptz,
  scope                     text,

  password                  text,                     -- hash, only for provider_id = 'credential'

  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),

  unique (provider_id, account_id)
);


-- ============================================================
-- AUTH CORE: sessions
-- ============================================================

create table sessions (
  id              uuid primary key default gen_random_uuid(),

  user_id         uuid not null references users(id) on delete cascade,

  token           varchar(500) not null unique,
  expires_at      timestamptz not null,

  ip_address      varchar(100),
  user_agent      text,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);


-- ============================================================
-- AUTH CORE: verifications
-- Holds OTP codes (identifier = phone number, or email for the
-- officer second step) and password-reset tokens.
-- ============================================================

create table verifications (
  id          uuid primary key default gen_random_uuid(),

  identifier  varchar(255) not null,
  value       text not null,

  expires_at  timestamptz not null,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
```

## 3.3 Domain Tables

### 3.3.1 Farmers & Plots

```sql
-- ============================================================
-- FARMERS
-- A farmer may exist without a login (user_id null): DA-registered
-- farmers without phones (AGENT-2). Claiming links user_id.
-- ============================================================

create table farmers (
  id                   uuid primary key default gen_random_uuid(),

  city_office_id       uuid not null references city_offices(id),
  user_id              uuid unique references users(id) on delete set null,

  full_name            varchar(120) not null,
  phone_number         varchar(20),
  no_phone             boolean not null default false,

  local_id_number      varchar(40) not null,
  kebele_id            uuid not null references kebeles(id),

  assigned_da_id       uuid references users(id),
  registered_by_user_id uuid references users(id),

  preferred_language   app_language  not null default 'am',   -- content / SMS language (authoritative when no login exists)

  -- No approval workflow. A phone-verified farmer is active immediately with
  -- full access. is_verified only marks that a DA/Officer has confirmed the
  -- farmer in the field (set by trigger when a DA/Officer registers the farmer);
  -- it is used to filter verified vs. unverified records in demand planning.
  is_verified          boolean not null default false,

  -- Single consent flag (processing, outbreak clustering and SMS).
  consent_agreed       boolean not null default true,
  consent_agreed_at    timestamptz default now(),

  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  deleted_at           timestamptz,

  check (full_name = btrim(full_name) and char_length(full_name) between 2 and 120),
  check (no_phone = (phone_number is null)),
  check (phone_number is null or phone_number ~ '^\+251[79][0-9]{8}$'),
  check (not consent_agreed or consent_agreed_at is not null)
);

create unique index uq_farmers_phone_active
on farmers(phone_number)
where deleted_at is null and phone_number is not null;

create unique index uq_farmers_local_id_active
on farmers(city_office_id, local_id_number)
where deleted_at is null;


-- ============================================================
-- PLOTS
-- area_hectares and centroid_geom are generated, so they can never
-- drift from the entered values (PLOT-4, PLOT-5).
-- ============================================================

create table plots (
  id                         uuid primary key default gen_random_uuid(),

  city_office_id             uuid not null references city_offices(id),
  farmer_id                  uuid not null references farmers(id) on delete cascade,

  name                       varchar(60) not null,

  area_value                 numeric(10,3) not null,
  area_unit                  area_unit not null,
  conversion_factor_used     numeric(10,6) not null,    -- hectares per unit in force at save time
  area_hectares              numeric(10,4)
    generated always as (round(area_value * conversion_factor_used, 4)) stored,

  centroid_lat               numeric(9,6) not null,
  centroid_lng               numeric(9,6) not null,
  centroid_geom              geography(Point, 4326)
    generated always as (st_setsrid(st_makepoint(centroid_lng, centroid_lat), 4326)::geography) stored,
  gps_accuracy_m             numeric(6,1) not null,

  -- 0.1° grid cell used to share cached weather across plots (Section 5.2 of SRS).
  weather_grid_lat           numeric(5,1)
    generated always as (round(centroid_lat, 1)) stored,
  weather_grid_lng           numeric(5,1)
    generated always as (round(centroid_lng, 1)) stored,

  elevation_m                integer not null,
  agro_zone_derived          agro_zone not null,
  agro_zone                  agro_zone not null,
  agro_zone_override_reason  varchar(255),

  kebele_id                  uuid references kebeles(id),   -- derived by spatial containment; null = outside all kebeles (flagged)

  soil_class                 soil_class,
  drainage                   drainage_class,

  -- Planned crop for the coming season (feeds demand aggregation, REG-4).
  -- Replaces plot_season_plans: one plan per plot, overwritten each season.
  -- Set both columns or neither. The foreign key to crops is added after crops
  -- exist (Section 3.3.2).
  planned_crop_id            uuid,
  planned_season_year        smallint,

  status                     plot_status not null default 'active',

  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz not null default now(),
  deleted_at                 timestamptz,

  check (area_value > 0 and area_value <= 1000),
  check (conversion_factor_used > 0),
  check (centroid_lat between -90 and 90 and centroid_lng between -180 and 180),
  check (elevation_m between 0 and 4500),
  check (agro_zone = agro_zone_derived or agro_zone_override_reason is not null),
  check ((planned_crop_id is null) = (planned_season_year is null)),
  check (planned_season_year is null or planned_season_year between 2000 and 2100)
);
-- soil_class / drainage are nullable at insert but the API refuses to start a
-- crop cycle until both are set (PLOT-7).

create unique index uq_plots_name_active
on plots(farmer_id, lower(name))
where deleted_at is null;
```

### 3.3.2 Catalog (office-approved crops, chemicals, rates)

```sql
-- ============================================================
-- CROPS & VARIETIES
-- ============================================================

create table crops (
  id                          uuid primary key default gen_random_uuid(),

  city_office_id              uuid not null references city_offices(id) on delete cascade,

  code                        varchar(40) not null,           -- e.g. 'teff', 'wheat', 'maize'
  name_en                     varchar(100) not null,
  name_am                     varchar(100),
  name_om                     varchar(100),
  name_ti                     varchar(100),

  -- Plausibility ceiling for CROP-10 (quintals per hectare).
  max_plausible_yield_qt_ha   numeric(6,2) not null default 80,

  -- Critical weeding windows, days after sowing (YIELD-5). 1-3 entries typical:
  -- [{"sequence_no": 1, "start_day": 25, "end_day": 35}]. Validated by the API
  -- (sequence_no 1-6, start_day >= 0, end_day >= start_day).
  weeding_windows             jsonb not null default '[]',

  -- Recommended successor crops (DIAG-8). Array order = priority (first = most recommended).
  -- Elements are crops.id values of the same office, validated by the API.
  recommended_successors      uuid[] not null default '{}',

  status                      catalog_status not null default 'active',
  effective_from              date not null default current_date,
  effective_to                date,

  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now(),

  unique (city_office_id, code),
  check (jsonb_typeof(weeding_windows) = 'array'),
  check (not (id = any(recommended_successors)))
);


create table crop_varieties (
  id                uuid primary key default gen_random_uuid(),

  city_office_id    uuid not null references city_offices(id) on delete cascade,
  crop_id           uuid not null references crops(id) on delete cascade,

  name              varchar(120) not null,
  is_certified      boolean not null default true,    -- certified improved seed vs. other
  permitted_zones   agro_zone[] not null,

  status            catalog_status not null default 'active',
  effective_from    date not null default current_date,
  effective_to      date,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  unique (crop_id, name)
);


-- Versioned recommended rates (REG-4). The row in force for a crop/zone is
-- the latest effective_from <= today.
create table fertilizer_rates (
  id                uuid primary key default gen_random_uuid(),

  city_office_id    uuid not null references city_offices(id) on delete cascade,
  crop_id           uuid not null references crops(id) on delete cascade,
  agro_zone         agro_zone not null,

  urea_kg_ha        numeric(8,2) not null,
  nps_kg_ha         numeric(8,2) not null,
  seed_kg_ha        numeric(8,2) not null,

  rates_version     integer not null,
  effective_from    date not null,

  created_by        uuid references users(id),
  created_at        timestamptz not null default now(),

  unique (city_office_id, crop_id, agro_zone, effective_from),
  check (urea_kg_ha >= 0 and nps_kg_ha >= 0 and seed_kg_ha >= 0)
);


-- ============================================================
-- PEST & DISEASE CATALOG
-- ============================================================

create table pest_catalog (
  id                 uuid primary key default gen_random_uuid(),

  city_office_id     uuid not null references city_offices(id) on delete cascade,

  code               varchar(60) not null,            -- e.g. 'fall_armyworm', 'yellow_rust'
  kind               pest_kind not null,
  name               jsonb not null,                  -- {"en":"...","am":"...","om":"...","ti":"..."}
  prevention_advice  jsonb,                           -- same language keys
  reference_media_id uuid,                            -- fk added after media_files
  is_quarantine      boolean not null default false,  -- migratory pests (Fall Armyworm, Desert Locust, Yellow Rust)

  status             catalog_status not null default 'active',

  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),

  unique (city_office_id, code)
);


-- ============================================================
-- REGISTERED CHEMICALS (safety-filter source of truth, DIAG-4/5)
-- Dosage and safety text is stored per language and copied verbatim
-- into advice; it is never generated by the LLM.
-- ============================================================

create table registered_chemicals (
  id                     uuid primary key default gen_random_uuid(),

  city_office_id         uuid not null references city_offices(id) on delete cascade,

  brand_name             varchar(150) not null,
  active_ingredient      varchar(200) not null,
  registration_number    varchar(80)  not null,
  category               chemical_category not null,

  dosage_text            jsonb not null,              -- {"en":"...","am":"...",...}
  ppe_text               jsonb,
  safety_interval_days   smallint not null,           -- pre-harvest interval

  label_media_id         uuid,                        -- fk added after media_files
  permitted_zones        agro_zone[],

  -- Replaces the former chemical_crops junction table. The diagnosis safety filter
  -- matches with array containment (target_crop_ids @> array[crop_id]).
  -- Elements are crops.id / pest_catalog.id values of the same office, validated by the API.
  target_crop_ids        uuid[] not null default '{}',
  target_pest_ids        uuid[] not null default '{}',

  status                 catalog_status not null default 'active',
  effective_from         date not null default current_date,
  effective_to           date,

  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),

  unique (city_office_id, registration_number),
  check (safety_interval_days >= 0)
);


-- ============================================================
-- PLOT CROP HISTORY (after crops exist)
-- The planned crop for the coming season lives on plots (planned_crop_id, planned_season_year).
-- ============================================================

create table plot_crop_history (
  id              uuid primary key default gen_random_uuid(),

  city_office_id  uuid not null references city_offices(id),
  farmer_id       uuid not null references farmers(id) on delete cascade,
  plot_id         uuid not null references plots(id) on delete cascade,

  season_year     smallint not null,
  crop_id         uuid references crops(id),
  fallow          boolean not null default false,       -- "new land / nothing planted" is explicit

  created_by_user_id uuid references users(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz,

  unique (plot_id, season_year),
  check (season_year between 2000 and 2100),
  check (fallow = (crop_id is null))
);


-- Deferred foreign key: plots is created before crops (Section 3.3.1).
alter table plots
  add constraint fk_plots_planned_crop
  foreign key (planned_crop_id) references crops(id);
```

### 3.3.3 Media (shared by audio and photo features)

```sql
-- ============================================================
-- MEDIA FILES
-- Audio (grievances, responses, TTS) and images (diagnosis, grievance,
-- catalog). Supports resumable chunked upload (SYNC-7): the client
-- sends 256 KB chunks; bytes_received lets it resume after a drop.
-- ============================================================

create table media_files (
  id                uuid primary key default gen_random_uuid(),

  city_office_id    uuid not null references city_offices(id),
  owner_user_id     uuid references users(id),

  kind              media_kind not null,
  mime_type         varchar(100) not null,
  size_bytes        bigint,
  duration_s        smallint,

  storage_key       varchar(500) not null unique,   -- S3-compatible object key
  sha256            char(64),                       -- client-declared; verified server-side on complete
  status            media_status not null default 'pending',
  bytes_received    bigint not null default 0,
  upload_id         varchar(200),                   -- multipart upload id

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  check (size_bytes is null or size_bytes >= 0),
  check (kind <> 'audio' or duration_s is null or duration_s <= 180),
  check (sha256 is null or sha256 ~ '^[0-9a-f]{64}$')
);

alter table pest_catalog
  add constraint fk_pest_catalog_media
  foreign key (reference_media_id) references media_files(id);

alter table registered_chemicals
  add constraint fk_chemicals_label_media
  foreign key (label_media_id) references media_files(id);
```

### 3.3.4 Crop Cycles & Input Event Logging

```sql
-- ============================================================
-- CROP CYCLES
-- Every log table carries farmer_id (the subject) and
-- created_by_user_id (the actor: farmer or DA) — AGENT-3.
-- ============================================================

create table crop_cycles (
  id                   uuid primary key default gen_random_uuid(),

  city_office_id       uuid not null references city_offices(id),
  farmer_id            uuid not null references farmers(id) on delete cascade,
  plot_id              uuid not null references plots(id) on delete cascade,

  crop_id              uuid not null references crops(id),
  variety_id           uuid references crop_varieties(id),

  season_year          smallint not null,
  stage                cycle_stage  not null default 'land_preparation',
  status               cycle_status not null default 'active',

  -- Current stage only; milestone history is derivable from sowing_logs, field_operations
  -- and harvest_records. Backward corrections (D/O only) write audit_logs.
  stage_changed_at          timestamptz not null default now(),
  stage_changed_by_user_id  uuid references users(id),

  started_on           date not null,
  closed_on            date,

  created_by_user_id   uuid references users(id),

  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  deleted_at           timestamptz,

  check (started_on <= current_date),
  check (season_year between 2000 and 2100),
  check (status <> 'closed' or closed_on is not null),
  check (closed_on is null or closed_on >= started_on)
);

-- CROP-2: one active cycle per plot.
create unique index uq_crop_cycles_one_active
on crop_cycles(plot_id)
where status = 'active' and deleted_at is null;


-- ============================================================
-- SOWING LOG (CROP-4)
-- ============================================================

create table sowing_logs (
  id                    uuid primary key default gen_random_uuid(),

  city_office_id        uuid not null references city_offices(id),
  farmer_id             uuid not null references farmers(id) on delete cascade,
  cycle_id              uuid not null references crop_cycles(id) on delete cascade,

  planting_date         date not null,
  seed_variety_id       uuid references crop_varieties(id),
  seed_variety_other    varchar(120),                  -- when variety is not in the catalog
  seed_source           seed_source not null,          -- yield-gap factor, mandatory
  seed_quantity_kg      numeric(10,3) not null,
  seed_rate_kg_per_ha   numeric(8,2),                  -- computed by trigger

  created_by_user_id    uuid references users(id),

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  deleted_at            timestamptz,

  check (planting_date <= current_date),
  check (seed_quantity_kg > 0),
  check (seed_variety_id is not null or seed_variety_other is not null)
);

create unique index uq_sowing_logs_cycle_active
on sowing_logs(cycle_id)
where deleted_at is null;


-- ============================================================
-- FERTILIZER LOG (CROP-5 to CROP-8)
-- One row per application slot: basal, urea_1, urea_2.
-- applied = false records an explicit skip, so "missing log" and
-- "not applied" are distinguishable (YIELD-3).
-- ============================================================

create table fertilizer_logs (
  id                           uuid primary key default gen_random_uuid(),

  city_office_id               uuid not null references city_offices(id),
  farmer_id                    uuid not null references farmers(id) on delete cascade,
  cycle_id                     uuid not null references crop_cycles(id) on delete cascade,

  application_type             fertilizer_application_type not null,
  fertilizer_product           fertilizer_product not null,

  applied                      boolean not null default true,
  skip_reason                  skip_reason,

  quantity_kg                  numeric(10,3),
  application_date             date,
  growth_stage_at_application  cycle_stage,

  -- Computed by trigger compute_fertilizer_derived()
  rate_kg_per_ha               numeric(8,2),
  days_after_sowing            smallint,

  created_by_user_id           uuid references users(id),

  created_at                   timestamptz not null default now(),
  updated_at                   timestamptz not null default now(),
  deleted_at                   timestamptz,

  -- basal ∈ {nps, nps_zinc}; both Urea top-dressings ∈ {urea}
  check (
    (application_type = 'basal' and fertilizer_product in ('nps', 'nps_zinc'))
    or (application_type in ('urea_1', 'urea_2') and fertilizer_product = 'urea')
  ),
  -- applied rows carry quantity + date; skipped rows carry a reason only
  check (
    (applied and quantity_kg > 0 and quantity_kg <= 1000
       and application_date is not null and application_date <= current_date
       and skip_reason is null)
    or
    (not applied and skip_reason is not null
       and quantity_kg is null and application_date is null)
  ),
  -- growth stage is required for both Urea top-dressings when applied
  check (
    not applied
    or application_type = 'basal'
    or growth_stage_at_application is not null
  )
);

create unique index uq_fertilizer_logs_slot_active
on fertilizer_logs(cycle_id, application_type)
where deleted_at is null;


-- ============================================================
-- FIELD OPERATIONS (CROP-9)
-- ============================================================

create table field_operations (
  id                  uuid primary key default gen_random_uuid(),

  city_office_id      uuid not null references city_offices(id),
  farmer_id           uuid not null references farmers(id) on delete cascade,
  cycle_id            uuid not null references crop_cycles(id) on delete cascade,

  operation_type      operation_type not null,
  operation_date      date not null,

  -- plowing: pass number 1–10; weeding: 1st, 2nd, 3rd... (1–6)
  sequence_no         smallint,

  -- spraying
  chemical_id         uuid references registered_chemicals(id),
  product_rate        numeric(10,3),
  rate_unit           varchar(20),

  -- irrigation
  irrigation_method   irrigation_method,
  duration_minutes    integer,

  created_by_user_id  uuid references users(id),

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  deleted_at          timestamptz,

  check (operation_date <= current_date),
  check (
    (operation_type = 'plowing'    and sequence_no between 1 and 10)
    or (operation_type = 'weeding' and sequence_no between 1 and 6)
    or (operation_type = 'spraying'
        and chemical_id is not null and product_rate > 0 and rate_unit is not null)
    or (operation_type = 'irrigation'
        and irrigation_method is not null and duration_minutes between 1 and 1440)
  )
);


-- ============================================================
-- HARVEST RECORD (CROP-10)
-- volume_kg is generated; yield_qt_per_ha is computed by trigger
-- because it needs the plot area.
-- ============================================================

create table harvest_records (
  id                       uuid primary key default gen_random_uuid(),

  city_office_id           uuid not null references city_offices(id),
  farmer_id                uuid not null references farmers(id) on delete cascade,
  cycle_id                 uuid not null references crop_cycles(id) on delete cascade,

  harvest_date             date not null,

  entered_volume           numeric(10,3) not null,
  entered_unit             quantity_unit not null,
  volume_kg                numeric(12,3)
    generated always as (
      case entered_unit when 'quintal' then entered_volume * 100 else entered_volume end
    ) stored,

  yield_qt_per_ha          numeric(8,2),            -- trigger: compute_harvest_yield()
  plausibility_confirmed   boolean not null default false,

  created_by_user_id       uuid references users(id),

  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  deleted_at               timestamptz,

  check (entered_volume > 0),
  check (harvest_date <= current_date)
);

create unique index uq_harvest_records_cycle_active
on harvest_records(cycle_id)
where deleted_at is null;


-- ============================================================
-- LEDGER (CROP-11)
-- ============================================================

create table ledger_entries (
  id                  uuid primary key default gen_random_uuid(),

  city_office_id      uuid not null references city_offices(id),
  farmer_id           uuid not null references farmers(id) on delete cascade,
  cycle_id            uuid not null references crop_cycles(id) on delete cascade,

  category            ledger_category not null,
  amount_etb          numeric(12,2) not null,
  entry_date          date not null,

  created_by_user_id  uuid references users(id),

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  deleted_at          timestamptz,

  check (amount_etb > 0 and amount_etb <= 10000000),
  check (entry_date <= current_date)
);
```

### 3.3.5 Yield Gap, Weather, Diagnostics & Outbreaks

```sql
-- ============================================================
-- YIELD GAP ANALYSIS (YIELD-1 to YIELD-12)
-- Numbers are computed deterministically on the server; the LLM only
-- narrates factor_results. Peer data is stored as aggregates only.
-- ============================================================

create table yield_gap_analyses (
  id                    uuid primary key default gen_random_uuid(),

  city_office_id        uuid not null references city_offices(id),
  farmer_id             uuid not null references farmers(id) on delete cascade,
  cycle_id              uuid not null references crop_cycles(id) on delete cascade,

  engine_version        varchar(20) not null,
  status                yield_analysis_status not null,

  cohort_definition     jsonb not null,   -- {crop_id, soil_class, season_year, zone, widened}
  cohort_size           integer not null,

  plot_yield_qt_ha      numeric(8,2),
  cohort_median_qt_ha   numeric(8,2),
  cohort_p75_qt_ha      numeric(8,2),
  gap_pct_vs_p75        numeric(6,2),     -- negative when the plot is above the top quartile

  -- [{factor, farmer_value, peer_value, delta, contribution_score, flags[]}]
  factor_results        jsonb not null default '[]',
  rain_onset_date       date,
  top_causes            jsonb not null default '[]',      -- up to 3 factor keys, ordered
  recommendations       jsonb not null default '[]',      -- 1–5 {factor, target_value, unit, message_key}

  narration_lang        app_language,
  narration_text        text,
  narration_audio_id    uuid references media_files(id),


  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  unique (cycle_id, engine_version),
  check (status <> 'completed' or cohort_size >= 5),
  check (jsonb_typeof(factor_results) = 'array')
);


-- ============================================================
-- WEATHER CACHE (server-side; mobile receives it via sync / GET)
-- Keyed by 0.1° grid cell and shared by all plots in the cell.
-- Rain onset (YIELD-4) is computed on demand from the historical weather API
-- using rain_onset.* in city_offices.parameters; only the resulting date is kept
-- on yield_gap_analyses.rain_onset_date. No daily rainfall series is stored.
-- ============================================================

create table weather_forecasts (
  id            uuid primary key default gen_random_uuid(),

  grid_lat      numeric(5,1) not null,
  grid_lng      numeric(5,1) not null,

  fetched_at    timestamptz not null,
  expires_at    timestamptz not null,              -- fetched_at + 3 hours

  current_obs   jsonb not null,    -- temp, rain probability, humidity, wind
  daily         jsonb not null,    -- 7 entries: min/max, rain prob, mm, wind, soil moisture index

  unique (grid_lat, grid_lng)
);


create table weather_alerts (
  id              uuid primary key default gen_random_uuid(),

  grid_lat        numeric(5,1) not null,
  grid_lng        numeric(5,1) not null,

  alert_type      weather_alert_type not null,
  starts_on       date not null,
  ends_on         date not null,
  details         jsonb not null,                  -- thresholds, forecast values

  created_at      timestamptz not null default now(),

  unique (grid_lat, grid_lng, alert_type, starts_on),
  check (ends_on >= starts_on)
);


-- ============================================================
-- DIAGNOSIS CASES (DIAG-1 to DIAG-12)
-- context_snapshot stores exactly what was sent to Gemini (no names,
-- phone numbers, IDs, or exact coordinates — SRS 4.2).
-- ============================================================

create table diagnosis_cases (
  id                        uuid primary key default gen_random_uuid(),

  city_office_id            uuid not null references city_offices(id),
  farmer_id                 uuid not null references farmers(id) on delete cascade,
  plot_id                   uuid not null references plots(id) on delete cascade,
  cycle_id                  uuid references crop_cycles(id),

  requested_by_user_id      uuid references users(id),

  -- Replaces diagnosis_case_photos (DIAG-1): 1 to 4 photos, order = display order.
  -- Elements are media_files.id values; validated by trg_diagnosis_photos.
  photo_media_ids           uuid[] not null default '{}',

  job_status                job_status not null default 'queued',

  context_snapshot          jsonb,
  raw_result                jsonb,

  pest_id                   uuid references pest_catalog(id),
  diagnosis_label           varchar(150),
  confidence                numeric(3,2),
  severity                  diagnosis_severity,

  -- Output after the registered-chemical safety filter (DIAG-4).
  filtered_recommendations  jsonb,
  removed_chemicals         jsonb not null default '[]',     -- audit of anything the filter dropped

  review_status             diagnosis_review_status not null default 'none',
  reviewed_by               uuid references users(id),
  reviewed_at               timestamptz,

  result_audio_id           uuid references media_files(id),
  failure_reason            varchar(255),

  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),

  check (confidence is null or (confidence >= 0 and confidence <= 1)),
  check (cardinality(photo_media_ids) between 1 and 4)
);


-- ============================================================
-- OUTBREAK CLUSTERS (AGENT-5, TRG-5)
-- Built by a scheduled job from diagnosis cases of farmers with consent_agreed and
-- pest_outbreak grievances. Stores kebele-level areas, never individual
-- identities.
-- ============================================================

create table outbreak_clusters (
  id              uuid primary key default gen_random_uuid(),

  city_office_id  uuid not null references city_offices(id),
  pest_id         uuid not null references pest_catalog(id),
  kebele_id       uuid references kebeles(id),

  centroid        geography(Point, 4326) not null,
  radius_m        integer not null,
  case_count      integer not null,

  -- Replaces the former outbreak_cluster_cases junction table. Holds diagnosis_cases.id and
  -- grievances.id values (UUIDs are globally unique, so no type column is needed). No FK by design:
  -- clusters are derived aggregations rebuilt by the scheduled job.
  contributing_case_ids uuid[] not null default '{}',

  window_start    date not null,
  window_end      date not null,

  status          varchar(10) not null default 'open',    -- open | closed
  alert_sent_at   timestamptz,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  check (case_count >= 1),
  check (window_end >= window_start),
  check (status in ('open', 'closed'))
);

```

### 3.3.6 Grievances & DA Tasks

```sql
-- ============================================================
-- GRIEVANCES — Voice Box (GRIEV-1 to GRIEV-8)
-- id is client-generated and is the de-duplication key (GRIEV-8).
-- ============================================================

create table grievances (
  id                    uuid primary key default gen_random_uuid(),

  city_office_id        uuid not null references city_offices(id),
  farmer_id             uuid not null references farmers(id),
  submitted_by_user_id  uuid references users(id),       -- farmer or DA

  category              grievance_category not null,
  plot_id               uuid references plots(id),
  kebele_id             uuid references kebeles(id),

  -- Plot centroid by default; device location only if the farmer shares it.
  location_lat          numeric(9,6),
  location_lng          numeric(9,6),

  audio_media_id        uuid references media_files(id),
  text_note             varchar(1000),
  pest_id               uuid references pest_catalog(id),   -- for pest_outbreak category

  status                grievance_status not null default 'submitted',
  priority              grievance_priority not null default 'normal',
  assignee_user_id      uuid references users(id),

  merged_into_id        uuid references grievances(id),     -- TRG-7

  -- Replaces grievance_photos (GRIEV-4): up to 3 photos. Elements are media_files.id
  -- values; validated by trg_grievances_photos.
  photo_media_ids       uuid[] not null default '{}',

  -- Replaces grievance_status_events. Append-only, maintained by the trigger
  -- trg_grievances_status_history; client-supplied values are ignored. Entry shape:
  -- {"from": "received", "to": "assigned", "actor_user_id": "…", "note": "…", "at": "2026-10-04T10:15:00Z"}
  status_history        jsonb not null default '[]',

  submitted_at          timestamptz not null default now(),
  received_at           timestamptz,
  resolved_at           timestamptz,

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  check (audio_media_id is not null or text_note is not null),
  check (status not in ('assigned', 'in_progress') or assignee_user_id is not null),
  check (resolved_at is null or received_at is null or resolved_at >= received_at),
  check (cardinality(photo_media_ids) <= 3),
  check (jsonb_typeof(status_history) = 'array')
);

-- ============================================================
-- GRIEVANCE MESSAGES (GRIEV-5, TRG-4)
-- Two-way threaded conversation between the farmer and the extension desk
-- (DA or officer). Replaces grievance_responses. id is client-generated, so a
-- message sent offline replays idempotently (SYNC-5). Append-only except
-- read_at and tts_media_id (set when the TTS job finishes), enforced by
-- trg_grievance_messages_protect.
-- The table carries no farmer_id; record_sync_change() scopes each message
-- to the farmer through the parent grievance (Section 3.4).
-- ============================================================

create table grievance_messages (
  id               uuid primary key default gen_random_uuid(),

  city_office_id   uuid not null references city_offices(id),
  grievance_id     uuid not null references grievances(id) on delete cascade,
  sender_user_id   uuid not null references users(id),     -- farmer, DA or officer

  message_type     message_kind not null,
  text_body        varchar(2000),
  audio_media_id   uuid references media_files(id),       -- recorded voice message
  tts_media_id     uuid references media_files(id),       -- generated from text_body

  read_at          timestamptz,                           -- set when the other party opens it

  created_at       timestamptz not null default now(),

  check (
    (message_type = 'text'  and text_body is not null)
    or (message_type = 'audio' and audio_media_id is not null)
  )
);


-- ============================================================
-- DA TASKS (ANLY-7, DIAG-6, TRG-3)
-- Pushed to the DA's device on next sync.
-- ============================================================

create table da_tasks (
  id                  uuid primary key default gen_random_uuid(),

  city_office_id      uuid not null references city_offices(id),
  assignee_user_id    uuid not null references users(id),
  created_by_user_id  uuid references users(id),

  task_type           task_type not null,
  status              task_status not null default 'open',
  title               varchar(200) not null,
  checklist           jsonb,

  farmer_id           uuid references farmers(id),
  plot_id             uuid references plots(id),
  grievance_id        uuid references grievances(id),
  diagnosis_case_id   uuid references diagnosis_cases(id),

  due_on              date,
  completed_at        timestamptz,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
```

### 3.3.7 Market Prices

```sql
-- ============================================================
-- MARKET CENTRES
-- ============================================================

create table market_centres (
  id              uuid primary key default gen_random_uuid(),

  city_office_id  uuid not null references city_offices(id) on delete cascade,

  name            varchar(80) not null,
  is_home         boolean not null default false,    -- the office's own market centre

  is_active       boolean not null default true,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  unique (city_office_id, name)
);

create unique index uq_market_centres_one_home
on market_centres(city_office_id)
where is_home;


-- ============================================================
-- MARKET SURVEYS (SURV-1 to SURV-7)
-- One row per crop / centre / survey date. Prices are stored per kg;
-- entered_unit keeps what the officer typed. Only 'verified' rows are
-- delivered to devices. Corrections create a new version and mark the
-- previous one 'superseded'.
-- ============================================================

create table market_surveys (
  id                    uuid primary key default gen_random_uuid(),

  city_office_id        uuid not null references city_offices(id),
  market_centre_id      uuid not null references market_centres(id),
  crop_id               uuid not null references crops(id),

  survey_date           date not null,
  entered_unit          quantity_unit not null,

  min_price_etb_per_kg  numeric(10,2) not null,
  avg_price_etb_per_kg  numeric(10,2) not null,
  max_price_etb_per_kg  numeric(10,2) not null,

  enumerator_user_id    uuid not null references users(id),

  status                survey_status not null default 'draft',
  version               integer not null default 1,
  supersedes_id         uuid references market_surveys(id),

  verified_by           uuid references users(id),
  verified_at           timestamptz,

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  check (survey_date <= current_date),
  check (min_price_etb_per_kg > 0
         and min_price_etb_per_kg <= avg_price_etb_per_kg
         and avg_price_etb_per_kg <= max_price_etb_per_kg),
  check (status <> 'verified' or verified_at is not null)
);

-- Verified rows are immutable (SURV-6); only one non-superseded row per key.
create unique index uq_market_surveys_current
on market_surveys(market_centre_id, crop_id, survey_date)
where status <> 'superseded';


-- ============================================================
-- CROWD-SOURCED SALES (MKT-2, MKT-3, SURV-4)
-- ============================================================

create table crowd_transactions (
  id                   uuid primary key default gen_random_uuid(),

  city_office_id       uuid not null references city_offices(id),
  farmer_id            uuid not null references farmers(id),
  created_by_user_id   uuid references users(id),

  crop_id              uuid not null references crops(id),
  market_centre_id     uuid not null references market_centres(id),

  entered_price        numeric(10,2) not null,
  entered_unit         quantity_unit not null,
  price_etb_per_kg     numeric(10,2) not null,      -- normalised (quintal ÷ 100)
  volume_kg            numeric(12,3) not null,
  sale_date            date not null,

  moderation_status    moderation_status not null default 'pending',
  outlier_flag         boolean not null default false,   -- >50% from latest verified survey average
  rejection_reason     varchar(255),
  moderated_by         uuid references users(id),
  moderated_at         timestamptz,

  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  deleted_at           timestamptz,

  check (entered_price > 0 and price_etb_per_kg > 0 and volume_kg > 0),
  check (sale_date <= current_date and sale_date >= current_date - 30),
  check (moderation_status <> 'rejected' or rejection_reason is not null)
);
```

### 3.3.8 Depots, Input Demand Aggregation

```sql
-- ============================================================
-- DEPOTS & INVENTORY (REG-6, REG-7)
-- depot_stock_items holds the running balance (never below zero);
-- depot_stock_movements is the ledger. Rows with status = 'received' are applied to
-- the balance by a trigger, so a negative balance fails the check constraint (API maps
-- this to 409 insufficient_stock). Rows with status 'expected' or 'confirmed' are
-- incoming shipments (REG-7): they do not touch the balance until they become
-- 'received', and they count toward the supply-gap formula. This replaces the
-- incoming_deliveries table. The API creates a zero-quantity depot_stock_items row
-- when a shipment is registered for an item that has no balance row yet.
-- ============================================================

create table depots (
  id              uuid primary key default gen_random_uuid(),

  city_office_id  uuid not null references city_offices(id) on delete cascade,
  kebele_id       uuid references kebeles(id),

  name            varchar(120) not null,
  is_active       boolean not null default true,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  unique (city_office_id, name)
);


create table depot_stock_items (
  id            uuid primary key default gen_random_uuid(),

  depot_id      uuid not null references depots(id) on delete cascade,

  item_type     stock_item_type not null,
  crop_id       uuid references crops(id),          -- required for seed
  variety_id    uuid references crop_varieties(id),

  quantity      numeric(14,3) not null default 0,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  check (quantity >= 0),
  check (item_type <> 'seed' or crop_id is not null)
);

create unique index uq_depot_stock_items
on depot_stock_items(
  depot_id, item_type,
  coalesce(crop_id,    '00000000-0000-0000-0000-000000000000'::uuid),
  coalesce(variety_id, '00000000-0000-0000-0000-000000000000'::uuid)
);


create table depot_stock_movements (
  id                   uuid primary key default gen_random_uuid(),

  depot_stock_item_id  uuid not null references depot_stock_items(id),

  movement_type        stock_movement_type not null,
  quantity_delta       numeric(14,3) not null,
  movement_date        date not null default current_date,
  reference_note       varchar(255),

  -- 'received' = applied to the balance now (default; all issues and adjustments).
  -- 'expected' / 'confirmed' = incoming shipment not yet in stock. 'cancelled' = voided shipment.
  status               varchar(20) not null default 'received',
  expected_on          date,

  recorded_by          uuid not null references users(id),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),

  check (status in ('expected', 'confirmed', 'received', 'cancelled')),
  check (
    (movement_type = 'receipt'    and quantity_delta > 0)
    or (movement_type = 'issue'   and quantity_delta < 0)
    or (movement_type = 'adjustment' and quantity_delta <> 0)
  ),
  -- Only receipts can be pending or cancelled; issues and adjustments are always immediate.
  check (status = 'received' or movement_type = 'receipt')
);


-- ============================================================
-- DEMAND SNAPSHOTS (REG-4, REG-5)
-- Officer kebele-level planned-area overrides are stored inside result->'overrides'.
-- No voucher entity exists in V1 (REG-10): demand stays aggregate.
-- ============================================================

create table demand_snapshots (
  id                 uuid primary key default gen_random_uuid(),

  city_office_id     uuid not null references city_offices(id) on delete cascade,
  season_year        smallint not null,

  safety_margin_pct  numeric(5,2) not null default 0,
  rates_version_ids  jsonb not null,           -- {crop_id: rates_version} used for the calculation
  -- {
  --   "rows":      [{kebele_id, crop_id, hectares, urea_kg, nps_kg, seed_kg}],
  --   "totals":    {urea_kg, nps_kg, seed_kg, hectares},
  --   "overrides": [{kebele_id, crop_id, hectares_override, reason, created_by}]   -- replaces kebele_crop_overrides
  -- }
  result             jsonb not null,

  created_by         uuid references users(id),
  created_at         timestamptz not null default now(),

  check (safety_margin_pct between 0 and 30)
);
```

### 3.3.9 Announcements & Multi-Channel Broadcasting

```sql
-- ============================================================
-- ANNOUNCEMENTS (COMM-1 to COMM-9)
-- ============================================================

create table announcements (
  id                          uuid primary key default gen_random_uuid(),

  city_office_id              uuid not null references city_offices(id) on delete cascade,
  created_by_user_id          uuid not null references users(id),

  announcement_type           announcement_type not null,
  status                      announcement_status not null default 'draft',

  -- Targeting (COMM-2). Empty arrays + target_all = whole city.
  target_all                  boolean not null default true,
  target_kebele_ids           uuid[] not null default '{}',
  target_crop_ids             uuid[] not null default '{}',
  target_zones                agro_zone[] not null default '{}',

  pest_id                     uuid references pest_catalog(id),     -- quarantine broadcasts
  template_code               varchar(60),                           -- optional code of a client/web-application template (no table)
  template_variables          jsonb,

  -- Replaces announcement_translations. Keys are language codes; each value is
  -- {"title": "…", "body": "…", "audio_media_id": "<uuid or null>"}. The API validates the
  -- title / body / audio shape and that audio_media_id belongs to the office.
  translations                jsonb not null default '{}',

  requires_acknowledgement    boolean not null default false,        -- true for emergency
  sms_fallback_after_minutes  smallint,                              -- null = no fallback

  expires_at                  timestamptz,
  published_at                timestamptz,
  recalled_at                 timestamptz,

  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now(),

  check (target_all or cardinality(target_kebele_ids) + cardinality(target_crop_ids) + cardinality(target_zones) > 0),
  check (status <> 'published' or published_at is not null),
  check (jsonb_typeof(translations) = 'object'),
  check ((translations - 'am' - 'om' - 'ti' - 'en') = '{}'::jsonb),
  check (status = 'draft' or translations <> '{}'::jsonb)
);


-- Per-recipient, per-channel state: delivery, read, acknowledgement.
create table announcement_deliveries (
  id                   uuid primary key default gen_random_uuid(),

  announcement_id      uuid not null references announcements(id) on delete cascade,
  city_office_id       uuid not null references city_offices(id),
  farmer_id            uuid not null references farmers(id),

  channel              delivery_channel not null,
  status               delivery_status not null default 'queued',

  provider_message_id  varchar(120),           -- SMS gateway reference
  segments             smallint,
  cost_etb             numeric(8,4),
  failure_reason       varchar(255),

  queued_at            timestamptz not null default now(),
  sent_at              timestamptz,
  delivered_at         timestamptz,
  read_at              timestamptz,
  acknowledged_at      timestamptz,

  unique (announcement_id, farmer_id, channel)    -- at most one SMS per farmer per announcement (COMM-5)
);
```

### 3.3.10 Sync, Audit & Platform Administration

```sql
-- ============================================================
-- DEVICES
-- ============================================================

create table devices (
  id                 uuid primary key default gen_random_uuid(),

  user_id            uuid not null references users(id) on delete cascade,
  city_office_id     uuid references city_offices(id),

  device_identifier  varchar(120) not null,       -- stable per-install id sent as X-Device-Id
  app_version        varchar(20),
  push_token         text,                         -- FCM

  last_cursor        bigint not null default 0,    -- last sync_changes.seq delivered (SYNC-4)
  last_sync_at       timestamptz,

  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),

  unique (user_id, device_identifier)
);


-- ============================================================
-- SYNC: CLIENT MUTATION LOG (SYNC-2, SYNC-5, SYNC-6)
-- id is the client-generated mutation UUID. Replaying a batch finds the
-- existing row and returns 'duplicate' without re-applying.
-- ============================================================

create table sync_mutations (
  id               uuid primary key,

  device_id        uuid not null references devices(id) on delete cascade,
  user_id          uuid not null references users(id),
  city_office_id   uuid not null references city_offices(id),

  entity           varchar(60) not null,      -- table name
  entity_id        uuid not null,
  op               sync_op not null,
  payload          jsonb not null,
  payload_hash     char(64) not null,         -- SHA-256 of canonical payload, recomputed by server
  client_seq       bigint not null,           -- client queue order
  client_created_at timestamptz not null,

  status           sync_mutation_status not null,
  reject_reason    varchar(255),

  received_at      timestamptz not null default now(),

  check (payload_hash ~ '^[0-9a-f]{64}$')
);


-- ============================================================
-- SYNC: SERVER CHANGE FEED (SYNC-4)
-- Appended by triggers on every synced table. Devices pull rows with
-- seq > devices.last_cursor, filtered to what they may see:
--   farmer → rows with farmer_id = own, or farmer_id null (office catalog)
--   DA     → rows whose farmer_id is among assigned farmers, or null
-- ============================================================

create table sync_changes (
  seq             bigint generated always as identity primary key,

  city_office_id  uuid not null,
  entity          varchar(60) not null,
  entity_id       uuid not null,
  op              sync_op not null,
  farmer_id       uuid,                        -- null for office-wide catalog data
  changed_at      timestamptz not null default now()
);


-- ============================================================
-- AUDIT LOG (SRS 4.2) — standard append-only table (no hash chain)
-- ============================================================

create table audit_logs (
  id               bigint generated always as identity primary key,

  city_office_id   uuid references city_offices(id),   -- null for platform-level actions
  actor_user_id    uuid references users(id),

  action           varchar(80) not null,               -- e.g. 'farmer.verify', 'office.parameters_update', 'log.correct', 'auth.login_failed'
  entity_type      varchar(60),
  entity_id        uuid,
  changes_json     jsonb,                              -- {"before": {...}, "after": {...}} or event details

  created_at       timestamptz not null default now()
);

```

## 3.4 Indexes, Triggers, Views & Row-Level Security

```sql
-- ============================================================
-- INDEXES
-- ============================================================

create index idx_users_office_role       on users(city_office_id, role);
create index idx_users_assigned_kebeles  on users using gin (assigned_kebele_ids) where role = 'da';
create index idx_sessions_user           on sessions(user_id);
create index idx_sessions_expiry         on sessions(expires_at);
create index idx_accounts_user           on accounts(user_id);
create index idx_verifications_identifier on verifications(identifier, created_at desc);

create index idx_kebeles_office          on kebeles(city_office_id);
create index idx_kebeles_boundary        on kebeles using gist (boundary);

create index idx_farmers_office_verified on farmers(city_office_id, is_verified) where deleted_at is null;
create index idx_farmers_da              on farmers(assigned_da_id) where deleted_at is null;
create index idx_farmers_kebele          on farmers(kebele_id);
create index idx_farmers_name_fts        on farmers using gin (to_tsvector('simple', full_name));

create index idx_plots_farmer            on plots(farmer_id) where deleted_at is null;
create index idx_plots_office_kebele     on plots(city_office_id, kebele_id) where deleted_at is null;
create index idx_plots_centroid          on plots using gist (centroid_geom);
create index idx_plots_weather_grid      on plots(weather_grid_lat, weather_grid_lng);
create index idx_plots_soil_zone         on plots(city_office_id, soil_class, agro_zone) where deleted_at is null;
create index idx_plots_planned_crop      on plots(city_office_id, planned_crop_id) where deleted_at is null and planned_crop_id is not null;

create index idx_cycles_plot             on crop_cycles(plot_id);
create index idx_cycles_cohort           on crop_cycles(city_office_id, crop_id, season_year, status);
create index idx_cycles_farmer           on crop_cycles(farmer_id);
create index idx_fertilizer_cycle        on fertilizer_logs(cycle_id) where deleted_at is null;
create index idx_operations_cycle        on field_operations(cycle_id, operation_type, operation_date) where deleted_at is null;
create index idx_ledger_cycle            on ledger_entries(cycle_id) where deleted_at is null;
create index idx_harvest_yield           on harvest_records(yield_qt_per_ha) where deleted_at is null;

create index idx_yield_gap_office        on yield_gap_analyses(city_office_id, created_at desc);
create index idx_weather_alerts_grid     on weather_alerts(grid_lat, grid_lng, starts_on);

create index idx_media_owner             on media_files(owner_user_id, created_at desc);
create index idx_media_status            on media_files(status) where status in ('pending', 'uploading');
create index idx_chemicals_target_crops  on registered_chemicals using gin (target_crop_ids) where status = 'active';
create index idx_chemicals_target_pests  on registered_chemicals using gin (target_pest_ids) where status = 'active';
create index idx_outbreak_case_ids       on outbreak_clusters using gin (contributing_case_ids);

create index idx_diagnosis_plot          on diagnosis_cases(plot_id, created_at desc);
create index idx_diagnosis_queue         on diagnosis_cases(job_status) where job_status in ('queued', 'processing');
create index idx_diagnosis_review        on diagnosis_cases(review_status) where review_status = 'pending_da_review';
create index idx_outbreak_office         on outbreak_clusters(city_office_id, status, window_end desc);
create index idx_outbreak_centroid       on outbreak_clusters using gist (centroid);

create index idx_grievances_triage       on grievances(city_office_id, status, category, submitted_at desc);
create index idx_grievances_assignee     on grievances(assignee_user_id, status);
create index idx_grievances_farmer       on grievances(farmer_id, submitted_at desc);
create index idx_grievance_messages      on grievance_messages(grievance_id, created_at);
create index idx_grievance_msg_unread    on grievance_messages(grievance_id) where read_at is null;
create index idx_da_tasks_assignee       on da_tasks(assignee_user_id, status);

create index idx_surveys_lookup          on market_surveys(city_office_id, crop_id, market_centre_id, survey_date desc) where status = 'verified';
create index idx_crowd_moderation        on crowd_transactions(city_office_id, moderation_status, created_at desc) where deleted_at is null;
create index idx_crowd_price_window      on crowd_transactions(crop_id, market_centre_id, sale_date) where moderation_status = 'verified';

create index idx_stock_items_depot       on depot_stock_items(depot_id);
create index idx_stock_movements_item    on depot_stock_movements(depot_stock_item_id, created_at desc);
create index idx_stock_movements_pending on depot_stock_movements(depot_stock_item_id, expected_on) where status in ('expected', 'confirmed');

create index idx_announcements_office    on announcements(city_office_id, status, published_at desc);
create index idx_deliveries_announcement on announcement_deliveries(announcement_id, channel, status);
create index idx_deliveries_farmer       on announcement_deliveries(farmer_id, queued_at desc);
create index idx_deliveries_unread       on announcement_deliveries(farmer_id, queued_at desc) where channel = 'app' and read_at is null;

create index idx_devices_user            on devices(user_id);
create index idx_sync_mutations_device   on sync_mutations(device_id, client_seq);
create index idx_sync_changes_pull       on sync_changes(city_office_id, seq);
create index idx_sync_changes_farmer     on sync_changes(farmer_id, seq);

create index idx_audit_office            on audit_logs(city_office_id, id desc);
create index idx_audit_entity            on audit_logs(entity_type, entity_id);
create index idx_audit_actor_action      on audit_logs(actor_user_id, action, created_at desc);


-- ============================================================
-- UPDATED_AT TRIGGER (applied to every base table with updated_at)
-- ============================================================

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare t text;
begin
  for t in
    select c.table_name
    from information_schema.columns c
    join information_schema.tables tb
      on tb.table_schema = c.table_schema and tb.table_name = c.table_name
    where c.table_schema = 'public'
      and c.column_name = 'updated_at'
      and tb.table_type = 'BASE TABLE'
  loop
    execute format(
      'create trigger trg_%s_updated_at before update on %I
       for each row execute function set_updated_at()', t, t);
  end loop;
end $$;


-- ============================================================
-- FARMER VERIFICATION FLAG
-- Farmers registered by a DA or Officer are verified immediately.
-- Self-registered farmers stay unverified (and fully active) until a
-- DA/Officer confirms them in the field.
-- ============================================================

create or replace function set_farmer_verified_on_insert()
returns trigger
language plpgsql
as $$
begin
  if new.registered_by_user_id is not null and exists (
    select 1 from users u
    where u.id = new.registered_by_user_id and u.role in ('da', 'officer')
  ) then
    new.is_verified := true;
  end if;
  return new;
end;
$$;

create trigger trg_farmers_verified_on_insert
before insert on farmers
for each row execute function set_farmer_verified_on_insert();


-- ============================================================
-- SOWING: derived seed rate (CROP-4)
-- ============================================================

create or replace function compute_sowing_derived()
returns trigger
language plpgsql
as $$
declare v_area numeric;
begin
  select p.area_hectares into v_area
  from crop_cycles c join plots p on p.id = c.plot_id
  where c.id = new.cycle_id;

  new.seed_rate_kg_per_ha := round(new.seed_quantity_kg / v_area, 2);
  return new;
end;
$$;

create trigger trg_sowing_derived
before insert or update on sowing_logs
for each row execute function compute_sowing_derived();


-- ============================================================
-- FERTILIZER: derived rate, days-after-sowing, ordering (CROP-6, CROP-7)
-- The sync engine applies each device's mutations in client order, so
-- urea_1 normally arrives before urea_2. days_after_sowing is recomputed
-- by the API if the planting date is edited afterwards.
-- ============================================================

create or replace function compute_fertilizer_derived()
returns trigger
language plpgsql
as $$
declare
  v_area  numeric;
  v_plant date;
  v_u1    date;
begin
  if not new.applied then
    return new;
  end if;

  select p.area_hectares, s.planting_date
    into v_area, v_plant
  from crop_cycles c
  join plots p on p.id = c.plot_id
  left join sowing_logs s on s.cycle_id = c.id and s.deleted_at is null
  where c.id = new.cycle_id;

  new.rate_kg_per_ha := round(new.quantity_kg / v_area, 2);

  if v_plant is not null then
    new.days_after_sowing := (new.application_date - v_plant);
    if new.application_type = 'urea_1' and new.application_date < v_plant then
      raise exception 'urea_1_before_sowing' using errcode = '23514';
    end if;
  end if;

  if new.application_type = 'urea_2' then
    select application_date into v_u1
    from fertilizer_logs
    where cycle_id = new.cycle_id
      and application_type = 'urea_1'
      and applied and deleted_at is null;

    if v_u1 is not null then
      if new.application_date <= v_u1 then
        raise exception 'urea_2_not_after_urea_1' using errcode = '23514';
      end if;
    end if;
  end if;

  return new;
end;
$$;

create trigger trg_fertilizer_derived
before insert or update on fertilizer_logs
for each row execute function compute_fertilizer_derived();


-- ============================================================
-- HARVEST: computed yield + plausibility gate (CROP-10)
-- ============================================================

-- volume_kg is a generated column and is not yet populated inside a BEFORE
-- trigger, so the kg value is recomputed here from the entered values.
create or replace function compute_harvest_yield_before()
returns trigger
language plpgsql
as $$
declare
  v_kg      numeric;
  v_area    numeric;
  v_ceiling numeric;
  v_planted date;
begin
  v_kg := case new.entered_unit when 'quintal' then new.entered_volume * 100 else new.entered_volume end;

  select p.area_hectares, cr.max_plausible_yield_qt_ha, s.planting_date
    into v_area, v_ceiling, v_planted
  from crop_cycles c
  join plots p  on p.id  = c.plot_id
  join crops cr on cr.id = c.crop_id
  left join sowing_logs s on s.cycle_id = c.id and s.deleted_at is null
  where c.id = new.cycle_id;

  if v_planted is not null and new.harvest_date < v_planted then
    raise exception 'harvest_before_sowing' using errcode = '23514';
  end if;

  new.yield_qt_per_ha := round((v_kg / 100.0) / v_area, 2);

  if new.yield_qt_per_ha > v_ceiling and not new.plausibility_confirmed then
    raise exception 'yield_requires_confirmation' using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger trg_harvest_yield
before insert or update on harvest_records
for each row execute function compute_harvest_yield_before();


-- ============================================================
-- DEPOT STOCK: apply each received movement to the running balance (REG-6)
-- The balance row is locked by the UPDATE; the check (quantity >= 0)
-- constraint rejects any movement that would overdraw stock.
-- A movement hits the balance exactly once: on insert with status 'received', or when a
-- pending ('expected' / 'confirmed') shipment is updated to 'received' (REG-7).
-- ============================================================

create or replace function apply_stock_movement()
returns trigger
language plpgsql
as $$
begin
  if (tg_op = 'INSERT' and new.status = 'received')
     or (tg_op = 'UPDATE' and old.status <> 'received' and new.status = 'received') then
    update depot_stock_items
    set quantity = quantity + new.quantity_delta
    where id = new.depot_stock_item_id;
  end if;
  return new;
end;
$$;

create trigger trg_stock_movement_apply
after insert or update of status on depot_stock_movements
for each row execute function apply_stock_movement();


-- ============================================================
-- PHOTO ARRAYS: referential check for uuid[] columns
-- diagnosis_cases.photo_media_ids and grievances.photo_media_ids cannot carry
-- foreign keys, so this trigger enforces them: every id must exist, be an image,
-- belong to the same office, and appear only once. The media upload may still be
-- in progress (status pending / uploading), which keeps 2G/3G submissions working.
-- ============================================================

create or replace function validate_photo_media_ids()
returns trigger
language plpgsql
as $$
declare
  v_expected integer;
  v_found    integer;
begin
  select count(distinct x) into v_expected from unnest(new.photo_media_ids) as x;

  if v_expected <> cardinality(new.photo_media_ids) then
    raise exception 'duplicate_photo_media' using errcode = '23514';
  end if;

  select count(*) into v_found
  from media_files m
  where m.id = any(new.photo_media_ids)
    and m.city_office_id = new.city_office_id
    and m.kind = 'image';

  if v_found <> v_expected then
    raise exception 'invalid_photo_media' using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger trg_diagnosis_photos
before insert or update of photo_media_ids on diagnosis_cases
for each row execute function validate_photo_media_ids();

create trigger trg_grievances_photos
before insert or update of photo_media_ids on grievances
for each row execute function validate_photo_media_ids();


-- ============================================================
-- DA KEBELE COVERAGE: referential check for users.assigned_kebele_ids
-- Replaces the da_kebele_assignments foreign keys. Only a DA may carry kebele ids; every
-- id must be unique, belong to the user's office and not be soft-deleted. The API must
-- clear the array in the same UPDATE that changes a DA to another role.
-- ============================================================

create or replace function validate_user_kebele_ids()
returns trigger
language plpgsql
as $$
declare
  v_expected integer;
  v_found    integer;
begin
  if cardinality(new.assigned_kebele_ids) = 0 then
    return new;
  end if;

  if new.role <> 'da' then
    raise exception 'kebeles_only_for_da' using errcode = '23514';
  end if;

  select count(distinct x) into v_expected from unnest(new.assigned_kebele_ids) as x;

  if v_expected <> cardinality(new.assigned_kebele_ids) then
    raise exception 'duplicate_kebele_assignment' using errcode = '23514';
  end if;

  select count(*) into v_found
  from kebeles k
  where k.id = any(new.assigned_kebele_ids)
    and k.city_office_id = new.city_office_id
    and k.deleted_at is null;

  if v_found <> v_expected then
    raise exception 'invalid_kebele_assignment' using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger trg_users_kebele_ids
before insert or update of assigned_kebele_ids, role, city_office_id on users
for each row execute function validate_user_kebele_ids();


-- ============================================================
-- GRIEVANCE STATUS HISTORY (replaces grievance_status_events)
-- Appends one entry per status change and discards any client-supplied
-- history, so the trail stays append-only. The API sets two transaction-local
-- settings before changing a status (same mechanism as app.city_office_id):
--   select set_config('app.actor_user_id', $1, true);
--   select set_config('app.status_note',   $2, true);   -- optional
-- ============================================================

create or replace function maintain_grievance_status_history()
returns trigger
language plpgsql
as $$
declare
  v_actor uuid := nullif(current_setting('app.actor_user_id', true), '')::uuid;
  v_note  text := left(nullif(current_setting('app.status_note', true), ''), 255);
begin
  if tg_op = 'INSERT' then
    new.status_history := jsonb_build_array(jsonb_build_object(
      'from',          null::text,
      'to',            new.status,
      'actor_user_id', coalesce(v_actor, new.submitted_by_user_id),
      'note',          v_note,
      'at',            now()));
  elsif new.status is distinct from old.status then
    new.status_history := old.status_history || jsonb_build_array(jsonb_build_object(
      'from',          old.status,
      'to',            new.status,
      'actor_user_id', v_actor,
      'note',          v_note,
      'at',            now()));
  else
    new.status_history := old.status_history;
  end if;
  return new;
end;
$$;

create trigger trg_grievances_status_history
before insert or update on grievances
for each row execute function maintain_grievance_status_history();


-- ============================================================
-- GRIEVANCE MESSAGES: append-only except read_at and tts_media_id
-- ============================================================

create or replace function protect_grievance_message()
returns trigger
language plpgsql
as $$
begin
  if (new.id, new.city_office_id, new.grievance_id, new.sender_user_id, new.message_type,
      new.text_body, new.audio_media_id, new.created_at)
     is distinct from
     (old.id, old.city_office_id, old.grievance_id, old.sender_user_id, old.message_type,
      old.text_body, old.audio_media_id, old.created_at) then
    raise exception 'message_immutable' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger trg_grievance_messages_protect
before update on grievance_messages
for each row execute function protect_grievance_message();


-- ============================================================
-- IMMUTABILITY: audit logs, stock movements (except the pending-shipment
-- status flow), verified market surveys
-- ============================================================

create or replace function prevent_update_delete()
returns trigger
language plpgsql
as $$
begin
  raise exception '% is immutable', tg_table_name using errcode = '42501';
end;
$$;

-- Stock movements are never deleted. A movement is immutable once it is 'received' or
-- 'cancelled'. While 'expected' or 'confirmed' it may change quantity, expected_on,
-- movement_date and reference_note, and may move forward only:
--   expected -> confirmed | received | cancelled,  confirmed -> received | cancelled.
create or replace function protect_stock_movement()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'depot_stock_movements is immutable' using errcode = '42501';
  end if;

  if (new.id, new.depot_stock_item_id, new.movement_type, new.recorded_by, new.created_at)
     is distinct from
     (old.id, old.depot_stock_item_id, old.movement_type, old.recorded_by, old.created_at) then
    raise exception 'movement_immutable' using errcode = '42501';
  end if;

  if old.status in ('received', 'cancelled') then
    raise exception 'movement_immutable' using errcode = '42501';
  end if;

  if old.status = 'confirmed' and new.status = 'expected' then
    raise exception 'invalid_movement_transition' using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger trg_stock_movements_protect
before update or delete on depot_stock_movements
for each row execute function protect_stock_movement();

create trigger trg_audit_logs_immutable
before update or delete on audit_logs
for each row execute function prevent_update_delete();


-- Verified surveys can only change status to 'superseded' (SURV-6).
create or replace function protect_verified_survey()
returns trigger
language plpgsql
as $$
begin
  if old.status = 'verified' and not (
       new.status = 'superseded'
       and new.min_price_etb_per_kg = old.min_price_etb_per_kg
       and new.avg_price_etb_per_kg = old.avg_price_etb_per_kg
       and new.max_price_etb_per_kg = old.max_price_etb_per_kg
     ) then
    raise exception 'verified survey is immutable; create a corrected version' using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger trg_market_surveys_protect
before update on market_surveys
for each row execute function protect_verified_survey();


-- ============================================================
-- SYNC CHANGE FEED
-- Appends one row per change to every synced table. Rows without a
-- farmer_id (catalog, market surveys, announcements, office configuration)
-- go to all users of the office. city_offices has no city_office_id column,
-- so its own id is used as the office scope; this delivers changes to
-- city_offices.parameters (thresholds, land-unit factors) to devices for offline use.
-- ============================================================

create or replace function record_sync_change()
returns trigger
language plpgsql
as $$
declare
  r        jsonb;
  v_farmer uuid;
begin
  r := to_jsonb(case when tg_op = 'DELETE' then old else new end);

  v_farmer := coalesce(
    nullif(r->>'farmer_id', '')::uuid,
    case when tg_table_name = 'farmers' then (r->>'id')::uuid end);

  -- grievance_messages has no farmer_id: scope it through the parent ticket so a
  -- message is never delivered as office-wide data.
  if v_farmer is null and tg_table_name = 'grievance_messages' then
    select g.farmer_id into v_farmer
    from grievances g
    where g.id = (r->>'grievance_id')::uuid;
  end if;

  insert into sync_changes (city_office_id, entity, entity_id, op, farmer_id)
  values (
    coalesce(
      nullif(r->>'city_office_id', '')::uuid,
      case when tg_table_name = 'city_offices' then (r->>'id')::uuid end),
    tg_table_name,
    (r->>'id')::uuid,
    case tg_op when 'INSERT' then 'insert' when 'DELETE' then 'delete' else 'update' end::sync_op,
    v_farmer);
  return null;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'city_offices',
    'farmers', 'plots', 'plot_crop_history',
    'crop_cycles', 'sowing_logs', 'fertilizer_logs', 'field_operations',
    'harvest_records', 'ledger_entries',
    'yield_gap_analyses', 'diagnosis_cases',
    'grievances', 'grievance_messages', 'da_tasks',
    'crowd_transactions',
    'crops', 'crop_varieties',
    'registered_chemicals', 'pest_catalog',
    'market_centres', 'market_surveys',
    'announcements'
  ] loop
    execute format(
      'create trigger trg_%s_sync after insert or update or delete on %I
       for each row execute function record_sync_change()', t, t);
  end loop;
end $$;
-- No child tables ride with a parent any more: photo arrays, translations, weeding
-- windows, status history and the planned crop are columns on synced parents.
-- grievance_messages is its own synced entity; its farmer scope is resolved from the
-- parent grievance inside record_sync_change().
-- da_tasks rows are delivered only to assignee_user_id regardless of farmer_id.
-- city_offices rows are projected by the pull endpoint to name, default_language and parameters only.
-- Weeding windows, recommended successors, chemical target arrays and cluster case ids are
-- columns on synced parents (crops, registered_chemicals), so they sync with the parent row.


-- ============================================================
-- VIEWS
-- ============================================================

-- Latest verified survey price per crop and market centre (MKT-1, MKT-5).
create or replace view v_latest_prices as
select distinct on (s.market_centre_id, s.crop_id)
  s.city_office_id, s.market_centre_id, s.crop_id,
  s.survey_date,
  s.min_price_etb_per_kg, s.avg_price_etb_per_kg, s.max_price_etb_per_kg,
  (current_date - s.survey_date) > 14 as is_stale   -- default; the API uses market.stale_days
from market_surveys s
where s.status = 'verified'
order by s.market_centre_id, s.crop_id, s.survey_date desc;


-- Verified farmer-reported price indicator (SURV-5): median of the last 14
-- days, only when at least 5 verified entries exist.
create or replace view v_farmer_reported_prices as
select
  city_office_id, crop_id, market_centre_id,
  percentile_cont(0.5) within group (order by price_etb_per_kg) as median_price_etb_per_kg,
  count(*) as entry_count
from crowd_transactions
where moderation_status = 'verified'
  and deleted_at is null
  and sale_date >= current_date - 14
group by city_office_id, crop_id, market_centre_id
having count(*) >= 5;


-- Fertilizer split pivot used by the yield-gap engine (YIELD-3).
create or replace view v_cycle_fertilizer_splits as
select
  c.id as cycle_id,
  max(f.quantity_kg)       filter (where f.application_type = 'basal')  as basal_kg,
  max(f.application_date)  filter (where f.application_type = 'basal')  as basal_date,
  bool_or(f.applied)       filter (where f.application_type = 'basal')  as basal_applied,
  max(f.quantity_kg)       filter (where f.application_type = 'urea_1') as urea1_kg,
  max(f.days_after_sowing) filter (where f.application_type = 'urea_1') as urea1_das,
  bool_or(f.applied)       filter (where f.application_type = 'urea_1') as urea1_applied,
  max(f.quantity_kg)       filter (where f.application_type = 'urea_2') as urea2_kg,
  max(f.days_after_sowing) filter (where f.application_type = 'urea_2') as urea2_das,
  bool_or(f.applied)       filter (where f.application_type = 'urea_2') as urea2_applied
from crop_cycles c
left join fertilizer_logs f on f.cycle_id = c.id and f.deleted_at is null
group by c.id;


-- Live city-wide input demand (REG-4). Reads only plots, farmers, crop_cycles and
-- fertilizer_rates, so it is unaffected by the v1.3 consolidation. Uses the active cycle's crop,
-- falling back to the plot's planned crop (plots.planned_crop_id). All active farmers count;
-- is_verified is exposed so planners can filter verified vs. unverified.
create or replace view v_city_input_demand_live as
with plot_crop as (
  select
    p.id as plot_id, p.city_office_id, p.kebele_id, p.agro_zone, p.area_hectares, f.is_verified,
    coalesce(ac.crop_id, p.planned_crop_id) as crop_id
  from plots p
  join farmers f
    on f.id = p.farmer_id and f.deleted_at is null
  left join lateral (
    select c.crop_id from crop_cycles c
    where c.plot_id = p.id and c.status = 'active' and c.deleted_at is null
    limit 1
  ) ac on true
  where p.deleted_at is null and p.status = 'active'
)
select
  pc.city_office_id, pc.kebele_id, pc.crop_id, pc.is_verified,
  sum(pc.area_hectares)                  as hectares,
  sum(pc.area_hectares * fr.urea_kg_ha)  as urea_kg,
  sum(pc.area_hectares * fr.nps_kg_ha)   as nps_kg,
  sum(pc.area_hectares * fr.seed_kg_ha)  as seed_kg,
  max(fr.rates_version)                  as rates_version
from plot_crop pc
join lateral (
  select r.*
  from fertilizer_rates r
  where r.city_office_id = pc.city_office_id
    and r.crop_id        = pc.crop_id
    and r.agro_zone      = pc.agro_zone
    and r.effective_from <= current_date
  order by r.effective_from desc
  limit 1
) fr on true
where pc.crop_id is not null
group by pc.city_office_id, pc.kebele_id, pc.crop_id, pc.is_verified;


-- Depot stock per office and item (REG-7): on-hand balance plus incoming shipments.
-- Supply gap = demand - on_hand_kg - incoming_kg, where incoming_kg sums
-- depot_stock_movements with status in ('expected', 'confirmed').
create or replace view v_office_stock as
select
  d.city_office_id, i.item_type, i.crop_id,
  sum(i.quantity)                      as on_hand_kg,
  coalesce(sum(inc.incoming_kg), 0)    as incoming_kg
from depot_stock_items i
join depots d on d.id = i.depot_id and d.is_active
left join lateral (
  select sum(m.quantity_delta) as incoming_kg
  from depot_stock_movements m
  where m.depot_stock_item_id = i.id
    and m.status in ('expected', 'confirmed')
) inc on true
group by d.city_office_id, i.item_type, i.crop_id;

```

### Reference query: peer cohort (YIELD-1, YIELD-2)

```sql
-- $1 office, $2 crop, $3 season_year, $4 soil_class
select
  count(*)                                                    as cohort_size,
  percentile_cont(0.50) within group (order by h.yield_qt_per_ha) as median_qt_ha,
  percentile_cont(0.75) within group (order by h.yield_qt_per_ha) as p75_qt_ha
from crop_cycles c
join harvest_records h on h.cycle_id = c.id and h.deleted_at is null
join plots   p on p.id = c.plot_id
where c.city_office_id = $1
  and c.crop_id        = $2
  and c.season_year    = $3
  and p.soil_class     = $4
  and c.status         = 'closed'
  and c.deleted_at is null;
-- The engine then takes cycles with yield >= p75 as the "top-quartile producers"
-- and computes the median of each input factor over that group.
```

### Optional row-level security (defense in depth)

```sql
-- The tenant middleware opens a transaction per request and runs:
--   select set_config('app.city_office_id', $1, true);   -- local to the transaction
--   select set_config('app.actor_user_id',  $2, true);   -- read by trg_grievances_status_history
-- Application connections use a role that does NOT bypass RLS. Workers and the
-- system-admin support role use a separate role and every use is written to audit_logs.

-- 1. Every base table with a NOT NULL city_office_id column.
do $$
declare t text;
begin
  for t in
    select c.table_name
    from information_schema.columns c
    join information_schema.tables tb
      on tb.table_schema = c.table_schema and tb.table_name = c.table_name
    where c.table_schema = 'public'
      and c.column_name  = 'city_office_id'
      and c.is_nullable  = 'NO'
      and tb.table_type  = 'BASE TABLE'
  loop
    execute format('alter table %I enable row level security', t);
    execute format(
      'create policy %I on %I
         using (city_office_id = nullif(current_setting(''app.city_office_id'', true), '''')::uuid)',
      t || '_tenant_isolation', t);
  end loop;
end $$;

-- 2. The office row itself.
alter table city_offices enable row level security;
create policy city_offices_tenant_isolation on city_offices
  using (id = nullif(current_setting('app.city_office_id', true), '')::uuid);

-- 3. Depot stock tables have no office column; scope them through depots.
alter table depot_stock_items enable row level security;
create policy depot_stock_items_tenant_isolation on depot_stock_items
  using (exists (
    select 1 from depots d
    where d.id = depot_stock_items.depot_id
      and d.city_office_id = nullif(current_setting('app.city_office_id', true), '')::uuid));

alter table depot_stock_movements enable row level security;
create policy depot_stock_movements_tenant_isolation on depot_stock_movements
  using (exists (
    select 1
    from depot_stock_items i
    join depots d on d.id = i.depot_id
    where i.id = depot_stock_movements.depot_stock_item_id
      and d.city_office_id = nullif(current_setting('app.city_office_id', true), '')::uuid));

-- 4. Tables whose city_office_id is nullable.
alter table devices enable row level security;
create policy devices_tenant_isolation on devices
  using (city_office_id = nullif(current_setting('app.city_office_id', true), '')::uuid
         or user_id     = nullif(current_setting('app.actor_user_id',  true), '')::uuid);

alter table audit_logs enable row level security;
create policy audit_logs_tenant_isolation on audit_logs
  using (city_office_id = nullif(current_setting('app.city_office_id', true), '')::uuid);
-- Platform-level audit rows (city_office_id null) are visible only to the system-admin role.

-- Not covered by RLS, by design:
--   users, accounts, sessions, verifications  (auth core: read before a tenant scope exists;
--                                              tenant filtering is applied by the API)
--   weather_forecasts, weather_alerts         (shared grid cache with no tenant column)
```

---

# 4. API Surface (v1)

Base URL: `https://<host>/api`. Authentication routes are under `/api/auth/*`; all application routes are under `/api/v1`. Every `GET`/list endpoint excludes soft-deleted rows (`deleted_at is null`) by default.

**Role legend** used in the *Roles* column: **F** farmer · **D** development agent · **O** city agriculture officer · **A** system admin · **Any** any authenticated user · **Public** no session.

## 4.1 Conventions

### Request / response conventions

| Topic | Rule |
|---|---|
| Auth | Cookie session (web) or `Authorization: Bearer <session token>` (mobile); see Section 2.3 |
| Tenancy | `city_office_id` is read from the authenticated user; it is **never** accepted from the client. Cross-office resources return `404`. |
| Request headers | `X-Device-Id` (mobile), `Accept-Language` (`am`, `om`, `ti`, `en`), `Idempotency-Key` (UUID, required on `POST`/`PUT`/`PATCH`/`DELETE` from mobile) |
| Success body | `{ "data": …, "meta": { "next_cursor": "…", "total": 0 } }` (`meta` only on lists) |
| Error body | `{ "error": { "code": "…", "message": "…", "details": {…}, "request_id": "…" } }` |
| Pagination | `limit` (default 50, max 200) + opaque `cursor`; the registry also supports `page` for the web tables |
| Dates | `date` fields `YYYY-MM-DD` (Gregorian, UTC storage); timestamps ISO 8601 UTC. Calendar conversion is a client display concern. |
| Validation | Request bodies and query strings are validated against schemas; the OpenAPI 3.1 document is generated from them |
| Background work | Gemini calls, TTS, SMS fan-out, yield-gap runs, clustering and exports run in a worker queue (e.g. `pg-boss` on the same PostgreSQL) so HTTP requests return quickly |

### Common error codes

| HTTP | `code` | Meaning |
|---|---|---|
| 400 | `validation_failed` | Schema validation failed; `details` lists fields |
| 401 | `unauthenticated`, `invalid_credentials`, `otp_invalid`, `otp_expired` | No / expired / revoked session; wrong password or OTP |
| 403 | `forbidden` | Role not allowed |
| 404 | `not_found` | Missing or in another office |
| 409 | `conflict`, `insufficient_stock`, `one_active_cycle`, `slot_exists` | Constraint violations mapped from PostgreSQL errors |
| 422 | `yield_requires_confirmation`, `urea_2_not_after_urea_1`, `urea_1_before_sowing`, `harvest_before_sowing`, `invalid_photo_media`, `duplicate_photo_media`, `message_immutable`, `kebeles_only_for_da`, `duplicate_kebele_assignment`, `invalid_kebele_assignment`, `movement_immutable`, `invalid_movement_transition` | Domain rule violations raised by triggers |
| 429 | `rate_limited`, `otp_rate_limited`, `account_locked`, `ai_quota_exceeded` | Throttled |
| 503 | `provider_unavailable` | Gemini / weather / SMS provider down; the client queues and retries |

### Module → route mapping (SRS 4.5 modular monolith)

| Module | Route prefix |
|---|---|
| `identity` | `/api/auth/*`, `/v1/users`, `/v1/devices`, `/v1/inbox` |
| `registry` | `/v1/farmers`, `/v1/plots`, `/v1/office/registry`, `/v1/office/demand`, `/v1/office/depots` |
| `catalog` | `/v1/catalog/*` |
| `cropLog` | `/v1/cycles`, `/v1/plots/:id/cycles` |
| `yieldGap` | `/v1/cycles/:id/yield-gap`, `/v1/office/analytics` |
| `weather` | `/v1/plots/:id/weather`, `/v1/weather` |
| `diagnostics` | `/v1/diagnoses`, `/v1/rotation-advice` |
| `grievance` | `/v1/grievances`, `/v1/office/grievances`, `/v1/office/outbreaks` |
| `market` | `/v1/market`, `/v1/office/market` |
| `broadcast` | `/v1/announcements`, `/v1/office/announcements`, `/v1/webhooks/sms` |
| `sync` | `/v1/sync/*` |
| `media` | `/v1/media/*` |
| `voice` | `/v1/voice/*` |
| `audit` | `/v1/office/audit-logs`, `/v1/admin/audit-logs` |

### Middleware chain

```text
cors → requestId → logger → session lookup → banned/deleted check
     → tenant scope → role check → idempotency → rate limit
     → request validation → handler → audit (privileged writes)
```

The tenant-scope step also runs `set_config('app.actor_user_id', <user id>, true)` for the transaction; `trg_grievances_status_history` reads it to record who changed a ticket's status.

---

## 4.2 Authentication

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| `POST` | `/api/auth/phone/send-otp` | Public | `{phone_number}` — store the code in `verifications` and send the 6-digit SMS (10-minute expiry; max 5 requests per phone per hour) |
| `POST` | `/api/auth/phone/verify` | Public | `{phone_number, code}` — verify (max 5 attempts); creates the user on first success (`role = farmer`, active immediately) and starts a session |
| `POST` | `/api/auth/login` | Public | Officer / system admin `{email, password}`; on success sends the second-step SMS OTP; 5 failures lock the account for 15 minutes |
| `POST` | `/api/auth/login/verify-otp` | Public | Verify the second-step OTP (mandatory for officers and admins, ADM-8); starts the session |
| `GET` | `/api/auth/session` | Any | Return current session and user |
| `POST` | `/api/auth/sign-out` | Any | End the current session |
| `GET` | `/api/auth/sessions` | Any | List the user's active sessions |
| `POST` | `/api/auth/sessions/revoke` | Any | Revoke one session |
| `POST` | `/api/auth/change-password` | O, A | Change password (revokes other sessions) |
| `POST` | `/api/auth/request-password-reset` | O, A | Email reset link (token stored in `verifications`) |
| `POST` | `/api/auth/reset-password` | Public | Complete reset with token |
| `POST` | `/v1/admin/users/{id}/deactivate` | A | Set `banned = true` and delete the user's sessions |
| `POST` | `/v1/admin/users/{id}/reactivate` | A | Set `banned = false` |

Application-level account endpoints:

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| `GET` | `/v1/users/me` | Any | Profile, role, office, language, farmer record id |
| `PATCH` | `/v1/users/me` | Any | Update `name`, `preferred_language` |
| `DELETE` | `/v1/users/me` | Any | Soft-delete (close) the account; tombstones email/phone (Section 2.5) |

---

## 4.3 Office Configuration & Territory (ADM-1 to ADM-7)

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| `GET` | `/v1/offices/me` | Any | Own office summary (name, default language, jurisdiction bounds); officers also receive the full `parameters` object |
| `PATCH` | `/v1/offices/me` | O | Update `default_language` and `parameters`. `parameters` is a shallow merge by key (a `null` value removes the key); the full object is never replaced. Values are validated per key (types and ranges). Every change writes `audit_logs` with `action = 'office.parameters_update'` and before/after values; that trail is the parameter history |
| `GET` | `/v1/offices/me/config` | F, D | Thresholds the app needs offline (zone cut-offs, land-unit factors, confidence threshold, weather and alert thresholds), projected from `city_offices.parameters`; also delivered through delta-sync (`city_offices` entity) |
| `GET` | `/v1/kebeles` | Any | List kebeles (names, boundaries simplified for devices) |
| `POST` | `/v1/office/kebeles` | O | Create kebele (polygon or centroid + radius); overlaps are allowed |
| `PATCH` | `/v1/office/kebeles/{id}` | O | Update territory or name |
| `DELETE` | `/v1/office/kebeles/{id}` | O | Soft-delete (blocked if farmers are assigned; the id is removed from every DA's `assigned_kebele_ids` in the same transaction) |
| `GET` | `/v1/office/users` | O | List DAs and officers of the office |
| `POST` | `/v1/office/users` | O | Create a DA or officer (role limited to `da`/`officer`); optional `assigned_kebele_ids[]` for a DA; sends an SMS invite (DA) or email invite (officer) |
| `PATCH` | `/v1/office/users/{id}` | O | Update name, phone, role (DA ↔ officer) and `assigned_kebele_ids[]` (DA only; replaces the whole array; every id must be an active kebele of the office; changing a DA to officer must send an empty array) |
| `POST` | `/v1/office/users/{id}/deactivate` | O | Deactivate (`banned = true`); deletes the user's sessions within 60 s |
| `POST` | `/v1/office/farmers/reassign` | O | Bulk reassign farmers to a DA (`farmer_ids[]` up to 200, or CSV upload) |

---

## 4.4 Farmers (PLOT-1 to PLOT-3, AGENT-2)

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| `POST` | `/v1/farmers/me` | F | Create own farmer profile after OTP login (name, local ID, kebele, `consent_agreed`); sets `users.city_office_id`. The farmer is active immediately; `is_verified = false` |
| `GET` | `/v1/farmers/me` | F | Get own profile and `is_verified` flag |
| `PATCH` | `/v1/farmers/me` | F | Update profile fields |
| `POST` | `/v1/farmers/claim` | F | Claim a DA-registered profile (`local_id_number`); merges into the OTP-verified user |
| `POST` | `/v1/farmers` | D | Register a farmer on someone's behalf; `phone_number` optional (`no_phone = true`) |
| `GET` | `/v1/farmers` | D, O | Search and filter (`q`, `kebele_id`, `da_id`, `is_verified`, `crop_id`, `soil_class`) |
| `GET` | `/v1/farmers/{id}` | D, O | Farmer detail (DAs: assigned farmers only) |
| `PATCH` | `/v1/farmers/{id}` | D, O | Update profile |
| `PATCH` | `/v1/farmers/{id}/verify` | D, O | Set `is_verified = true` after meeting the farmer in the field; audit-logged. Never blocks any feature |
| `PATCH` | `/v1/office/farmers/{id}/assign-da` | O | Assign the farmer to a DA |

### Verification payload

```json
{ "is_verified": true }
```

Farmers registered by a DA or Officer (`POST /v1/farmers`) are verified automatically by the `trg_farmers_verified_on_insert` trigger. Self-registered farmers have full app access from the moment their phone is verified.

---

## 4.5 Plots, Soil & Crop History (PLOT-4 to PLOT-10, CROP-1)

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| `GET` | `/v1/farmers/{farmerId}/plots` | F (own), D, O | List plots |
| `POST` | `/v1/farmers/{farmerId}/plots` | F (own), D | Create plot (area, unit, centroid, accuracy, soil, drainage; optional `planned_crop_id` + `planned_season_year`). Server derives elevation, zone, kebele and stores the conversion factor in force. |
| `GET` | `/v1/plots/{id}` | F (own), D, O | Plot detail, including `planned_crop_id` and `planned_season_year` |
| `PATCH` | `/v1/plots/{id}` | F (own), D, O | Update plot fields, including the planned crop (`planned_crop_id` + `planned_season_year`, set both or send both as `null` to clear; the crop must be active in the office catalog). Feeds demand aggregation; `updated_at` is maintained automatically |
| `POST` | `/v1/plots/{id}/archive` | F (own), D | Archive plot (hidden, kept for analytics) |
| `POST` | `/v1/plots/{id}/restore` | F (own), D | Restore plot |
| `PUT` | `/v1/plots/{id}/agro-zone` | D, O | Override the derived zone (`reason` required) |
| `GET` | `/v1/plots/{id}/crop-history` | F (own), D, O | 1–3 season crop history |
| `PUT` | `/v1/plots/{id}/crop-history/{season_year}` | F (own), D | Set crop or `fallow` for a season |
| `GET` | `/v1/geo/resolve` | F, D | Helper: given `lat`,`lng` returns elevation, zone, kebele and in-jurisdiction check |

### Create plot payload

```json
{
  "id": "1b7e6d3c-0e0a-4b0c-9b64-2f8a1f6a3c11",
  "name": "Lower field",
  "area_value": 2,
  "area_unit": "timad",
  "centroid": { "lat": 8.5411, "lng": 39.2704, "accuracy_m": 8.5 },
  "soil_class": "koticha_vertisol",
  "drainage": "waterlogs"
}
```

### Set the planned crop (`PATCH /v1/plots/{id}`)

```json
{ "planned_crop_id": "6d0c9a52-3f8e-4f1b-8a57-0c2f6f3a9b10", "planned_season_year": 2027 }
```

Clear the plan:

```json
{ "planned_crop_id": null, "planned_season_year": null }
```

---

## 4.6 Catalog (REG-8, REG-9, DIAG-9)

Read endpoints are also delivered through sync for offline use.

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| `GET` | `/v1/catalog/crops` | Any | Crops with varieties, `weeding_windows`, `recommended_successors`, plausibility ceiling |
| `GET` | `/v1/catalog/varieties` | Any | Varieties (`crop_id`, `certified`, `zone` filters) |
| `GET` | `/v1/catalog/chemicals` | Any | Registered chemicals with `target_crop_ids` / `target_pest_ids` (`q`, `crop_id`, `pest_id` filters use array containment); voice-searchable |
| `GET` | `/v1/catalog/pests` | Any | Pests and diseases with prevention advice |
| `POST` / `PATCH` | `/v1/office/catalog/crops` · `/{id}` | O | Create / update crop (including `weeding_windows` and `recommended_successors`) |
| `POST` / `PATCH` | `/v1/office/catalog/varieties` · `/{id}` | O | Create / update variety |
| `POST` / `PATCH` | `/v1/office/catalog/chemicals` · `/{id}` | O | Create / update a chemical (dosage and PPE per language, `target_crop_ids`, `target_pest_ids`) |
| `POST` | `/v1/office/catalog/chemicals/{id}/retire` | O | Retire; removed from the diagnosis safety filter immediately |
| `POST` / `PATCH` | `/v1/office/catalog/pests` · `/{id}` | O | Create / update pest |
| `GET` | `/v1/office/catalog/fertilizer-rates` | O | Rates by crop and zone with versions |
| `PUT` | `/v1/office/catalog/fertilizer-rates` | O | Create a new effective-dated rate version |

---

## 4.7 Crop Cycles & Input Logging (CROP-2 to CROP-14)

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| `GET` | `/v1/plots/{id}/cycles` | F (own), D, O | List cycles for a plot |
| `POST` | `/v1/plots/{id}/cycles` | F (own), D | Start a cycle; `409 one_active_cycle` if one is active; requires soil + drainage |
| `GET` | `/v1/cycles/{id}` | F (own), D, O | Cycle with stage, sowing, fertilizer slots, operations, harvest |
| `POST` | `/v1/cycles/{id}/stage` | F (own), D, O | Advance stage (updates `crop_cycles.stage`, `stage_changed_at`, `stage_changed_by_user_id`); backward correction needs `reason` and role D/O and writes `audit_logs` (`action = 'log.correct'`) |
| `POST` | `/v1/cycles/{id}/abandon` | F (own), D | Mark abandoned |
| `PUT` | `/v1/cycles/{id}/sowing` | F (own), D | Create or replace the sowing log |
| `GET` | `/v1/cycles/{id}/fertilizer-logs` | F (own), D, O | The three slots (`basal`, `urea_1`, `urea_2`) |
| `PUT` | `/v1/cycles/{id}/fertilizer-logs/{application_type}` | F (own), D | Create or replace one slot (applied, or explicit skip with reason) |
| `DELETE` | `/v1/cycles/{id}/fertilizer-logs/{application_type}` | F (own), D | Soft-delete a slot log |
| `POST` | `/v1/cycles/fertilizer-logs/bulk` | D | Log one application for up to 20 farmers in a single request (AGENT-4); per-row results |
| `GET` | `/v1/cycles/{id}/operations` | F (own), D, O | Plowing / weeding / spraying / irrigation events |
| `POST` | `/v1/cycles/{id}/operations` | F (own), D | Add an operation |
| `PATCH` | `/v1/operations/{id}` | F (own), D | Update (before/after written to `audit_logs`) |
| `DELETE` | `/v1/operations/{id}` | F (own), D | Soft-delete |
| `PUT` | `/v1/cycles/{id}/harvest` | F (own), D | Record harvest; closes the cycle and queues yield-gap analysis |
| `GET` | `/v1/cycles/{id}/ledger` | F (own), D | Ledger entries |
| `GET` | `/v1/cycles/{id}/ledger/summary` | F (own), D | Total cost, total revenue, net |
| `POST` | `/v1/cycles/{id}/ledger` | F (own), D | Add entry |
| `PATCH` | `/v1/ledger/{id}` | F (own), D | Update entry |
| `DELETE` | `/v1/ledger/{id}` | F (own), D | Soft-delete |
| `GET` | `/v1/da/completeness` | D | Per-farmer completeness (sowing, basal, Urea 1, Urea 2, weeding, harvest) |

Corrections: a log's author may edit within 14 days; later edits require D or O. Every correction to a log (stage, sowing, fertilizer slot, operation, harvest, ledger) writes an `audit_logs` row (`action = 'log.correct'`, `entity_type`, `entity_id`, before/after in `changes_json`, reason). The correction trail for a cycle is read with `GET /v1/office/audit-logs?action=log.correct&entity_id=…` (officers) and is shown to DAs through the audit desk.

### Fertilizer slot payload

```json
{
  "fertilizer_product": "urea",
  "applied": true,
  "quantity_kg": 25,
  "application_date": "2026-08-12",
  "growth_stage_at_application": "vegetative"
}
```

Explicit skip:

```json
{
  "fertilizer_product": "urea",
  "applied": false,
  "skip_reason": "unaffordable"
}
```

---

## 4.8 Yield Gap Diagnostics (YIELD-1 to YIELD-12)

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| `GET` | `/v1/cycles/{id}/yield-gap` | F (own), D, O | Latest analysis: status, yields, factor results, top causes, recommendations, narration text |
| `GET` | `/v1/cycles/{id}/yield-gap/audio` | F (own), D, O | Narration audio for `?lang=` (signed URL; generated on demand and cached) |
| `POST` | `/v1/office/cycles/{id}/yield-gap/regenerate` | O, A | Recompute (e.g. after a data correction); rate-limited |
| `POST` | `/v1/cycles/{id}/yield-gap/reminders` | F (own), D | Save recommendations as reminders on the next cycle |

For farmer and DA roles, peer figures are returned as medians/quartiles only and never include peer identities.

Rain onset (YIELD-4) is computed on demand: the engine queries the historical weather API for the plot's grid cell, applies `rain_onset.accumulation_mm` and `rain_onset.window_days` from `city_offices.parameters`, and stores only the resulting `rain_onset_date` on the analysis row. No daily rainfall series is kept in PostgreSQL.

### Response (abridged)

```json
{
  "data": {
    "cycle_id": "…",
    "status": "completed",
    "cohort": { "size": 14, "widened": false },
    "plot_yield_qt_ha": 12.0,
    "cohort_median_qt_ha": 26.5,
    "cohort_p75_qt_ha": 31.0,
    "gap_pct_vs_p75": 61.3,
    "top_causes": ["urea2_timing", "weeding_delay", "seed_source"],
    "factor_results": [
      { "factor": "urea2_timing", "farmer_value": 49, "peer_value": 28, "delta": 21,
        "unit": "days_after_sowing", "contribution_score": 0.34 }
    ],
    "recommendations": [
      { "factor": "urea2_timing", "target_value": 28, "unit": "days_after_sowing",
        "message_key": "rec.urea2.timing" }
    ],
    "narration": { "lang": "am", "text": "…", "audio_url": "…" }
  }
}
```

---

## 4.9 Weather Intelligence (WEATH-1 to WEATH-9)

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| `GET` | `/v1/plots/{id}/weather` | F (own), D | Current conditions, 7-day forecast, soil moisture index, "Farm or Not" indicators, `fetched_at`, `is_stale` |
| `GET` | `/v1/plots/{id}/weather/summary-audio` | F (own), D | Weekly advisory audio (≤ 60 s) for `?lang=` |
| `GET` | `/v1/plots/{id}/weather/alerts` | F (own), D | Active alerts (frost, downpour, dry spell) |
| `GET` | `/v1/office/weather/alerts` | O | Active alerts affecting the office's plots, with plot counts |

Indicators are computed on the server from `city_offices.parameters` thresholds and returned with a `reason_key` for the one-sentence spoken explanation:

```json
{
  "farm_or_not": {
    "plowing":  { "state": "wait", "reason_key": "weather.plow.too_wet" },
    "spraying": { "state": "go",   "window": "2026-10-06T06:00/2026-10-06T10:00" },
    "harvest":  { "state": "no",   "reason_key": "weather.harvest.rain_next_day" }
  }
}
```

---

## 4.10 Multimodal Diagnostics (DIAG-1 to DIAG-12)

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| `POST` | `/v1/diagnoses` | F, D | Create a request: `plot_id`, `photo_media_ids[1..4]` (stored directly on `diagnosis_cases.photo_media_ids`; each id must be an image media row of the same office, uploads may still be in progress), optional notes. Idempotent by client `id`; returns `202` with `job_status = queued`. |
| `GET` | `/v1/diagnoses/{id}` | F (own), D, O | Status, `photo_media_ids` and, when complete, the filtered result |
| `GET` | `/v1/plots/{id}/diagnoses` | F (own), D, O | Diagnosis history |
| `GET` | `/v1/diagnoses/{id}/audio` | F (own), D | Spoken result for `?lang=` |
| `PATCH` | `/v1/diagnoses/{id}/review` | D | DA confirms or amends a low-confidence result |
| `GET` | `/v1/rotation-advice` | F, D | `?plot_id=` — next three seasons from plot crop history, soil, climate and `crops.recommended_successors` |

Create request payload:

```json
{
  "id": "3e8f2c1a-7b44-4d0e-a1c9-52f0d6b8e7a4",
  "plot_id": "1b7e6d3c-0e0a-4b0c-9b64-2f8a1f6a3c11",
  "photo_media_ids": [
    "a14c5e90-2d1b-4c7a-9e33-0b7f8d21c654",
    "c9b0e7d3-61fa-4a28-8d15-3e4a9f0b72d1"
  ],
  "notes": "Leaves curl and show brown spots after the rain"
}
```

Processing pipeline (worker): load plot context → build the prompt from the versioned template shipped with the API (no personal data, rounded coordinates, EXIF-stripped photos) → call Gemini → validate JSON schema (retry once) → run the **registered-chemical safety filter** (drop anything not in `registered_chemicals`; log to `removed_chemicals`) → copy dosage text from the directory → if `confidence < diagnosis.low_confidence`, set `review_status = pending_da_review` and create a `da_tasks` row → emit usage metrics (feature, model, status, latency, tokens) to application logs and the Redis counters used for the daily quota → send a generic FCM push to the requester; the completed result reaches the app through delta-sync.

---

## 4.11 Media Uploads (SYNC-7)

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| `POST` | `/v1/media/uploads` | Any | Initialise: `kind`, `mime_type`, `size_bytes`, `sha256`; returns `media_id`, `chunk_size` (262144) |
| `GET` | `/v1/media/uploads/{id}` | Any | Resume info: `bytes_received`, `status` |
| `PUT` | `/v1/media/uploads/{id}` | Any | Upload a chunk (`Content-Range: bytes start-end/total`) |
| `POST` | `/v1/media/uploads/{id}/complete` | Any | Server recomputes SHA-256; `verified` on match, `failed` otherwise |
| `GET` | `/v1/media/{id}` | Role-checked | 302 to a pre-signed URL (≤ 15 minutes) |

Limits: audio ≤ 5 MB, image ≤ 2 MB; MIME and size validated on init and on complete.

---

## 4.12 Grievances — Farmer & DA Side (GRIEV-1 to GRIEV-8)

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| `POST` | `/v1/grievances` | F, D | Submit (client-generated `id`, `category`, `audio_media_id` and/or `text_note`, `plot_id`, `photo_media_ids[≤3]` stored on `grievances.photo_media_ids`); duplicates return the existing ticket |
| `GET` | `/v1/grievances` | F (own), D (assigned farmers) | List with status |
| `GET` | `/v1/grievances/{id}` | F (own), D, O | Ticket with `photo_media_ids`, `status_history` and the latest messages |
| `POST` | `/v1/grievances/{id}/reopen` | F (own) | Reopen within 7 days of `resolved_at` |
| `POST` | `/v1/grievances/{id}/confirm` | F (own) | Confirm resolution |
| `GET` | `/v1/grievances/{id}/messages` | F (own), D, O | Message thread, oldest first (`limit`, `cursor`) |
| `POST` | `/v1/grievances/{id}/messages` | F (own), D, O | Add a message: `{id, message_type: "text" \| "audio", text_body \| audio_media_id}`. `sender_user_id` is always the caller; text sent by the desk gets a TTS rendering for the farmer. Idempotent by client `id`; farmers may post only while the ticket is open or within 7 days of `resolved_at` |
| `PATCH` | `/v1/grievances/{id}/messages/{messageId}/read` | F (own), D, O | Mark a message from the other party read |
| `GET` | `/v1/da/grievances` | D | Grievances assigned to the DA |
| `PATCH` | `/v1/grievances/{id}/status` | D | Move an assigned ticket to `in_progress` or `resolved` with a note |

Status machine: `submitted → received → assigned → in_progress → resolved | rejected`; `resolved → reopened → received`. Every transition appends an entry to `grievances.status_history` (trigger-maintained, append-only).

### Submit grievance payload

```json
{
  "id": "5a7d1e22-93bc-4f6a-b0d8-1c4e7a92f3b6",
  "category": "pest_outbreak",
  "plot_id": "1b7e6d3c-0e0a-4b0c-9b64-2f8a1f6a3c11",
  "pest_id": "d02e6b14-5c37-4a98-8f21-7e19b3a0c455",
  "audio_media_id": "8c3f9a10-4e72-4b5d-a6c1-92d07e1b3f48",
  "text_note": null,
  "photo_media_ids": [
    "a14c5e90-2d1b-4c7a-9e33-0b7f8d21c654"
  ]
}
```

### Message payload (`POST /v1/grievances/{id}/messages`)

```json
{ "id": "f6b21c8d-0a39-4e57-9d4b-3c5a8e71d902", "message_type": "text", "text_body": "The extension agent visited on Tuesday and sprayed as advised. The spots are still spreading." }
```

### Status history entry (`grievances.status_history`)

```json
[
  { "from": null, "to": "submitted", "actor_user_id": "…", "note": null, "at": "2026-10-04T08:12:30Z" },
  { "from": "submitted", "to": "received", "actor_user_id": "…", "note": null, "at": "2026-10-04T09:02:11Z" }
]
```

---

## 4.13 Market Price Intelligence — Farmer Side (MKT-1 to MKT-7)

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| `GET` | `/v1/market/centres` | Any | Market centres (home flagged) |
| `GET` | `/v1/market/board` | F, D | Latest verified min/max/avg per crop and centre with `survey_date` and `is_stale` |
| `GET` | `/v1/market/compare` | F, D | `?crop_id=` — same crop across centres, difference vs. home centre |
| `GET` | `/v1/market/history` | F, D | `?crop_id=&centre_id=&weeks=12` |
| `GET` | `/v1/market/farmer-reported` | F, D | Verified crowdsourced median (only when ≥ 5 entries in 14 days) |
| `POST` | `/v1/market/sales` | F, D | Log a completed sale (idempotent by client `id`); enters `pending` moderation |
| `GET` | `/v1/market/sales/mine` | F, D | Own submissions with moderation status |

The expected-revenue calculator runs locally from the cached board; there is no server endpoint.

---

## 4.14 Offline Sync (SYNC-1 to SYNC-10)

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| `POST` | `/v1/devices` | F, D | Register or refresh a device (`device_identifier`, `app_version`, `push_token`) |
| `PATCH` | `/v1/devices/{id}` | F, D | Update push token or app version |
| `GET` | `/v1/sync/bootstrap` | F, D | Initial full dataset for the user's scope (paged); returns a starting cursor |
| `POST` | `/v1/sync/push` | F, D | Send queued mutations (≤ 50 records or ≤ 500 KB gzip) |
| `GET` | `/v1/sync/pull` | F, D | `?cursor=&limit=` — changes since the cursor, scoped to the caller |
| `GET` | `/v1/sync/status` | F, D | Server cursor and pending counts (DAs: per farmer) |

### `POST /v1/sync/push`

```json
{
  "device_id": "4c2a…",
  "mutations": [
    {
      "id": "0f6b…",
      "client_seq": 412,
      "entity": "fertilizer_logs",
      "entity_id": "9d31…",
      "op": "insert",
      "payload": { "cycle_id": "…", "application_type": "urea_1", "fertilizer_product": "urea",
                   "applied": true, "quantity_kg": 25, "application_date": "2026-08-12",
                   "growth_stage_at_application": "vegetative" },
      "payload_hash": "e3b0c442…",
      "client_created_at": "2026-08-12T06:41:09Z"
    }
  ]
}
```

Response (per mutation, in order):

```json
{
  "data": {
    "results": [
      { "id": "0f6b…", "status": "applied" },
      { "id": "7a19…", "status": "duplicate" },
      { "id": "c8d2…", "status": "rejected", "reject_reason": "urea_2_not_after_urea_1" }
    ],
    "server_cursor": 88231
  }
}
```

Rules:

- The server recomputes `payload_hash`; mismatches are rejected.
- A mutation `id` seen before returns `duplicate` without re-applying (idempotent replay).
- Mutations are applied in `client_seq` order inside one transaction per mutation; a `rejected` mutation never blocks later ones.
- Conflict rules (SYNC-6): last-writer-wins per field (server-received time) for mutable profile fields; append-only for logs; server-authoritative for `is_verified` and catalog data. Overwritten values are kept in `audit_logs`.
- `/sync/pull` returns `sync_changes` rows with `seq > cursor` filtered by role: farmers receive rows where `farmer_id` is their own or null; DAs receive rows for assigned farmers or null; `da_tasks` go only to the assignee; `grievance_messages` rows carry no `farmer_id` and are scoped through their parent grievance; `city_offices` rows go to every user of the office and are projected to `name`, `default_language` and `parameters`.

---

## 4.15 Voice & Localisation (VOICE-1 to VOICE-12)

On-device speech recognition and intent classification are the primary path; these endpoints are online enhancements and asset delivery.

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| `GET` | `/v1/voice/intents` | F, D | Versioned intent catalog and per-language utterance examples (used to update the on-device classifier) |
| `POST` | `/v1/voice/intent` | F, D | Low-confidence fallback: `{transcript, lang, screen}` → `{intent, slots, confidence}` restricted to catalog intents (never free-form actions) |
| `POST` | `/v1/voice/transcribe` | F, D | Cloud speech-to-text for languages lacking an on-device engine (multipart audio) |
| `POST` | `/v1/voice/tts` | F, D | Render text or a `template_key` to speech; returns a `media_id` |

---

## 4.16 Land Registry, Demand Aggregation & Depots (REG-1 to REG-10) — Officer

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| `GET` | `/v1/office/registry/farmers` | O | Master directory; filters `kebele_id`, `da_id`, `crop_id`, `soil_class`; `unit=hectare\|timad\|kert` |
| `GET` | `/v1/office/registry/plots` | O | Plots with area, active crop, soil, zone |
| `POST` | `/v1/office/registry/exports` | O | Start a CSV/XLSX export of the current filter (async; audit-logged) |
| `GET` | `/v1/office/registry/exports/{id}` | O | Export status and download URL |
| `GET` | `/v1/office/demand/live` | O | Live aggregation from `v_city_input_demand_live` (`season_year`, `margin_pct`), by crop, kebele and city total |
| `POST` | `/v1/office/demand/snapshots` | O | Freeze a result with the rates versions used; optional `overrides[]` (`kebele_id`, `crop_id`, `hectares_override`, `reason`) are applied to the calculation and stored in `result.overrides` |
| `GET` | `/v1/office/demand/snapshots` | O | List snapshots |
| `GET` | `/v1/office/demand/snapshots/{id}` | O | One snapshot |
| `GET` | `/v1/office/demand/gap` | O | Demand − `on_hand_kg` − `incoming_kg` (from `v_office_stock`; incoming = movements with `status in ('expected', 'confirmed')`), with `critical` flag above `demand.critical_gap_pct` |
| `GET` | `/v1/office/depots` | O | Depots |
| `POST` | `/v1/office/depots` | O | Create depot |
| `PATCH` | `/v1/office/depots/{id}` | O | Update or deactivate |
| `GET` | `/v1/office/depots/{id}/stock` | O | Balances by item |
| `POST` | `/v1/office/depots/{id}/movements` | O | Record movements in bulk. Default `status = 'received'` (receipts, issues, adjustments applied immediately; `409 insufficient_stock` if a balance would go negative). A receipt may instead be registered as an incoming shipment with `status = 'expected'` or `'confirmed'` and an optional `expected_on` |
| `GET` | `/v1/office/depots/{id}/movements` | O | Movement ledger; filter `status` (for example `expected,confirmed` lists incoming shipments) |
| `PATCH` | `/v1/office/depots/{id}/movements/{movementId}` | O | Advance an incoming shipment: `status` to `confirmed`, `received` (applies it to the balance, optionally with the actual `quantity_delta`) or `cancelled`; pending rows may also change `quantity_delta`, `expected_on` and `reference_note`. Rows already `received` or `cancelled` return `409 movement_immutable` |

No voucher routes exist in V1 (REG-10).

---

## 4.17 Productivity Analytics & Yield Gap Desk (ANLY-1 to ANLY-9) — Officer

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| `GET` | `/v1/office/analytics/yield` | O | Mean, median, quartiles (with `n`) by crop, variety, soil; filters `season_year`, `kebele_id`, `zone` |
| `GET` | `/v1/office/analytics/yield/extremes` | O | Top and bottom 10% plots per crop, variety, soil |
| `GET` | `/v1/office/analytics/audit/plots/{plotId}` | O | Audit desk: log timeline, cohort comparison, stored AI result |
| `GET` | `/v1/office/analytics/root-causes` | O | `?crop_id=&season_year=` — % of low-yield plots affected by each factor |
| `GET` | `/v1/office/analytics/compare` | O | Side-by-side comparison of two kebeles or plot groups |
| `GET` | `/v1/office/analytics/seasons` | O | Historical seasonal database queries by crop, soil, zone, kebele |
| `POST` | `/v1/office/analytics/reports` | O | Generate a comparative report (PDF or CSV, async) |
| `GET` | `/v1/office/analytics/reports/{id}` | O | Report status and download URL |
| `POST` | `/v1/office/plots/{id}/field-visit` | O | Create a `da_tasks` field-visit task for the plot's DA |
| `GET` | `/v1/da/tasks` | D | Tasks assigned to the DA |
| `PATCH` | `/v1/da/tasks/{id}` | D | Update status / complete |

The nightly job `yield-gap:run` processes newly closed cycles (retry ×3; failures raise an external alert to the system admin).

---

## 4.18 Announcements & Broadcasting (COMM-1 to COMM-9)

Farmer / DA side:

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| `GET` | `/v1/announcements` | F, D | Feed (emergency pinned); each item carries its `translations` object with a signed audio URL per language |
| `POST` | `/v1/announcements/{id}/read` | F, D | Mark read |
| `POST` | `/v1/announcements/{id}/ack` | F, D | Acknowledge an emergency announcement (stops the SMS fallback) |

Officer desk:

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| `POST` | `/v1/office/announcements` | O | Create a draft: type, targeting and a `translations` object keyed `am` / `om` / `ti` / `en`, each with `title`, `body` and optional `audio_media_id` (stored directly on `announcements.translations`). A web-application template may prefill it through the optional `template_code` + `template_variables` (e.g. Fall Armyworm, Desert Locust, Yellow Rust quarantine) |
| `GET` | `/v1/office/announcements` | O | List |
| `GET` | `/v1/office/announcements/{id}` | O | Detail including the full `translations` object |
| `PATCH` | `/v1/office/announcements/{id}` | O | Edit a draft (published edits create a corrected version) |
| `POST` | `/v1/office/announcements/{id}/preview` | O | Recipient count and a preview for each language present in `translations` |
| `POST` | `/v1/office/announcements/{id}/publish` | O | Publish; fans out app deliveries and SMS per rules |
| `POST` | `/v1/office/announcements/{id}/recall` | O | Withdraw; optional SMS correction notice |
| `GET` | `/v1/office/announcements/{id}/metrics` | O | Delivered, read, acknowledged, failed (refresh ≥ every 5 minutes) |
| `POST` | `/v1/office/announcements/{id}/sms/retry` | O | Retry failed SMS (all or selected recipients) |
| `POST` | `/v1/webhooks/sms/delivery` | Public (signature-verified) | Africa's Talking delivery report callback |

Create draft payload:

```json
{
  "announcement_type": "emergency",
  "target_all": false,
  "target_kebele_ids": ["9b1e4f30-62ad-4c8b-a7d5-18c3e0f94a26"],
  "requires_acknowledgement": true,
  "sms_fallback_after_minutes": 30,
  "template_code": "quarantine_fall_armyworm",
  "template_variables": { "area": "Kebele 03", "da_contact": "+251911000000" },
  "translations": {
    "am": { "title": "…", "body": "…", "audio_media_id": null },
    "om": { "title": "…", "body": "…", "audio_media_id": null },
    "ti": { "title": "…", "body": "…", "audio_media_id": null },
    "en": { "title": "Fall Armyworm alert", "body": "Inspect your maize fields today and report any sightings.", "audio_media_id": null }
  }
}
```

A published announcement needs at least one language in `translations`. SMS and app feed use the recipient's `preferred_language`, falling back to the office default language, then to any language present.

Rules: SMS is segmented at 160 characters (70 for Ge'ez script) with per-recipient cost recorded; emergency SMS fallback runs for unacknowledged recipients after `sms_fallback_after_minutes` (default 30), at most one SMS per farmer per announcement; non-emergency SMS is held outside 20:00–07:00 and skipped for farmers with `consent_agreed = false`.

---

## 4.19 Grievance Triage Desk & Outbreak Map (TRG-1 to TRG-8) — Officer

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| `GET` | `/v1/office/grievances` | O | Triage board (`status`, `category`, `kebele_id`, `assignee`, `overdue`) |
| `GET` | `/v1/office/grievances/{id}` | O | Full ticket with audio URL, plot location, `photo_media_ids`, `status_history` and the message thread. Desk replies use `POST /v1/grievances/{id}/messages` (role O) |
| `PATCH` | `/v1/office/grievances/{id}/assign` | O | Assign to a DA; creates a `da_tasks` row |
| `PATCH` | `/v1/office/grievances/{id}/status` | O | Change status (state machine enforced) |
| `POST` | `/v1/office/grievances/{id}/merge` | O | Merge duplicates into one thread |
| `POST` | `/v1/office/grievances/{id}/escalate` | O | Export a PDF case summary for a regulator (adulterated inputs) |
| `GET` | `/v1/office/outbreaks/heatmap` | O | Counts by kebele and week (`pest_id`, `crop_id`, `from`, `to`); no identities |
| `GET` | `/v1/office/outbreaks/clusters` | O | Active clusters |
| `POST` | `/v1/office/outbreaks/clusters/{id}/quarantine-broadcast` | O | Create a draft quarantine announcement prefilled with pest and area (sets `template_code`) |
| `GET` | `/v1/outbreaks/alerts` | F, D | Active cluster alerts near the caller's plots (kebele-level) |

---

## 4.20 Market Survey Desk (SURV-1 to SURV-7) — Officer

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| `GET` | `/v1/office/market/centres` | O | List centres |
| `POST` | `/v1/office/market/centres` | O | Create centre |
| `PATCH` | `/v1/office/market/centres/{id}` | O | Update or deactivate |
| `POST` | `/v1/office/market/surveys` | O | Enter prices for several crops at one centre in one request (rows validated individually) |
| `POST` | `/v1/office/market/surveys/import` | O | CSV import; all-or-nothing with row-level errors |
| `GET` | `/v1/office/market/surveys` | O | History by crop, centre, week |
| `PATCH` | `/v1/office/market/surveys/{id}` | O | Edit a **draft** |
| `POST` | `/v1/office/market/surveys/{id}/verify` | O | Verify and publish to farmers |
| `POST` | `/v1/office/market/surveys/{id}/correct` | O | Create a corrected version; old row becomes `superseded` |
| `GET` | `/v1/office/market/surveys/missing` | O | Crop/centre pairs with no survey in 10 days |
| `GET` | `/v1/office/market/crowd-sales` | O | Moderation queue (outliers pre-flagged) |
| `PATCH` | `/v1/office/market/crowd-sales/{id}/moderate` | O | `verify`, `reject` (reason required) or `flag` |

---

## 4.21 In-App Inbox & Badges (derived)

There is no notifications table. Push alerts (FCM) and SMS are sent by workers and carry only a generic message and a deep-link id. The in-app inbox and unread badges are computed on request from three existing sources:

| Source | What counts as unread | Read state |
|---|---|---|
| `announcement_deliveries` | Rows for the caller (`channel = 'app'`, `read_at is null`) on published, unexpired announcements; emergency items also require `acknowledged_at is null` | Server (`read_at`, `acknowledged_at`) |
| `grievance_messages` | Messages on the caller's tickets sent by the other party with `read_at is null` (farmer: own tickets; DA: assigned farmers' tickets; officer: office tickets) | Server (`read_at`) |
| `weather_alerts` | Active alerts (`starts_on <= today <= ends_on`) for the grid cells of the caller's plots (farmer, DA: assigned farmers) | Device: the client sends `since` (its last-seen timestamp); alerts have no per-user read flag |

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| `GET` | `/v1/inbox/summary` | Any | Badge counts: `announcements`, `grievance_messages`, `weather_alerts`, `total` |
| `GET` | `/v1/inbox` | Any | Merged, newest-first feed of the unread items above (`limit`, `cursor`, optional `since` for weather alerts); each item carries `type`, `entity_type`, `entity_id` for deep links |

Items are cleared with the existing routes `POST /v1/announcements/{id}/read`, `POST /v1/announcements/{id}/ack` and `PATCH /v1/grievances/{id}/messages/{messageId}/read`. Other events (diagnosis finished, yield-gap ready, task assigned, grievance status changed, outbreak alert) reach the app as push messages and as changed rows in the delta-sync feed (`diagnosis_cases`, `yield_gap_analyses`, `da_tasks`, `grievances`); the app derives its own in-app indicators from those rows.

---

## 4.22 Audit & System Administration (ADM-2, ADM-9, ADM-10)

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| `GET` | `/v1/office/audit-logs` | O | Own office audit trail (`action`, `actor`, `entity`, `from`, `to`) |
| `GET` | `/v1/admin/audit-logs` | A | Cross-office audit trail |
| `GET` | `/v1/admin/offices` | A | List offices |
| `POST` | `/v1/admin/offices` | A | Provision an office: seeds the default `city_offices.parameters` (SRS defaults), creates the first officer and sends an invite |
| `PATCH` | `/v1/admin/offices/{id}` | A | Update or deactivate |
| `GET` | `/v1/admin/health` | A | API error rate, sync queue lag, AI call/failure counts, SMS delivery rates (24 h / 7 d trends) |
| `GET` | `/v1/admin/ai-usage` | A | Today's call and failure counts per office and feature, read from the Redis rate-limiter counters and application metrics (not from PostgreSQL) |
| `PUT` | `/v1/admin/offices/{id}/ai-quota` | A | Set `ai.daily_call_quota` in `city_offices.parameters` (audit-logged); enforced by the Redis limiter, which returns `429 ai_quota_exceeded` |
| `GET` | `/v1/admin/jobs` | A | Worker queue state (queued, failed, retried) |

Every privileged write inserts into `audit_logs` (actor, office, action, entity, `changes_json`).

---

# 5. Traceability: SRS Modules → Tables → Routes

| SRS requirements | Primary tables | Route sections |
|---|---|---|
| VOICE-1 to VOICE-12 | `city_offices.parameters` (`voice.intent_confidence_threshold`, `ai.daily_call_quota`); fallback-call counters in Redis / application logs | 4.15, 4.22 |
| PLOT-1 to PLOT-10, ADM-1 to ADM-8 | `users` (incl. `assigned_kebele_ids`), `accounts`, `sessions`, `verifications`, `city_offices` (incl. `parameters`), `kebeles`, `farmers`, `plots` (incl. planned crop), `plot_crop_history` | 4.2 – 4.5 |
| CROP-1 to CROP-14 | `crop_cycles`, `sowing_logs`, `fertilizer_logs`, `field_operations`, `harvest_records`, `ledger_entries`; corrections in `audit_logs` (`log.correct`) | 4.7 |
| YIELD-1 to YIELD-12, ANLY-1 to ANLY-9 | `yield_gap_analyses` (incl. `rain_onset_date`), `v_cycle_fertilizer_splits`, `city_offices.parameters` (`rain_onset.*`, `yield.cohort_min_size`); rainfall from the historical weather API on demand | 4.8, 4.17 |
| WEATH-1 to WEATH-9 | `weather_forecasts`, `weather_alerts`, `city_offices.parameters` (`weather.*`) | 4.9 |
| DIAG-1 to DIAG-12 | `diagnosis_cases` (incl. `photo_media_ids`), `registered_chemicals`, `pest_catalog`, `crops`, `media_files`, `city_offices.parameters` (`diagnosis.low_confidence`) | 4.6, 4.10, 4.11 |
| GRIEV-1 to GRIEV-8, TRG-1 to TRG-8 | `grievances` (incl. `photo_media_ids`, `status_history`), `grievance_messages`, `da_tasks`, `outbreak_clusters` | 4.12, 4.19 |
| MKT-1 to MKT-7, SURV-1 to SURV-7 | `market_centres`, `market_surveys`, `crowd_transactions`, `v_latest_prices`, `v_farmer_reported_prices` | 4.13, 4.20 |
| AGENT-1 to AGENT-8 | `farmers.registered_by_user_id`, `users.assigned_kebele_ids`, `*.created_by_user_id`, `devices`, `da_tasks`, `outbreak_clusters` | 4.3, 4.4, 4.7, 4.14, 4.19 |
| SYNC-1 to SYNC-10 | `devices`, `sync_mutations`, `sync_changes`, `media_files` | 4.11, 4.14 |
| REG-1 to REG-10 | `plots` (planned crop), `crops`, `crop_varieties`, `fertilizer_rates`, `depots`, `depot_stock_items`, `depot_stock_movements` (incl. `status`, `expected_on` for incoming shipments), `demand_snapshots`, `v_city_input_demand_live`, `v_office_stock` | 4.6, 4.16 |
| COMM-1 to COMM-9 | `announcements` (incl. `translations`), `announcement_deliveries`; in-app unread state derived from `announcement_deliveries`, `grievance_messages` and `weather_alerts` | 4.18, 4.21 |
| SRS 4.2 (security, audit, privacy) | `audit_logs`, `farmers.consent_agreed`, row-level security | 2, 3.4, 4.22 |

---

# 6. Base Table Inventory

42 base tables, in creation order (the four authentication core tables are `users`, `accounts`, `sessions`, `verifications`):

`city_offices`, `kebeles`, `users`, `accounts`, `sessions`, `verifications`, `farmers`, `plots`, `crops`, `crop_varieties`, `fertilizer_rates`, `pest_catalog`, `registered_chemicals`, `plot_crop_history`, `media_files`, `crop_cycles`, `sowing_logs`, `fertilizer_logs`, `field_operations`, `harvest_records`, `ledger_entries`, `yield_gap_analyses`, `weather_forecasts`, `weather_alerts`, `diagnosis_cases`, `outbreak_clusters`, `grievances`, `grievance_messages`, `da_tasks`, `market_centres`, `market_surveys`, `crowd_transactions`, `depots`, `depot_stock_items`, `depot_stock_movements`, `demand_snapshots`, `announcements`, `announcement_deliveries`, `devices`, `sync_mutations`, `sync_changes`, `audit_logs`.

---

# 7. Change Log: v1.2 → v1.3

49 base tables became 42. The four authentication tables are unchanged apart from one added column on `users`.

| v1.2 object | v1.3 replacement |
|---|---|
| `office_parameters` (table, 3 routes, index) | `city_offices.parameters jsonb`; read via `GET /v1/offices/me` and `/v1/offices/me/config`, written via `PATCH /v1/offices/me`; history in `audit_logs` (`office.parameters_update`) |
| `da_kebele_assignments` (table, route, index) | `users.assigned_kebele_ids uuid[]`, validated by `trg_users_kebele_ids`; set via `POST`/`PATCH /v1/office/users` |
| `ai_usage_logs`, `v_ai_usage_today`, `idx_ai_usage_daily` | Application logs and Redis counters; quota value in `city_offices.parameters` |
| `log_revisions` (table, trigger, index, `/revisions` route) | `audit_logs` (`action = 'log.correct'`) |
| `weather_daily_precip` | Historical weather API queried on demand for rain onset; result kept in `yield_gap_analyses.rain_onset_date` |
| `incoming_deliveries` (table, index, 2 routes, `delivery_state` enum) | `depot_stock_movements.status` and `expected_on`; `v_office_stock.incoming_kg`; `PATCH …/movements/{movementId}` |
| `notifications` (table, index, 3 routes) | Derived inbox and badges (`GET /v1/inbox`, `/v1/inbox/summary`) plus external FCM/SMS and delta-sync |

Supporting changes: `apply_stock_movement()` now applies only `received` movements; `protect_stock_movement()` replaces the blanket immutability trigger on `depot_stock_movements`; `record_sync_change()` handles `city_offices` (office-scoped, so configuration reaches devices offline); `set_updated_at` is unchanged and now also covers `depot_stock_movements`; row-level security is generated for every table with a `city_office_id` and explicit policies cover the rest.
