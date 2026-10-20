# Phased Mobile Application Development Roadmap (8-Phase Master Plan)

**Project:** Autonomous Agricultural Intelligence & Extension System (Ethiopia)  
**Target Client:** Farmer & Extension Agent (DA) Native Android Application (`apps/mobile`)  
**Design Reference:** Stitch UI MVP Designs & Design System Specification  
**API Specification:** Hono.js API Surface v1.3 (42 PostgreSQL Tables, Better Auth, Delta-Sync)  
**Date:** October 2026  

---

## 1. Roadmap Overview & Stitch UI Alignment

This master plan divides the mobile application build into 8 incremental, dependency-aware phases. Each phase incorporates the visual patterns, layout grids, and reusable atomic components from the **Stitch UI MVP designs**, while maintaining strict conformance to the **documented API Surface v1.3**:

| Phase | Title | Primary Objective | Screen Coverage (Stitch UI & Catalog v1.3) | Documented API Endpoints Consumed |
| :---: | :--- | :--- | :--- | :--- |
| **Phase 1** | **Codebase Cleanup, Foundation & Offline Core** | Establish Clean Architecture, navigation shell, SQLCipher SQLite layer, and delta-sync engine. | Base App Shell, Provider Hierarchy | `/v1/sync/bootstrap`<br>`/v1/sync/push`<br>`/v1/sync/pull`<br>`/v1/app/version` |
| **Phase 2** | **Stitch Design System & Voice Interaction Shell** | Implement Stitch UI theme tokens, accessible card primitives, listening overlay, and 56dp voice FAB. | Global Overlays:<br>• Persistent Voice Assistant (56dp)<br>• Listening Waveform Overlay<br>• Screen Explainer Player Bar | `/v1/voice/intents`<br>`/v1/voice/intent`<br>`/v1/voice/tts` |
| **Phase 3** | **Identity, Authentication & Profile Setup** | Implement phone + password auth, SMS OTP verification, Keystore tokens, and profile creation/claim. | 1. Language Selection Screen<br>2. Phone & Password Sign-In Screen<br>3. Profile Setup & Claim Screen | `/api/auth/sign-in/phone`<br>`/api/auth/sign-up/phone`<br>`/api/auth/phone/verify-otp`<br>`/api/auth/forgot-password`<br>`/api/auth/reset-password`<br>`/v1/farmers/me`<br>`/v1/farmers/claim` |
| **Phase 4** | **Farmer Hub, Plot Profiling & DA Operations** | Implement farmer/DA dashboards, offline GPS centroid capture, soil profiling, and DA farmer switcher. | 4. Farmer Home Dashboard<br>5. DA Multi-Farmer Operations Hub<br>6. Plot List Screen<br>7. Register Plot Screen<br>8. Plot Detail Screen | `/v1/farmers/{farmerId}/plots`<br>`/v1/plots/{id}`<br>`/v1/geo/resolve`<br>`/v1/farmers`<br>`/v1/farmers/{id}/verify` |
| **Phase 5** | **Crop Lifecycle, Input Event Logging & DA Tasks** | Dynamic event logging for sowing, split fertilizer (basal, urea 1/2), harvest, ledger, and DA tasks. | 9. Crop Cycle Hub<br>10. Universal Field Event Logging Screen<br>11. DA Tasks & Field Visits Screen | `/v1/plots/{id}/cycles`<br>`/v1/cycles/{id}/sowing`<br>`/v1/cycles/{id}/fertilizer-logs/*`<br>`/v1/cycles/{id}/operations`<br>`/v1/cycles/{id}/harvest`<br>`/v1/cycles/{id}/ledger`<br>`/v1/da/tasks` |
| **Phase 6** | **AI Yield Gap Root-Cause Diagnostics & Weather** | Peer yield benchmark cards, streaming audio narration, 7-day weather, and Farm-or-Not activity indicators. | 12. Yield Gap Root-Cause Diagnostic Screen<br>13. 7-Day Weather & Spray/Plow Forecast Screen | `/v1/cycles/{id}/yield-gap`<br>`/v1/cycles/{id}/yield-gap/audio`<br>`/v1/plots/{id}/weather`<br>`/v1/plots/{id}/weather/summary-audio`<br>`/v1/plots/{id}/weather/alerts` |
| **Phase 7** | **Multimodal Vision Diagnostics & Input Verification** | In-app camera photo capture, EXIF stripping, Gemini multimodal diagnosis, and chemical directory. | 14. Pest Diagnosis & Treatment Screen<br>15. Certified Inputs Directory Screen | `/v1/diagnoses`<br>`/v1/diagnoses/{id}`<br>`/v1/diagnoses/{id}/audio`<br>`/v1/catalog/chemicals`<br>`/v1/catalog/pests`<br>`/v1/media/uploads` |
| **Phase 8** | **Grievances, Market Board, Broadcasts & Release** | Audio grievance tickets, 2-way chat, market day board, emergency broadcast takeover, and unified inbox. | 16. Grievance Voice Box & Threaded Chat<br>17. Market Price Board & Sale Logger<br>18. Announcements Feed Screen<br>19. Post-Harvest Storage Guide<br>20. Unified Inbox & Alerts Screen<br>21. Sync Status & Device Settings Screen | `/v1/grievances`<br>`/v1/grievances/{id}/messages`<br>`/v1/market/board`<br>`/v1/market/sales`<br>`/v1/announcements`<br>`/v1/inbox`<br>`/v1/devices` |

