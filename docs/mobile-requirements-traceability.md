# Requirements-to-Phase Traceability Matrix

**Project:** Autonomous Agricultural Intelligence & Extension System (Ethiopia)  
**Target Client:** Farmer & Extension Agent (DA) Native Android Application (`apps/mobile`)  
**Scope:** Complete In-Scope Mobile Requirements (SRS v1.3 & Part C)  
**Date:** October 2026  

---

## 1. Traceability Matrix

| Requirement ID | Requirement Description | Screen / UI Workflow | Feature / Module | Planned Phase | Backend Dependency | Verification Method | Initial Status |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **VOICE-1** | Persistent 56dp microphone button on 100% of screens | Global Voice Assistant Overlay | `voice` | Phase 2 | Audio driver / WebRTC | Automated UI component test | New Required |
| **VOICE-2** | Parse spoken intent & navigate to matching screen | Global Voice Assistant Overlay | `voice` | Phase 2 | Gemini STT (`stt.ts`) | 40-intent speech benchmark | New Required |
| **VOICE-3** | Voice-driven scrolling & in-screen section targeting | All feature screens | `voice` | Phase 2 | Local intent catalog | UI automated scroll test | New Required |
| **VOICE-4** | Voice trigger for screen actions & form navigation | Field Logger, Register Plot | `voice` | Phase 2 | Local intent catalog | Action dispatch test | New Required |
| **VOICE-5** | Speech-to-text dictation for text & numeric inputs | Field Logger, Sale Logger | `voice` | Phase 2 | Gemini STT (`stt.ts`) | Spoken numbers benchmark | New Required |
| **VOICE-6** | Automated Gemini TTS screen explainer read-aloud | All feature screens | `voice` | Phase 2 | Gemini TTS (`tts.ts`) | Spoken output timing test | New Required |
| **VOICE-7** | Voice search on catalog, directory & price screens | Certified Inputs, Market Board | `voice` | Phase 6, 7 | Local intent catalog | Query filter timing test | New Required |
| **VOICE-8** | Spoken clarifying question for confidence < 0.65 | Voice Assistant Overlay | `voice` | Phase 2 | Threshold from office | Low-confidence test suite | New Required |
| **VOICE-9** | Dual-mode navigation: standard touch + voice | App Shell, Bottom Tabs | `navigation` | Phase 2 | Local intent catalog | Touch navigation test | New Required |
| **VOICE-10** | Multi-language interface selection (AM, OM, TI, EN) | Language Selection Screen | `localization`| Phase 3 | Localized strings | Locale switch unit test | New Required |
| **VOICE-11** | Illiteracy-first visual cards & high-contrast icons | All feature screens | `theme` | Phase 2 | Design tokens | Usability task completion | New Required |
| **VOICE-12** | Offline intent resolution from local cached catalog | Global Voice Assistant Overlay | `voice` | Phase 2 | Local intent catalog | Offline airplane mode test| New Required |
| **PLOT-1** | Phone + password sign-up verified by 6-digit SMS OTP | Phone & Password Sign-In Screen | `identity` | Phase 3 | `/api/auth/sign-up/phone` | OTP expiration & retry test| Existing / Mod |
| **PLOT-2** | Capture name, local ID, city, kebele in profile | Profile Setup & Claim Screen | `registry` | Phase 3 | `/v1/farmers/me` | Local ID regex unit test | New Required |
| **PLOT-3** | Phone-verified farmer active immediately (no approval) | Profile Setup & Claim Screen | `registry` | Phase 3 | Database trigger | Instant access E2E test | New Required |
| **PLOT-4** | Register plots in Timad, Kert, or Hectare + planned crop | Register Plot Screen | `registry` | Phase 4 | Office conversion factor | Unit conversion test | New Required |
| **PLOT-5** | Capture single GPS centroid (accuracy <= 30m) | Register Plot Screen | `registry` | Phase 4 | `/v1/geo/resolve` | GPS mock accuracy test | New Required |
| **PLOT-6** | Derive elevation & auto-tag agro-climatic zone | Register Plot, Plot Detail | `registry` | Phase 4 | Offline elevation raster | Zone boundary test | New Required |
| **PLOT-7** | Qualitative soil profiling (Koticha, Beda, Sandy, etc.) | Register Plot Screen | `registry` | Phase 4 | Soil catalog | Soil picker UI test | New Required |
| **PLOT-8** | Audit logging of area, centroid, and soil edits | Plot Detail Screen | `registry` | Phase 4 | `/v1/plots/{id}` | Audit trail trigger test | New Required |
| **PLOT-9** | Archive and restore inactive plots | Plot List Screen | `registry` | Phase 4 | `/v1/plots/{id}/archive` | Soft delete filter test | New Required |
| **PLOT-10** | Plot summary cards with crop and stage summaries | Farmer Home Dashboard | `registry` | Phase 4 | Local WatermelonDB | Load performance test | Existing / Mod |
| **CROP-1** | Track 1–3 year multi-season plot crop history | Plot Detail Screen | `cropLog` | Phase 5 | Local WatermelonDB | History entry validation | New Required |
| **CROP-2** | Start active crop cycle from office catalog | Crop Cycle Hub Screen | `cropLog` | Phase 5 | Catalog sync | Partial unique index test | New Required |
| **CROP-3** | Forward-only milestone progression (Land Prep to Harvest) | Crop Cycle Hub Screen | `cropLog` | Phase 5 | Local WatermelonDB | Stage transition test | New Required |
| **CROP-4** | Sowing log: date, seed variety, certified vs recycled | Universal Logger Screen | `cropLog` | Phase 5 | Sowing triggers | Seed rate computation | New Required |
| **CROP-5** | Basal fertilizer log (NPS / NPS-Zinc, kg, date) | Universal Logger Screen | `cropLog` | Phase 5 | Fertilizer constraints | Quantity range test | New Required |
| **CROP-6** | 1st Urea top-dressing log (quantity, date, stage) | Universal Logger Screen | `cropLog` | Phase 5 | Days-after-sowing trig | Urea 1 validation test | New Required |
| **CROP-7** | 2nd Urea top-dressing log (must follow Urea 1 date) | Universal Logger Screen | `cropLog` | Phase 5 | Trigger validation | Date order constraint test| New Required |
| **CROP-8** | Explicit fertilizer skip logging with structured reason | Universal Logger Screen | `cropLog` | Phase 5 | Skip constraints | Skip reason dialog test | New Required |
| **CROP-9** | Field operations logging (plowing, weeding, spraying) | Universal Logger Screen | `cropLog` | Phase 5 | Operation constraints | Sequence validation test | New Required |
| **CROP-10** | Harvest yield recording (kg/qt) & plausibility ceiling | Universal Logger Screen | `cropLog` | Phase 5 | Ceiling trigger | Plausibility confirmation | New Required |
| **CROP-11** | Basic cash ledger (input costs, rental, labor, revenue) | Crop Cycle Hub Screen | `cropLog` | Phase 5 | Local WatermelonDB | Ledger balance unit test | New Required |
| **CROP-12** | Log correction within 14 days (audited trail) | Universal Logger Screen | `cropLog` | Phase 5 | Audit log trigger | 14-day window logic test | New Required |
| **CROP-13** | Prompts for missing events (scheduled offline) | Unified Inbox & Alerts Screen | `cropLog` | Phase 5 | Local notifications | Reboot survival test | New Required |
| **CROP-14** | Complete fertilizer log by voice dictation in <= 4 turns | Universal Logger Screen | `cropLog` | Phase 5 | Gemini STT (`stt.ts`) | Voice turn benchmark | New Required |
| **YIELD-1** | Peer-yield benchmark against top-quartile producers | Yield Gap Screen | `yieldGap` | Phase 6 | `/v1/cycles/{id}/yield-gap`| Cohort calculation test | New Required |
| **YIELD-2** | Compute plot yield gap percentage vs cohort top quartile | Yield Gap Screen | `yieldGap` | Phase 6 | Structured factor result | Formula verification test | New Required |
| **YIELD-3** | Fertilizer dosage & split-timing gap analysis | Yield Gap Screen | `yieldGap` | Phase 6 | Factor breakdown JSON | Score display test | New Required |
| **YIELD-4** | Sowing date variance relative to dynamic rainfall onset | Yield Gap Screen | `yieldGap` | Phase 6 | Stored `rain_onset_date` | Onset variance test | New Required |
| **YIELD-5** | Weed competition & delayed weeding breakdown | Yield Gap Screen | `yieldGap` | Phase 6 | Weeding windows | Delay flag test | New Required |
| **YIELD-6** | Seed variety gap (certified seed vs recycled grain) | Yield Gap Screen | `yieldGap` | Phase 6 | Seed source factor | Variety difference test | New Required |
| **YIELD-7** | Deterministic ranking of top 3 root causes | Yield Gap Screen | `yieldGap` | Phase 6 | Top causes array | Cause card order test | New Required |
| **YIELD-8** | Plain-language audio narration via Gemini TTS | Yield Gap Screen | `yieldGap` | Phase 6 | `/v1/.../yield-gap/audio` | Audio playback test | New Required |
| **YIELD-9** | Actionable corrective recommendations for next season | Yield Gap Screen | `yieldGap` | Phase 6 | Recommendations array | Reminder save test | New Required |
| **YIELD-10**| Farmer privacy: peer data shown in aggregate only | Yield Gap Screen | `yieldGap` | Phase 6 | Cohort aggregation | Data leakage audit | New Required |
| **YIELD-11**| Offline access to generated yield gap results | Yield Gap Screen | `yieldGap` | Phase 6 | Local WatermelonDB | Offline viewing test | New Required |
| **YIELD-12**| Top-quartile celebration & practice highlights | Yield Gap Screen | `yieldGap` | Phase 6 | Status `top_quartile` | Top producer UI test | New Required |
| **WEATH-1**| Current weather conditions for plot centroid | Weather Forecast Screen | `weather` | Phase 6 | `/v1/plots/{id}/weather` | Grid cache display test | New Required |
| **WEATH-2**| 7-day agricultural forecast with soil moisture index | Weather Forecast Screen | `weather` | Phase 6 | Cached 7-day JSON | 7-day card rendering | New Required |
| **WEATH-3**| "Farm or Not" plowing readiness indicator | Weather Forecast Screen | `weather` | Phase 6 | Soil moisture threshold | Indicator state test | New Required |
| **WEATH-4**| Safe chemical spraying window & rain wash-off warning | Weather Forecast Screen | `weather` | Phase 6 | Wind / rain thresholds | 6-hour wash-off warning | New Required |
| **WEATH-5**| Dry harvesting window indicator (mold prevention) | Weather Forecast Screen | `weather` | Phase 6 | Rain probability threshold | Consecutive day grouping | New Required |
| **WEATH-6**| Spoken weekly weather summary audio playback | Weather Forecast Screen | `weather` | Phase 6 | On-demand Gemini TTS | Advisory audio test | New Required |
| **WEATH-7**| Extreme weather alerts (Frost, Downpour, Dry Spell) | Farmer Home, Weather Screen | `weather` | Phase 6 | Cached weather alerts | Persistent banner test | New Required |
| **WEATH-8**| Weather alerts pushed via local notification | Unified Inbox & Alerts Screen | `weather` | Phase 6 | Sync event handler | 5-minute alert timing | New Required |
| **WEATH-9**| Crop-stage aware weather indicators | Weather Forecast Screen | `weather` | Phase 6 | Active cycle stage | Stage filtering test | New Required |
| **DIAG-1** | In-app camera photo capture (up to 4 leaf photos) | Pest Diagnosis Screen | `diagnostics` | Phase 7 | Native camera module | <= 400KB compression | New Required |
| **DIAG-2** | Context-grounded diagnosis prompt assembly | Pest Diagnosis Screen | `diagnostics` | Phase 7 | Plot & weather context | Context payload test | New Required |
| **DIAG-3** | Multimodal Gemini Vision disease identification | Pest Diagnosis Screen | `diagnostics` | Phase 7 | `/v1/diagnoses` (queued) | Schema validation test | New Required |
| **DIAG-4** | Pesticide safety filter: strictly registered chemicals | Pest Diagnosis Screen | `diagnostics` | Phase 7 | `registered_chemicals` | Adversarial filter test | New Required |
| **DIAG-5** | Exact dosage and pre-harvest safety interval display | Pest Diagnosis Screen | `diagnostics` | Phase 7 | Copied catalog text | Dosage fidelity test | New Required |
| **DIAG-6** | Low-confidence diagnosis flagged & escalated to DA | Pest Diagnosis Screen | `diagnostics` | Phase 7 | DA task creation | Low-confidence flow | New Required |
| **DIAG-7** | Spoken diagnosis advice generated on-demand by TTS | Pest Diagnosis Screen | `diagnostics` | Phase 7 | Gemini TTS (`tts.ts`) | On-demand speech test | New Required |
| **DIAG-8** | 3-Year crop rotation recommendations | Pest Diagnosis Screen | `diagnostics` | Phase 7 | `/v1/rotation-advice` | Rotation rule logic | New Required |
| **DIAG-9** | Registered chemical & certified seed directory | Certified Inputs Screen | `catalog` | Phase 7 | `/v1/catalog/chemicals` | Voice search fuzzing | New Required |
| **DIAG-10**| Offline diagnosis queuing with notification on result | Pest Diagnosis Screen | `diagnostics` | Phase 7 | Sync mutation queue | Queue survival test | New Required |
| **DIAG-11**| Plot diagnosis history viewable offline | Pest Diagnosis Screen | `diagnostics` | Phase 7 | Local WatermelonDB | Local history rendering | New Required |
| **DIAG-12**| Outbreak clustering requires farmer recorded consent | Profile Setup, Settings | `identity` | Phase 3, 7 | `consent_agreed` flag | Consent filter check | New Required |
| **GRIEV-1**| Voice-recorded grievance complaint (up to 3 min) | Grievance Voice Box Screen | `grievance` | Phase 8 | Audio recorder driver | 3-minute recording test | New Required |
| **GRIEV-2**| Categorize grievance into 4 structured issue types | Grievance Voice Box Screen | `grievance` | Phase 8 | Category enum | Category chip selection | New Required |
| **GRIEV-3**| Automatic attachment of farmer ID, kebele, centroid | Grievance Voice Box Screen | `grievance` | Phase 8 | Profile context | Context attachment test | New Required |
| **GRIEV-4**| Attach up to 3 evidence photos to grievance | Grievance Voice Box Screen | `grievance` | Phase 8 | Image compression | Array limit validation | New Required |
| **GRIEV-5**| Track status transitions (`submitted` to `resolved`) | Grievance Voice Box Screen | `grievance` | Phase 8 | Local WatermelonDB | Status history badge test| New Required |
| **GRIEV-6**| Two-way threaded chat (farmer voice + desk text/audio)| Grievance Voice Box Screen | `grievance` | Phase 8 | Socket.io / sync feed | Threaded chat E2E test | New Required |
| **GRIEV-7**| Confirm resolution or reopen ticket within 7 days | Grievance Voice Box Screen | `grievance` | Phase 8 | `/v1/.../reopen` | 7-day cutoff logic test | New Required |
| **GRIEV-8**| Guaranteed offline submission with idempotent UUID | Grievance Voice Box Screen | `grievance` | Phase 8 | Client UUID generation | Replay deduplication test| New Required |
| **MKT-1** | City market day price board (min, max, average) | Market Prices Screen | `market` | Phase 8 | `/v1/market/board` | Stale price indicator | New Required |
| **MKT-2** | Crowdsourced sale logger with voice entry | Market Prices Screen | `market` | Phase 8 | `/v1/market/sales` | Plausibility band check | New Required |
| **MKT-3** | Crowdsourced sales held for moderation before display | Market Prices Screen | `market` | Phase 8 | Moderation status | Pending tag verification| New Required |
| **MKT-4** | Expected revenue calculator from current spot prices | Market Prices Screen | `market` | Phase 8 | Offline calculation | Calculator accuracy test| New Required |
| **MKT-5** | Neighboring market center price comparison | Market Prices Screen | `market` | Phase 8 | `/v1/market/compare` | Difference ranking test | New Required |
| **MKT-6** | 12-Week crop price history chart & spoken trend | Market Prices Screen | `market` | Phase 8 | Local chart renderer | Chart point validation | New Required |
| **MKT-7** | Compare expected revenue against cycle cash ledger | Market Prices Screen | `market` | Phase 8 | Ledger integration | Net calculation test | New Required |
| **AGENT-1**| DA manages 30–50 farmers offline on shared device | DA Operations Hub Screen | `fieldAgent` | Phase 4 | Farmer switcher model | Switcher performance test| New Required |
| **AGENT-2**| DA registers farmers without phones (`has_no_phone`) | Profile Setup & Claim Screen | `fieldAgent` | Phase 3, 4 | `has_no_phone = true` | No-phone registration | New Required |
| **AGENT-3**| Record subject (`farmer_id`) and actor (`user_id`) | All logging forms | `fieldAgent` | Phase 4, 5 | Audit fields on models | Audit field verification| New Required |
| **AGENT-4**| DA bulk Urea application logging for up to 20 farmers | DA Operations Hub Screen | `fieldAgent` | Phase 5 | `/v1/cycles/.../bulk` | Bulk form row validation | New Required |
| **AGENT-5**| Localized pest outbreak cluster alerts to nearby users | Unified Inbox & Alerts Screen | `fieldAgent` | Phase 7, 8 | 5km cluster query | Outbreak alert delivery | New Required |
| **AGENT-6**| Post-harvest grain moisture & PICS bag storage guide | Storage Guide Screen | `fieldAgent` | Phase 8 | Illustrated assets | Offline narrative test | New Required |
| **AGENT-7**| Per-farmer log completeness dashboard for DAs | DA Operations Hub Screen | `fieldAgent` | Phase 4, 5 | Missing log flags | Completeness indicator | New Required |
| **AGENT-8**| Secure sign-out & per-DA encrypted profile separation | Sync Settings Screen | `fieldAgent` | Phase 4 | Per-DA SQLCipher key | Shared device separation| New Required |
| **SYNC-1** | All reads/writes operate on local SQLite (WatermelonDB)| Entire Application | `sync` | Phase 1 | WatermelonDB database | Airplane mode test | New Required |
| **SYNC-2** | Transactional mutation queue with UUID & SHA-256 hash | Sync Engine | `sync` | Phase 1 | `sync_mutations` model | Single-tx commit test | New Required |
| **SYNC-3** | Auto-start sync on 2G/3G/Wi-Fi connection detection | Sync Engine | `sync` | Phase 1 | NetInfo listener | Reconnect trigger test | New Required |
| **SYNC-4** | Monotonic cursor delta-sync protocol | Sync Engine | `sync` | Phase 1 | `/v1/sync/pull` | 2KB no-change handshake | New Required |
| **SYNC-5** | Idempotent replay of sync mutation batches | Sync Engine | `sync` | Phase 1 | Server deduplication | 1,000 batch replay test | New Required |
| **SYNC-6** | Conflict resolution: LWW profile, append-only logs | Sync Engine | `sync` | Phase 1 | Conflict resolver | Conflict matrix test | New Required |
| **SYNC-7** | Resumable chunked binary upload (256KB chunks) | Media Uploader | `sync` | Phase 7, 8 | `/v1/media/uploads` | Chunk resume test | New Required |
| **SYNC-8** | Visible sync status chip (last sync, pending count) | App Header (all screens) | `sync` | Phase 1 | SyncContext state | Pending chip counter | New Required |
| **SYNC-9** | Data-saver mode limiting media uploads to Wi-Fi | Sync Settings Screen | `sync` | Phase 8 | Metered network check | Cellular media block test| New Required |
| **SYNC-10**| Local database recovery from daily snapshots | Sync Settings Screen | `sync` | Phase 1 | Snapshot backup manager | Corruption recovery test| New Required |
| **MOB-1**  | Android parity with all Part A requirements | Entire Application | `mobile` | Phase 1-8 | Shared parity suite | 100% Must test pass | New Required |
| **MOB-2**  | Calls shared Hono.js OpenAPI 3.1 endpoints | Entire Application | `mobile` | Phase 1-8 | Shared API contract | Contract test suite | New Required |
| **MOB-3**  | Admits only `farmer` and `da` roles (officers blocked)| SignInScreen | `mobile` | Phase 3 | Client admission guard | 403 refusal verification | New Required |
| **MOB-4**  | One account across PWA and Android app | SignInScreen | `mobile` | Phase 3 | Better Auth account | Cross-client data test | New Required |
| **MOB-5**  | Shared locale files, tokens, and Zod schemas | Shared Packages | `mobile` | Phase 1, 3 | `@repo/shared` monorepo | CI missing-key check | New Required |
| **MOB-6**  | Bottom navigation, 56dp mic, visual cards, <= 5 fields | Entire Application | `mobile` | Phase 2 | React Navigation tabs | Screen ergonomics audit | New Required |
| **MOB-AUTH-1**| Complete authentication lifecycle of ADM-8 | Auth Screens | `auth` | Phase 3 | Better Auth endpoints | ADM-8 test suite | Existing / Mod |
| **MOB-AUTH-2**| Bearer session in Keystore (30-day sliding expiry) | AuthContext, Keychain | `auth` | Phase 3 | Better Auth `bearer` | Token persistence test | New Required |
| **MOB-AUTH-3**| Shared DA device profile separation via SQLCipher | Sync Settings Screen | `auth` | Phase 4 | Per-user DB encryption | Keystore separation test| New Required |
| **MOB-AUTH-4**| Request headers `X-Client-Type: android`, `X-Device-Id`| API Client Interceptor | `auth` | Phase 1, 3 | Device registration | Header injection test | New Required |
| **MOB-AUTH-5**| Sign-in requires network; other features work offline | SignInScreen | `auth` | Phase 3 | Offline state detector | Network requirement test| New Required |
| **MOB-DATA-1**| Local SQLite database encrypted via SQLCipher | Database Client | `data` | Phase 1 | SQLCipher adapter | Database dump encryption| New Required |
| **MOB-DATA-2**| Conformance with shared delta-sync protocol | Sync Engine | `data` | Phase 1 | `sync_mutations` | Conformance test suite | New Required |
| **MOB-DATA-3**| Background sync via Android WorkManager | WorkManager Worker | `data` | Phase 1 | Android WorkManager | Battery usage benchmark | New Required |
| **MOB-DATA-4**| Encrypted private storage for audio & photos | File Storage Driver | `data` | Phase 7, 8 | AES-GCM file store | App-private storage test| New Required |
| **MOB-DATA-5**| Local database recovery from encrypted snapshot | Sync Settings Screen | `data` | Phase 1 | Snapshot manager | Automated restore drill | New Required |
| **MOB-DATA-6**| 14-day offline soak test operation (>= 20,000 records) | Entire Application | `data` | Phase 8 | WatermelonDB capacity | 14-day soak test | New Required |
| **MOB-DATA-7**| Pre-cache office parameters, catalogs, and raster | Sync Engine | `data` | Phase 4 | `/v1/offices/me/config` | First-sync cache test | New Required |
| **MOB-VOICE-1**| Native voice routing pipeline with intent catalog | Voice Assistant Overlay | `voice` | Phase 2 | Native audio driver | Quiet & 60dB noise test | New Required |
| **MOB-VOICE-2**| Native audio player streaming Gemini TTS | Voice Assistant Overlay | `voice` | Phase 2 | Server Gemini TTS | Stream playback latency | New Required |
| **MOB-VOICE-3**| Unmodified human voice notes (grievances & replies) | Grievance Voice Box Screen | `voice` | Phase 8 | MediaRecorder driver | Binary SHA-256 match | New Required |
| **MOB-VOICE-4**| Runtime permission primer with spoken explanations | Profile Setup, Permissions | `voice` | Phase 3 | Android permissions | Deny & manual fallback | New Required |
| **MOB-VOICE-5**| Speaker default audio output & call interruption | Audio Player Driver | `voice` | Phase 2, 8 | Audio focus listener | Call interruption test | New Required |
| **MOB-VOICE-6**| TalkBack support & Android font scaling (up to 24sp) | All feature screens | `voice` | Phase 2 | Accessibility labels | TalkBack walkthrough | New Required |
| **MOB-DEV-1**| Camera photo capture <= 400KB & EXIF stripped | Pest Diagnosis Screen | `device` | Phase 7 | Native camera + resizer | Image metadata audit | New Required |
| **MOB-DEV-2**| High-accuracy plot GPS centroid via Fused Location | Register Plot Screen | `device` | Phase 4 | Android Fused Location | GPS accuracy filter test| New Required |
| **MOB-PUSH-1**| Register FCM token in `devices.push_token` | Push Notification Driver | `push` | Phase 8 | Firebase Messaging | Token lifecycle test | New Required |
| **MOB-PUSH-2**| Receive push alerts (weather, grievance, outbreaks) | Unified Inbox & Alerts Screen | `push` | Phase 8 | FCM listener | Deep-link routing test | New Required |
| **MOB-PUSH-3**| In-app badges derived from deliveries and messages | App Header, Bottom Tabs | `push` | Phase 8 | `/v1/inbox/summary` | Badge synchronization | New Required |
| **MOB-PUSH-4**| Offline local notifications for missing agronomic logs | Background Scheduler | `push` | Phase 5 | Android AlarmManager | Sowing date trigger test| New Required |
| **MOB-PUSH-5**| Android notification channels (emergency, messages) | Notification Manager | `push` | Phase 8 | NotificationManager | High-importance channel | New Required |
| **MOB-DIST-1**| Android 8.0+ (API 26), 2GB RAM, <= 40MB release APK | Native Build | `distribution`| Phase 8 | ProGuard / R8 minifier | APK size check | New Required |
| **MOB-DIST-2**| Signed APK distribution & Google Play readiness | Release Pipeline | `distribution`| Phase 8 | Android signing keys | Release build audit | New Required |
| **MOB-DIST-3**| Min-supported app version check & sync-only mode | Sync Settings Screen | `distribution`| Phase 8 | `/v1/app/version` | Update required screen | New Required |
| **MOB-DIST-4**| Privacy-hardened crash logs (zero farmer personal data)| Crash Reporting Driver | `distribution`| Phase 8 | Sanitized log exporter | Log scrub verification | New Required |

---

## 2. Flags & Clarifications

1. **Explicitly Out-of-Scope Functionality on Mobile:**
   - City Office Administrative Desks (Land Registry Management, Staff Assignment, Depot Inventory Adjustment, Broadcast Composing, Market Survey Verification) are strictly web portal features and excluded from mobile.
   - Regional / National multi-tier hierarchy is deferred to Version 2.
   - Polygon-based plot boundary drawing is deferred to Version 2 (single GPS centroid only).
2. **Pending API Contract Dependency:**
   - The chunked binary media upload handshake (`/v1/media/uploads`) and exact WebSocket message naming for live grievance chat depend on final backend publication. Mock drivers are specified to isolate feature implementation from backend schedule.
