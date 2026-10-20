# Backend API Dependency Register & Contract Specification

**Project:** Autonomous Agricultural Intelligence & Extension System (Ethiopia)  
**Target Client:** Farmer & Extension Agent (DA) Native Android Application (`apps/mobile`)  
**Status:** Reconciled to Database Schema & API Surface Specification v1.3 (42 Tables, Modular Monolith)  
**Date:** October 2026  

---

## 1. Request & Response Protocol Conventions

The mobile client interacts with the backend over HTTP/REST and streaming endpoints adhering strictly to the contract defined in Section 4.1 of the Database Schema & API Surface specification:

### 1.1 Mandatory Request Headers
Every HTTP request originating from the native Android app must supply the following headers:

| Header | Type | Requirement | Description / Rule |
| :--- | :--- | :--- | :--- |
| `Authorization` | `string` | Authenticated routes | `Bearer <session_token>` (30-day sliding token issued at login/verification). |
| `X-Client-Type` | `string` | **Mandatory** | Must be strictly `"android"`. Triggers mobile role admission and bearer token responses. |
| `X-Device-Id` | `string` (UUID) | **Mandatory** | Unique hardware/installation identifier mapped to `devices.device_identifier`. |
| `X-App-Version` | `string` | **Mandatory** | Semantic version of the installed client (e.g. `1.0.0`) for minimum-version enforcement. |
| `Accept-Language` | `string` | **Mandatory** | Active locale: `'am'` (Amharic), `'om'` (Afaan Oromoo), `'ti'` (Tigrinya), or `'en'` (English). |
| `Idempotency-Key`| `string` (UUID) | Mutations | Required on all `POST`, `PUT`, `PATCH`, `DELETE` operations. Enforces safe replay. |

### 1.2 Standard Response Envelopes

* **Success Envelope (Single Resource):**
  ```json
  {
    "data": { ... }
  }
  ```

* **Success Envelope (Paginated List):**
  ```json
  {
    "data": [ ... ],
    "meta": {
      "next_cursor": "opaque_cursor_string_or_null",
      "total": 42
    }
  }
  ```

* **Standard Error Envelope:**
  ```json
  {
    "error": {
      "code": "urea_2_not_after_urea_1",
      "message": "Urea application 2 cannot precede Urea application 1.",
      "details": { "field": "application_type" },
      "request_id": "req_8f1a2b3c"
    }
  }
  ```

### 1.3 Mobile Role Admission & Security Policy (MOB-3)
* **Admitted Roles:** `farmer` and `da` only.
* **Refusal Behavior:** If an `officer` or `system_admin` attempts to sign in via the Android app (`X-Client-Type: android`), the backend rejects the request with HTTP `403 Forbidden` (`code: "client_not_permitted"`). No session is created, no device row is recorded, and an audit event (`auth.client_denied`) is logged on the server. The mobile app displays a clear notice directing the user to the Web Portal.

---

## 2. Complete Mobile API Surface Register

The following register details all documented endpoints consumed by the native Android application across all 16 domains:

| Domain | HTTP Method | Endpoint Route | Roles | Request Payload / Params | Response Data & Mobile Handling |
| :--- | :---: | :--- | :---: | :--- | :--- |
| **Auth** | `POST` | `/api/auth/sign-in/phone` | Public | `{ phone_number, password }` | Returns Bearer token in response body (30-day sliding expiry). Store in Android Keystore. |
| **Auth** | `POST` | `/api/auth/sign-up/phone` | Public | `{ phone_number, password, name?, preferred_language? }` | Sends 6-digit SMS OTP (10-min expiry, max 5/hr). No session issued yet. |
| **Auth** | `POST` | `/api/auth/phone/verify-otp` | Public | `{ phone_number, code }` | Verifies registration OTP. Activates user, returns 30-day Bearer token. |
| **Auth** | `POST` | `/api/auth/phone/resend-otp` | Public | `{ phone_number }` | Re-dispatches OTP via SMS gateway (subject to 5 requests/hr rate limit). |
| **Auth** | `POST` | `/api/auth/invitations/accept` | Public | `{ phone_number, code, password }` | Provisioned DA accepts invite, verifies OTP, sets password, receives Bearer token. |
| **Auth** | `POST` | `/api/auth/forgot-password` | Public | `{ phone_number }` | Dispatches 6-digit recovery OTP (`phone-recovery:<phone>`). Returns neutral 200. |
| **Auth** | `POST` | `/api/auth/reset-password` | Public | `{ phone_number, code, new_password }` | Verifies recovery OTP, sets password, revokes all sessions on all devices. |
| **Auth** | `GET` | `/api/auth/session` | Any | None | Hydrates active session and user object (`id`, `role`, `city_office_id`). |
| **Auth** | `POST` | `/api/auth/sign-out` | Any | None | Revokes active session. Client deletes Keystore token; keeps encrypted DA sync queue. |
| **Auth** | `POST` | `/api/auth/change-password` | Any | `{ current_password, new_password, revoke_other_sessions }` | Changes password; revokes sessions on other devices if requested. |
| **User Profile** | `GET` | `/v1/users/me` | Any | None | Returns profile (`name`, `role`, `preferred_language`, `city_office_id`, `farmer_id`). |
| **User Profile** | `PATCH` | `/v1/users/me` | Any | `{ name?, preferred_language?, image_url? }` | Updates profile attributes. |
| **Farmer Profile** | `POST` | `/v1/farmers/me` | Farmer | `{ full_name, local_id_number, kebele_id, consent_agreed }` | Creates initial farmer profile. Active immediately; `is_verified = false`. |
| **Farmer Profile** | `GET` | `/v1/farmers/me` | Farmer | None | Fetches farmer record, `is_verified` status, and assigned DA metadata. |
| **Farmer Profile** | `PATCH` | `/v1/farmers/me` | Farmer | Profile fields update | Updates personal details. |
| **Farmer Profile** | `POST` | `/v1/farmers/claim` | Farmer | `{ local_id_number }` | Merges un-phonenumbered profile pre-registered by DA into phone-verified account. |
| **DA Operations** | `POST` | `/v1/farmers` | DA | `{ full_name, local_id_number, kebele_id, phone_number?, has_no_phone? }` | DA registers farmer in field. Automatically verified by database trigger. |
| **DA Operations** | `GET` | `/v1/farmers` | DA | Query: `q`, `kebele_id`, `is_verified`, `cursor`, `limit` | Paginated search of farmers assigned to the DA. |
| **DA Operations** | `GET` | `/v1/farmers/{id}` | DA | None | Detailed profile of an assigned farmer. |
| **DA Operations** | `PATCH` | `/v1/farmers/{id}/verify`| DA | `{ is_verified: true }` | Sets farmer as verified following in-person field check (audit-logged). |
| **DA Operations** | `GET` | `/v1/da/completeness` | DA | None | Completeness metrics across assigned farmers (sowing, basal, urea 1/2, weeding, harvest). |
| **DA Tasks** | `GET` | `/v1/da/tasks` | DA | Query: `status`, `task_type`, `priority` | Visits, low-confidence diagnosis reviews, and grievance follow-ups assigned to DA. |
| **DA Tasks** | `PATCH` | `/v1/da/tasks/{id}` | DA | `{ status: "completed" \| "in_progress", completion_notes? }` | Marks assigned field task complete. |
| **Plots & Geo** | `GET` | `/v1/farmers/{farmerId}/plots` | F, DA | None | Lists plots owned by the farmer (active and archived). |
| **Plots & Geo** | `POST` | `/v1/farmers/{farmerId}/plots` | F, DA | `{ name, area_value, area_unit, centroid: { lat, lng, accuracy_m }, soil_class, drainage, planned_crop_id?, planned_season_year? }` | Creates plot. Server auto-derives elevation, agro-zone, kebele, and unit conversion factor. |
| **Plots & Geo** | `GET` | `/v1/plots/{id}` | F, DA | None | Detailed plot view including derived agro-climatic zone and planned crop. |
| **Plots & Geo** | `PATCH` | `/v1/plots/{id}` | F, DA | `{ name?, area_value?, planned_crop_id?, planned_season_year? }` | Updates plot metadata or sets/clears planned crop for demand aggregation. |
| **Plots & Geo** | `POST` | `/v1/plots/{id}/archive` | F, DA | None | Soft-archives plot (retains historical cycles for analytics). |
| **Plots & Geo** | `POST` | `/v1/plots/{id}/restore` | F, DA | None | Restores archived plot. |
| **Plots & Geo** | `PUT` | `/v1/plots/{id}/agro-zone` | DA | `{ agro_climatic_zone, reason }` | DA overrides server-derived agro-zone with justification. |
| **Plots & Geo** | `GET` | `/v1/plots/{id}/crop-history` | F, DA | None | Returns 1–3 season crop rotation history. |
| **Plots & Geo** | `PUT` | `/v1/plots/{id}/crop-history/{season_year}` | F, DA | `{ crop_id \| "fallow" }` | Records past season crop or fallow state. |
| **Plots & Geo** | `GET` | `/v1/geo/resolve` | F, DA | Query: `lat`, `lng` | Derives elevation, agro-zone, kebele, and validates municipal jurisdiction. |
| **Catalog** | `GET` | `/v1/catalog/crops` | Any | None | Master crops catalog with weeding windows and successor recommendations. |
| **Catalog** | `GET` | `/v1/catalog/varieties` | Any | Query: `crop_id`, `certified`, `zone` | Seed varieties with maturity days and zone suitability. |
| **Catalog** | `GET` | `/v1/catalog/chemicals` | Any | Query: `q`, `crop_id`, `pest_id` | Registered chemical catalog with approved dosages and multilingual PPE instructions. |
| **Catalog** | `GET` | `/v1/catalog/pests` | Any | Query: `q`, `crop_id` | Pest & disease registry with symptoms and integrated pest management advice. |
| **Crop Cycles** | `GET` | `/v1/plots/{id}/cycles` | F, DA | None | Lists historical and active crop cycles for a plot. |
| **Crop Cycles** | `POST` | `/v1/plots/{id}/cycles` | F, DA | `{ crop_id, variety_id, season_year, season_name }` | Starts a new cycle. Enforces maximum 1 active cycle per plot (`409 one_active_cycle`). |
| **Crop Cycles** | `GET` | `/v1/cycles/{id}` | F, DA | None | Full cycle lifecycle state (stage, sowing, fertilizer slots, operations, harvest). |
| **Crop Cycles** | `POST` | `/v1/cycles/{id}/stage` | F, DA | `{ stage, reason? }` | Advances cycle stage. Backward corrections require DA role and reason. |
| **Crop Cycles** | `POST` | `/v1/cycles/{id}/abandon` | F, DA | `{ reason }` | Marks cycle abandoned with cause (drought, pest, flood). |
| **Field Logging** | `PUT` | `/v1/cycles/{id}/sowing` | F, DA | `{ sowing_date, seed_variety_id, seed_rate_kg_per_ha, seed_source, planting_method }` | Creates or updates sowing log. |
| **Field Logging** | `GET` | `/v1/cycles/{id}/fertilizer-logs` | F, DA | None | Returns status of the 3 discrete slots (`basal`, `urea_1`, `urea_2`). |
| **Field Logging** | `PUT` | `/v1/cycles/{id}/fertilizer-logs/{application_type}` | F, DA | `{ fertilizer_product, applied: true, quantity_kg, application_date, growth_stage }` OR `{ applied: false, skip_reason }` | Logs application or explicit skip. Enforces `urea_2_not_after_urea_1`. |
| **Field Logging** | `POST` | `/v1/cycles/fertilizer-logs/bulk` | DA | `{ applications: [{ cycle_id, application_type, ... }] }` | Bulk logs fertilizer for up to 20 farmers simultaneously (AGENT-4). |
| **Field Logging** | `GET` | `/v1/cycles/{id}/operations` | F, DA | None | Lists operational events (plowing, weeding, spraying, irrigation). |
| **Field Logging** | `POST` | `/v1/cycles/{id}/operations` | F, DA | `{ operation_type, operation_date, duration_hours, labor_count, notes? }` | Adds field operation. |
| **Field Logging** | `PUT` | `/v1/cycles/{id}/harvest` | F, DA | `{ harvest_date, total_yield_kg, storage_method, post_harvest_loss_kg? }` | Concludes cycle and automatically enqueues asynchronous yield gap analysis. |
| **Cash Ledger** | `GET` | `/v1/cycles/{id}/ledger` | F, DA | None | Lists financial ledger debit/credit entries for the cycle. |
| **Cash Ledger** | `GET` | `/v1/cycles/{id}/ledger/summary` | F, DA | None | Returns aggregated total cost, total revenue, and net profit. |
| **Cash Ledger** | `POST` | `/v1/cycles/{id}/ledger` | F, DA | `{ entry_type: "expense" \| "income", category, amount_etb, description? }` | Adds ledger transaction. |
| **Yield Gap** | `GET` | `/v1/cycles/{id}/yield-gap` | F, DA | None | Peer comparison (median, top quartile), top 3 causes, recommendations, narration. |
| **Yield Gap** | `GET` | `/v1/cycles/{id}/yield-gap/audio` | F, DA | Query: `lang` (`am`, `om`, `ti`, `en`) | Streams synthesized Gemini TTS audio of advisory narration (never persisted). |
| **Yield Gap** | `POST` | `/v1/cycles/{id}/yield-gap/reminders` | F, DA | `{ recommendation_keys[] }` | Converts diagnostic recommendations into reminders for the subsequent cycle. |
| **Weather** | `GET` | `/v1/plots/{id}/weather` | F, DA | None | Conditions, 7-day forecast, soil moisture, and Farm-or-Not activity indicators. |
| **Weather** | `GET` | `/v1/plots/{id}/weather/summary-audio` | F, DA | Query: `lang` | Streams 60-second weekly audio advisory synthesized via Gemini TTS. |
| **Weather** | `GET` | `/v1/plots/{id}/weather/alerts` | F, DA | None | Returns active severe weather warnings (frost, downpour, dry spell). |
| **Diagnostics** | `POST` | `/v1/diagnoses` | F, DA | `{ id, plot_id, photo_media_ids[1..4], notes? }` | Submits leaf images. Returns HTTP 202 Accepted (`job_status = "queued"`). |
| **Diagnostics** | `GET` | `/v1/diagnoses/{id}` | F, DA | None | Fetches status and completed diagnosis with registered-chemical safety filter results. |
| **Diagnostics** | `GET` | `/v1/plots/{id}/diagnoses` | F, DA | None | Diagnosis case history for a given plot. |
| **Diagnostics** | `GET` | `/v1/diagnoses/{id}/audio`| F, DA | Query: `lang` | Streams synthesized audio explanation of diagnosis and safe treatment. |
| **Diagnostics** | `PATCH` | `/v1/diagnoses/{id}/review` | DA | `{ confirmed_pest_id, da_notes, override_recommendations? }` | DA validates or corrects a low-confidence diagnosis. |
| **Diagnostics** | `GET` | `/v1/rotation-advice` | F, DA | Query: `plot_id` | Recommends optimal 3-year crop rotation sequence based on soil and plot history. |
| **Media Uploads** | `POST` | `/v1/media/uploads` | Any | `{ kind, mime_type, size_bytes, sha256_checksum }` | Initialises chunked upload. Returns `media_id` and `chunk_size = 262144` (256 KB). |
| **Media Uploads** | `GET` | `/v1/media/uploads/{id}` | Any | None | Resume status query. Returns `bytes_received` and `status`. |
| **Media Uploads** | `PUT` | `/v1/media/uploads/{id}` | Any | Header: `Content-Range: bytes start-end/total`, Body: binary chunk | Uploads a 256 KB binary chunk. |
| **Media Uploads** | `POST` | `/v1/media/uploads/{id}/complete` | Any | None | Verifies total SHA-256 hash. Sets media status to `verified`. |
| **Media Uploads** | `GET` | `/v1/media/{id}` | Any | None | HTTP 302 Redirect to a temporary presigned download URL (<= 15 minutes). |
| **Grievances** | `POST` | `/v1/grievances` | F, DA | `{ id, category, plot_id?, pest_id?, audio_media_id?, text_note?, photo_media_ids? }` | Submits grievance ticket. Audio up to 3 minutes, up to 3 photos. |
| **Grievances** | `GET` | `/v1/grievances` | F, DA | Query: `status`, `cursor`, `limit` | Lists grievance tickets with status tracker. |
| **Grievances** | `GET` | `/v1/grievances/{id}` | F, DA | None | Fetches ticket details, append-only `status_history`, and latest message thread. |
| **Grievances** | `GET` | `/v1/grievances/{id}/messages` | F, DA | Query: `cursor`, `limit` | Fetches chronologically ordered message thread for a grievance. |
| **Grievances** | `POST` | `/v1/grievances/{id}/messages` | F, DA | `{ id, message_type: "text" \| "audio", text_body?, audio_media_id? }` | Adds text or audio message to thread. Idempotent by client `id`. |
| **Grievances** | `POST` | `/v1/grievances/{id}/confirm` | Farmer | None | Farmer confirms resolution of the grievance. |
| **Grievances** | `POST` | `/v1/grievances/{id}/reopen` | Farmer | `{ reason }` | Reopens ticket within 7 days of resolution. |
| **Grievances** | `PATCH` | `/v1/grievances/{id}/status` | DA | `{ status: "in_progress" \| "resolved", note }` | DA updates status of assigned grievance. |
| **Market Prices** | `GET` | `/v1/market/centres` | Any | None | Lists verified market centres (flags farmer's home centre). |
| **Market Prices** | `GET` | `/v1/market/board` | F, DA | None | Latest surveyed min/max/avg prices per crop with `survey_date` and `is_stale`. |
| **Market Prices** | `GET` | `/v1/market/compare` | F, DA | Query: `crop_id` | Price differentials across neighbouring market centres. |
| **Market Prices** | `GET` | `/v1/market/history` | F, DA | Query: `crop_id`, `centre_id`, `weeks=12` | 12-week historical price trends. |
| **Market Prices** | `POST` | `/v1/market/sales` | F, DA | `{ id, crop_id, quantity_kg, unit_price_etb, sale_date, market_centre_id }` | Crowdsources completed sale (enters moderation; local revenue calculator uses board). |
| **Announcements** | `GET` | `/v1/announcements` | F, DA | None | Cached broadcasts feed with emergency items pinned and audio URLs. |
| **Announcements** | `POST` | `/v1/announcements/{id}/acknowledge` | F, DA | None | Acknowledges receipt of emergency broadcast directive. |
| **Unified Inbox** | `GET` | `/v1/inbox` | F, DA | Query: `cursor`, `limit` | Aggregated feed of weather alerts, grievance replies, diagnoses, and broadcasts. |
| **Unified Inbox** | `GET` | `/v1/inbox/summary` | F, DA | None | Returns total unread notification counts for badge rendering. |
| **Unified Inbox** | `PATCH` | `/v1/inbox/{id}/read` | F, DA | None | Marks notification item as read. |
| **Offline Sync** | `POST` | `/v1/devices` | F, DA | `{ device_identifier, platform: "android", app_version, fcm_token? }` | Registers device and registers/updates FCM push token. |
| **Offline Sync** | `GET` | `/v1/app/version` | Public | None | Returns `min_supported_app_version` and `latest_app_version` for Android. |
| **Offline Sync** | `GET` | `/v1/sync/bootstrap` | F, DA | Query: `cursor?` | Paged initial full dataset load for offline SQLite seeding. |
| **Offline Sync** | `POST` | `/v1/sync/push` | F, DA | `{ device_id, mutations: [ { id, client_sequence_number, entity_type, entity_id, operation, payload, payload_hash, client_created_at } ] }` | Pushes client mutation queue (<= 50 records or <= 500 KB gzip). Returns per-mutation results (`applied`, `duplicate`, `rejected`). |
| **Offline Sync** | `GET` | `/v1/sync/pull` | F, DA | Query: `cursor`, `limit` | Retrieves server changes since `cursor` scoped to caller's permissions. |
| **Offline Sync** | `GET` | `/v1/sync/status` | F, DA | None | Returns server cursor position and pending queue counts. |
| **Voice & Speech** | `GET` | `/v1/voice/intents` | F, DA | None | Fetches versioned intent grammar and sample utterances to train on-device parser. |
| **Voice & Speech** | `POST` | `/v1/voice/intent` | F, DA | `{ transcript, lang, screen }` | Cloud intent resolution fallback when local classifier confidence < threshold. |
| **Voice & Speech** | `POST` | `/v1/voice/transcribe`| F, DA | Form-data: audio binary chunk, `lang` | Ephemeral Gemini STT transcription; audio chunk is discarded immediately. |
| **Voice & Speech** | `POST` | `/v1/voice/tts` | F, DA | `{ text?, template_key?, source?: { type, id }, lang }` | Synthesizes Gemini TTS on demand and streams WAV audio in response (not stored). |

---

## 3. Explicitly Identified API Gaps & Ambiguities

Per project instructions, rather than inventing unconfirmed conventions, the following items are explicitly recorded as pending backend specification:

1. **`GET /v1/sync/bootstrap` Response Schema:**
   * *Status:* The documentation specifies that bootstrap returns the initial dataset and a starting cursor.
   * *Missing Detail:* Does the response structure return a single JSON object containing typed entity arrays (e.g., `{ plots: [], cycles: [], crops: [], server_cursor: 120 }`), or does it return a flat array of synthetic `sync_changes` records matching the `/v1/sync/pull` format?
   * *Mobile Handling:* The repository adapter abstracts this behind `SyncRepository.bootstrap()`, mapping entities into local WatermelonDB tables regardless of the envelope structure.

2. **Socket.io Real-Time Event Names & Connection Path:**
   * *Status:* Architecture documentation specifies Socket.io for live grievance chats and inbox badge counters.
   * *Missing Detail:* Exact WebSocket path (e.g. `/socket.io/` or `/v1/events`), authentication handshake convention (query param `?token=` vs. `auth: { token }` payload), and event channel names (e.g. `grievance:message:new`, `inbox:badge_count`).
   * *Mobile Handling:* Socket client is isolated in `src/services/realtime/socket-client.ts`. The UI operates via local database listeners (`RxJS` observables); incoming socket events simply insert records into local SQLite to trigger reactive UI updates.

3. **On-Device Voice Intent Classifier Schema:**
   * *Status:* `GET /v1/voice/intents` provides the versioned catalog and training utterances.
   * *Missing Detail:* The exact JSON structure of the intent grammar (e.g., whether it delivers pre-compiled regex tokens, keyword frequency dictionaries, or slot extraction rules).
   * *Mobile Handling:* The mobile parser implements a deterministic keyword/regex matcher with an offline dictionary fallback in `src/services/voice/intent-classifier.ts`, falling back to `POST /v1/voice/intent` whenever confidence is below 0.70.

4. **FCM Background Push Payload Convention:**
   * *Status:* Device registration accepts `fcm_token`.
   * *Missing Detail:* Does FCM deliver data-only messages (`{ data: { type: "sync", cursor: "..." } }`) that silently trigger background WorkManager sync, or standard notification blocks (`{ notification: { title, body } }`)?
   * *Mobile Handling:* Android notification service handles both: parses data payloads to trigger `DeltaSyncWorker` in the background and renders high-priority local heads-up notifications for emergency broadcasts.