---

## 2. Detailed Phase Execution Specifications

### Phase 1: Codebase Cleanup, Foundation & Offline Core
* **A. Objective:** Eliminate obsolete starter template files, configure the Clean Architecture directory structure, initialize WatermelonDB with SQLCipher encryption, and build the transactional delta-sync queue.
* **B. Stitch UI Alignment:** Prepare global theme scaffolding (`src/theme/`), native container padding, navigation header styles, and tab bar shells matching Stitch design guidelines.
* **C. Screen Coverage:** Base application shell, global provider hierarchy, and root navigation container.
* **D. Files & Modules:**
  * *Created:* `src/database/index.ts`, `src/database/schema.ts` (19 local models), `src/database/sync/sync-queue.ts`, `src/database/sync/delta-sync.ts`, `src/navigation/RootNavigator.tsx`.
  * *Refactored:* `apps/mobile/package.json`, `apps/mobile/tsconfig.json`.
  * *Removed:* All default Expo template components.
* **E. Documented Backend Integration:** Consumes `/v1/sync/bootstrap`, `/v1/sync/push`, `/v1/sync/pull`, `/v1/app/version`. Operates via strict repository pattern so mock fixtures swap seamlessly with real Hono API endpoints.
* **F. Acceptance Criteria:**
  * App cold starts in <= 4s on reference hardware.
  * Local database writes complete in <= 200ms.
  * Fault-injection test (app kill mid-write) yields zero corrupt records.

---

### Phase 2: Stitch Design System & Voice Interaction Shell
* **A. Objective:** Establish the visual and voice interaction primitives derived from the Stitch UI MVP designs, including high-contrast visual cards, touch targets (48dp/56dp), the persistent 56dp voice assistant, and ephemeral audio streaming player.
* **B. Stitch UI Alignment:**
  * Implement exact Stitch color tokens (Koticha Vertisol `#27272A`, Beda Nitisol `#991B1B`, Teff Gold `#C78326`, Primary Green `#16A34A`).
  * Implement Stitch card components with integrated TTS play buttons, high-contrast borders, and rounded corners (`Radii.card = 20dp`).
  * Extract reusable atomic elements: `VisualCard.tsx`, `MetricCard.tsx`, `StatusBadge.tsx`, and `Button.tsx`.
* **C. Screen Coverage:** Global Overlays: Persistent Floating AI Assistant, Listening Waveform Overlay, and Screen Explainer Bar.
* **D. Files & Modules:**
  * *Created:* `src/theme/tokens.ts`, `src/theme/colors.ts`, `src/components/common/VisualCard.tsx`, `src/components/common/MetricCard.tsx`, `src/components/overlays/VoiceAssistant.tsx`, `src/components/overlays/ListeningOverlay.tsx`, `src/services/voice/audio-player.ts`.
* **E. Documented Backend Integration:** Consumes `/v1/voice/intents` (cached intent catalog) and `/v1/voice/tts` (streams WAV audio on demand).
* **F. Acceptance Criteria:**
  * Voice assistant button visible on 100% of screens with 56×56 dp touch target.
  * Local intent resolution completes in <= 2s from speech completion.
  * Audio chime plays within 500ms of tapping microphone.

---

### Phase 3: Identity, Authentication & Profile Setup
* **A. Objective:** Deliver the unified phone number + password authentication lifecycle, SMS OTP verification, Android Keystore bearer session persistence, role admission guard (MOB-3), and profile creation/claim.
* **B. Stitch UI Alignment:**
  * **Language Selection Screen:** 4 large language cards (Amharic, Afaan Oromoo, Tigrinya, English) with voice previews and carousel tutorial matching Stitch layout.
  * **Sign-In Screen:** Clean card layout with phone mask (+251), large keypad, password visibility toggle, and OTP verification step.
  * **Profile Setup Screen:** Visual kebele selector, local ID input, and consent checkbox.
* **C. Screen Coverage:**
  1. *Language Selection Screen*
  2. *Phone & Password Sign-In Screen*
  3. *Profile Setup & Claim Screen*
* **D. Files & Modules:**
  * *Created:* `src/screens/auth/LanguageSelectionScreen.tsx`, `src/screens/auth/SignInScreen.tsx`, `src/screens/auth/ProfileSetupScreen.tsx`, `src/services/storage/keychain-storage.ts`, `src/context/AuthContext.tsx`.
* **E. Documented Backend Integration:**
  * `POST /api/auth/sign-in/phone` (returns Bearer token in response body for `X-Client-Type: android`).
  * `POST /api/auth/sign-up/phone`, `POST /api/auth/phone/verify-otp`, `POST /api/auth/phone/resend-otp`.
  * `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`.
  * `POST /v1/farmers/me`, `POST /v1/farmers/claim`.
* **F. Acceptance Criteria:**
  * Officer or Admin sign-in receives `403 client_not_permitted` and displays visual web portal redirect.
  * Bearer token securely stored in Android Keystore with 30-day sliding expiry.
  * Offline user session hydrated immediately from local storage on app cold start.

---

### Phase 4: Farmer Hub, Plot Profiling & DA Operations
* **A. Objective:** Implement farmer and DA home hubs, offline plot registration with GPS centroid capture, qualitative soil profiling, automatic agro-zone tagging, and DA multi-farmer context switching.
* **B. Stitch UI Alignment:**
  * **Farmer Home Dashboard:** Plot summary cards, weather alert banner, yield shortcut, and unread announcement chips matching Stitch home mockup.
  * **DA Operations Hub:** Assigned farmer list with quick search, persistent active-farmer header banner, and completeness progress rings.
  * **Plot Screens:** Visual soil class selector (Koticha / Beda cards), GPS accuracy meter, and dual-unit area displays (Timad / Hectare).
* **C. Screen Coverage:**
  4. *Farmer Home Dashboard*
  5. *DA Multi-Farmer Operations Hub*
  6. *Plot List Screen*
  7. *Register Plot Screen*
  8. *Plot Detail Screen*
* **D. Files & Modules:**
  * *Created:* `src/screens/main/FarmerHomeScreen.tsx`, `src/screens/main/DaOperationsHubScreen.tsx`, `src/screens/plots/PlotListScreen.tsx`, `src/screens/plots/RegisterPlotScreen.tsx`, `src/screens/plots/PlotDetailScreen.tsx`, `src/services/location/gps-service.ts`, `src/utils/unit-converter.ts`.
* **E. Documented Backend Integration:**
  * `GET /v1/farmers/{farmerId}/plots`, `POST /v1/farmers/{farmerId}/plots` (server derives elevation and agro-zone).
  * `GET /v1/plots/{id}`, `PATCH /v1/plots/{id}`, `POST /v1/plots/{id}/archive`, `POST /v1/plots/{id}/restore`.
  * `GET /v1/geo/resolve`, `GET /v1/farmers`, `PATCH /v1/farmers/{id}/verify`.
* **F. Acceptance Criteria:**
  * GPS centroid captured offline with horizontal accuracy <= 30m.
  * DA can switch between 50 farmers in <= 1s without list re-rendering lag.
  * Timad/Kert to Hectare normalizer maintains precision within 0.01 ha.

---

### Phase 5: Crop Lifecycle, Input Event Logging & DA Tasks
* **A. Objective:** Deliver granular agronomic event logging for the active crop cycle, split fertilizer tracking (basal, 1st Urea, 2nd Urea), field operations, harvest yields, cash ledger, and DA field visit tasks.
* **B. Stitch UI Alignment:**
  * **Crop Cycle Hub:** Visual milestone progress stepper (Land Prep, Sowing, Basal, Urea 1, Urea 2, Weeding, Harvest) matching Stitch design.
  * **Universal Event Logger:** Single dynamic logging form with large touch toggles, dual Ethiopian/Gregorian date selector, and voice dictation.
  * **DA Tasks Screen:** Task cards with priority pills, location badges, and action buttons.
* **C. Screen Coverage:**
  9. *Crop Cycle Hub*
  10. *Universal Field Event Logging Screen*
  11. *DA Tasks & Field Visits Screen*
* **D. Files & Modules:**
  * *Created:* `src/screens/agronomy/CropCycleHubScreen.tsx`, `src/screens/agronomy/UniversalLoggerScreen.tsx`, `src/screens/agronomy/DaTasksScreen.tsx`, `src/components/forms/LargeNumberPad.tsx`, `src/components/forms/DatePicker.tsx`.
* **E. Documented Backend Integration:**
  * `GET /v1/plots/{id}/cycles`, `POST /v1/plots/{id}/cycles` (enforces 1 active cycle).
  * `PUT /v1/cycles/{id}/sowing`, `GET /v1/cycles/{id}/fertilizer-logs`.
  * `PUT /v1/cycles/{id}/fertilizer-logs/{type}` (enforces `urea_2_not_after_urea_1`).
  * `POST /v1/cycles/fertilizer-logs/bulk` (DA bulk log for up to 20 farmers).
  * `PUT /v1/cycles/{id}/harvest`, `GET /v1/cycles/{id}/ledger`, `POST /v1/cycles/{id}/ledger`.
  * `GET /v1/da/tasks`, `PATCH /v1/da/tasks/{id}`.
* **F. Acceptance Criteria:**
  * Urea 2 logged prior to Urea 1 or sowing date is blocked by client validation.
  * Harvest entry > 80 qt/ha triggers high-yield confirmation modal before saving.
  * Offline mutations queued with client sequence number and SHA-256 payload hash.

---

### Phase 6: AI Yield Gap Root-Cause Diagnostics & Agro-Weather
* **A. Objective:** Deliver server-computed peer yield benchmark comparisons, plain-language audio explanations, 7-day weather forecasts, and Farm-or-Not activity indicators.
* **B. Stitch UI Alignment:**
  * **Yield Gap Screen:** Large comparison chart showing Plot Yield vs. Peer Median vs. Top Quartile, three severity-coded cause cards, and next-season recommendations with "Listen" button.
  * **Weather Forecast Screen:** 7 daily condition cards, Farm-or-Not indicator badges (Plowing, Spraying, Harvest), and weather alert takeover banners.
* **C. Screen Coverage:**
  12. *Yield Gap Root-Cause Diagnostic Screen*
  13. *7-Day Weather & Spray/Plow Forecast Screen*
* **D. Files & Modules:**
  * *Created:* `src/screens/ai/YieldGapScreen.tsx`, `src/screens/ai/WeatherForecastScreen.tsx`, `src/components/overlays/WeatherAlertBanner.tsx`.
* **E. Documented Backend Integration:**
  * `GET /v1/cycles/{id}/yield-gap`, `GET /v1/cycles/{id}/yield-gap/audio?lang=...` (streams Gemini TTS narration).
  * `POST /v1/cycles/{id}/yield-gap/reminders` (saves advice for next cycle).
  * `GET /v1/plots/{id}/weather`, `GET /v1/plots/{id}/weather/summary-audio?lang=...`, `GET /v1/plots/{id}/weather/alerts`.
* **F. Acceptance Criteria:**
  * Yield gap cards display top three ranked root causes with supporting metrics.
  * Ephemeral audio streams directly to audio player without writing to device flash storage.
  * Weather advisory correctly displays stale-data indicator when operating offline.

---

### Phase 7: Multimodal Vision Diagnostics & Input Verification
* **A. Objective:** Implement in-app leaf photo capture, on-device image resizing/metadata stripping, asynchronous Gemini Vision disease diagnosis, registered chemical safety filter display, and certified input directory verification.
* **B. Stitch UI Alignment:**
  * **Pest Diagnosis Screen:** Framing viewfinder with silhouette overlay, 1–4 photo thumbnail strip, diagnosis result card with confidence badge, and chemical treatment instructions.
  * **Certified Inputs Directory:** Fast search bar with voice mic button, filter chips (Fertilizer, Seed, Chemical), and official product verification badge.
* **C. Screen Coverage:**
  14. *Pest Diagnosis & Treatment Screen*
  15. *Certified Inputs Directory Screen*
* **D. Files & Modules:**
  * *Created:* `src/screens/ai/PestDiagnosisScreen.tsx`, `src/screens/ai/CertifiedInputsScreen.tsx`, `src/services/media/camera-service.ts`, `src/services/media/image-resizer.ts`, `src/services/api/media-uploader.ts`.
* **E. Documented Backend Integration:**
  * `POST /v1/diagnoses` (returns 202 Accepted, `job_status: "queued"`).
  * `GET /v1/diagnoses/{id}`, `GET /v1/diagnoses/{id}/audio`, `PATCH /v1/diagnoses/{id}/review`.
  * `GET /v1/catalog/chemicals`, `GET /v1/catalog/pests`.
  * `POST /v1/media/uploads`, `PUT /v1/media/uploads/{id}` (256 KB chunked upload protocol).
* **F. Acceptance Criteria:**
  * Photos compressed to <= 400 KB and EXIF metadata completely stripped.
  * Unregistered chemicals are never displayed in treatment recommendations.
  * Offline diagnoses are queued locally and synchronized upon network reconnection.

---

### Phase 8: Grievances, Market Board, Broadcasts & Release Hardening
* **A. Objective:** Implement voice grievance recording, two-way threaded desk chat, market day price board, sale logging, emergency broadcast takeovers, post-harvest PICS storage guide, unified inbox, and OWASP MASVS release hardening.
* **B. Stitch UI Alignment:**
  * **Grievance Screen:** Voice record button (up to 3 min), audio waveform preview, status pipeline tracker, and chat message bubbles.
  * **Market Board:** 12-week price trend sparkline, neighbouring market price comparison table, and expected revenue calculator.
  * **Storage Guide:** Step-by-step illustrated cards for grain moisture testing and PICS bag hermetic sealing.
  * **Unified Inbox:** Consolidated alert cards with deep-links to specific source screens.
  * **Sync Settings:** Pending queue counter, data-saver toggle, and local database backup status.
* **C. Screen Coverage:**
  16. *Grievance Voice Box & Threaded Chat Screen*
  17. *Market Price Board & Sale Logger Screen*
  18. *Announcements Feed Screen*
  19. *Post-Harvest Storage Guide Screen*
  20. *Unified Inbox & Alerts Screen*
  21. *Sync Status & Device Settings Screen*
* **D. Files & Modules:**
  * *Created:* `src/screens/support/GrievanceChatScreen.tsx`, `src/screens/support/MarketPricesScreen.tsx`, `src/screens/support/AnnouncementsScreen.tsx`, `src/screens/support/StorageGuideScreen.tsx`, `src/screens/main/UnifiedInboxScreen.tsx`, `src/screens/support/SyncSettingsScreen.tsx`, `src/components/overlays/EmergencyBanner.tsx`.
* **E. Documented Backend Integration:**
  * `POST /v1/grievances`, `GET /v1/grievances/{id}`, `GET /v1/grievances/{id}/messages`, `POST /v1/grievances/{id}/messages`.
  * `GET /v1/market/board`, `GET /v1/market/compare`, `POST /v1/market/sales`.
  * `GET /v1/announcements`, `POST /v1/announcements/{id}/acknowledge`.
  * `GET /v1/inbox`, `GET /v1/inbox/summary`, `PATCH /v1/inbox/{id}/read`.
  * `POST /v1/devices`, `GET /v1/app/version`.
* **F. Acceptance Criteria:**
  * Spoken grievances up to 3 minutes recorded and uploaded with SHA-256 verification.
  * Emergency broadcasts takeover screen and require explicit user acknowledgement.
  * Android APK bundle size <= 40 MB, validated against OWASP MASVS Level 1.
