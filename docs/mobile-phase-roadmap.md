# Phased Mobile Application Development Roadmap (8-Phase Master Plan)

**Project:** Autonomous Agricultural Intelligence & Extension System (Ethiopia)  
**Target Client:** Farmer & Extension Agent (DA) Native Android Application (`apps/mobile`)  
**Timeline Model:** 8 Sequential, Dependency-Aware Increments  
**Date:** October 2026  

---

## 1. Roadmap Overview Table

| Phase | Title | Primary Objective | Screen Coverage (Screen Catalog v1.3) | Core Requirements |
| :---: | :--- | :--- | :--- | :--- |
| **Phase 1** | **Codebase Cleanup, Foundation & Offline Core** | Establish Clean Architecture, React Navigation shell, SQLCipher WatermelonDB, and Delta-Sync protocol. | App Shell, Navigation Container | SYNC-1 to SYNC-6, MOB-1, MOB-2, MOB-DATA-1, MOB-DATA-2, MOB-DATA-3 |
| **Phase 2** | **Design System, Illiteracy-First Tokens & Voice Shell** | Implement high-contrast visual cards, voice listening overlay, intent classifier, and persistent 56dp voice assistant. | Persistent Floating AI Assistant, Listening Overlay | VOICE-1, VOICE-2, VOICE-6, VOICE-8, VOICE-9, VOICE-10, VOICE-11, MOB-VOICE-1, MOB-VOICE-2 |
| **Phase 3** | **Mobile Identity, Authentication & Profile Setup** | Implement phone + password auth, SMS OTP verification, Android Keystore tokens, and profile creation/claim. | 1. Language Selection Screen<br>2. Phone & Password Sign-In Screen<br>3. Profile Setup & Claim Screen | PLOT-1 to PLOT-3, ADM-8, MOB-3, MOB-AUTH-1 to MOB-AUTH-5 |
| **Phase 4** | **Farmer Hub, Plot Registration & Soil Profiling** | Implement plot centroid GPS capture, qualitative soil profiling, auto agro-zone derivation, and DA multi-farmer hub. | 4. Farmer Home Dashboard<br>5. DA Multi-Farmer Operations Hub<br>6. Plot List Screen<br>7. Register Plot Screen<br>8. Plot Detail Screen | PLOT-4 to PLOT-10, AGENT-1 to AGENT-3, AGENT-8, MOB-DEV-2, MOB-DATA-7 |
| **Phase 5** | **Crop Lifecycle, Input Event Logging & DA Tasks** | Implement dynamic logging for sowing, basal/urea split fertilizer, plowing, weeding, spraying, harvest, and cash ledger. | 9. Crop Cycle Hub<br>10. Universal Field Event Logging Screen<br>11. DA Tasks & Field Visits Screen | CROP-1 to CROP-14, AGENT-4, AGENT-7, MOB-DATA-4, MOB-PUSH-4 |
| **Phase 6** | **AI Yield Gap Root-Cause Diagnostics & Agro-Weather** | Deliver peer yield gap analysis, plain-language audio narration, 7-day weather, and Farm-or-Not activity indicators. | 12. Yield Gap Root-Cause Diagnostic Screen<br>13. 7-Day Weather & Spray/Plow Forecast Screen | YIELD-1 to YIELD-12, WEATH-1 to WEATH-9, VOICE-7, VOICE-12, MOB-PUSH-2 |
| **Phase 7** | **Multimodal Vision Diagnostics & Input Verification** | Implement camera leaf photo capture, on-device compression, Gemini multimodal diagnosis, and chemical directory. | 14. Pest Diagnosis & Treatment Screen<br>15. Certified Inputs Directory Screen | DIAG-1 to DIAG-12, AGENT-5, MOB-DEV-1 |
| **Phase 8** | **Grievance Voice Box, Market Board, Broadcasts & Release** | Deliver audio grievance tickets, two-way chat, market price board, storage guide, unified inbox, and MASVS hardening. | 16. Grievance Voice Box & Threaded Chat<br>17. Market Price Board & Sale Logger<br>18. Announcements Feed Screen<br>19. Post-Harvest Storage Guide<br>20. Unified Inbox & Alerts<br>21. Sync Status & Device Settings | GRIEV-1 to GRIEV-8, MKT-1 to MKT-7, COMM-3, AGENT-6, MOB-DIST-1 to MOB-DIST-4, NFR-MOB-1 to 8 |

---

## 2. Detailed Phase Specifications

### Phase 1: Codebase Cleanup, Foundation & Offline Core
* **A. Objective:** Remove obsolete Expo starter template files, configure the Clean Architecture structure, initialize WatermelonDB with SQLCipher encryption, and build the transactional delta-sync engine.
* **B. Functionality:** Local SQLite persistence for 19 synchronized entities, transactional mutation queue with client UUID and SHA-256 payload hashes, network connectivity detection (NetInfo), background sync scheduling via WorkManager.
* **C. Screen Coverage:** Base application shell, global provider hierarchy, and root navigation container.
* **D. Files & Modules:**
  * *Created:* `src/database/index.ts`, `src/database/schema.ts`, `src/database/models/*`, `src/database/sync/sync-queue.ts`, `src/database/sync/delta-sync.ts`, `src/navigation/RootNavigator.tsx`.
  * *Refactored:* `package.json`, `tsconfig.json`.
  * *Removed:* All Expo template components (`explore.tsx`, `hint-row.tsx`, `animated-icon.tsx`, etc.).
* **E. Backend Integration:** Calls `/v1/sync/bootstrap`, `/v1/sync/push`, `/v1/sync/pull`. Operates via mock sync engine until API contract is live.
* **F. Dependencies:** None (prerequisite for all future phases).
* **G. Acceptance Criteria:**
  * App cold starts in <= 4s on reference device.
  * Local database writes complete in <= 200ms.
  * Fault-injection test (app kill mid-write) yields zero corrupt records.
* **H. Testing Strategy:** Unit tests for schema models, fault injection for sync queue, integration tests for SQLite encryption.
* **I. Initial Status:** New implementation required.

---

### Phase 2: Design System, Illiteracy-First Tokens & Voice Shell
* **A. Objective:** Establish the visual and audio interaction shell, including the persistent 56dp voice assistant, listening overlay, intent classifier, and accessible visual card primitives.
* **B. Functionality:** Theme tokens (colors, typography, spacing), large touch targets (48dp/56dp), client-side intent classifier for 40 core intents, voice-driven scrolling, and streaming Gemini TTS playback.
* **C. Screen Coverage:** Persistent Floating AI Assistant, Listening Overlay, Read-This-Screen player bar.
* **D. Files & Modules:**
  * *Created:* `src/theme/tokens.ts`, `src/theme/colors.ts`, `src/components/common/Button.tsx`, `src/components/common/VisualCard.tsx`, `src/components/overlays/VoiceAssistant.tsx`, `src/components/overlays/ListeningOverlay.tsx`, `src/services/voice/voice-router.ts`.
  * *Refactored:* `src/constants/theme.ts`.
* **E. Backend Integration:** Consumes `/v1/voice/intents` and `/v1/voice/tts`. Mocked audio playback and intent catalog for offline development.
* **F. Dependencies:** Phase 1.
* **G. Acceptance Criteria:**
  * Voice button is visible on 100% of screens with 56×56 dp touch target.
  * Spoken intent resolution completes in <= 2s from end of speech.
  * Audio chime plays within 500ms of tapping microphone.
* **H. Testing Strategy:** Component tests for `VisualCard` and `VoiceAssistant`, intent classification accuracy test across 40 test phrases per language.
* **I. Initial Status:** Partially existing (theme tokens exist, voice shell is new).

---

### Phase 3: Mobile Identity, Authentication & Profile Setup
* **A. Objective:** Deliver the unified phone number + password authentication lifecycle, SMS OTP verification, Android Keystore token storage, and farmer profile setup/claim.
* **B. Functionality:** Phone number validation (+251), 6-digit SMS OTP entry with countdown and voice input, password policy validation (>= 10 chars), Android Keystore bearer session persistence (30-day sliding expiry), role admission guard (reject `officer` and `system_admin`), profile setup (local ID format validation, kebele assignment, single consent flag), and DA profile claiming.
* **C. Screen Coverage:**
  1. *Language Selection Screen*
  2. *Phone & Password Sign-In Screen*
  3. *Profile Setup & Claim Screen*
* **D. Files & Modules:**
  * *Created:* `src/screens/auth/LanguageSelectionScreen.tsx`, `src/screens/auth/SignInScreen.tsx`, `src/screens/auth/ProfileSetupScreen.tsx`, `src/services/storage/keychain-storage.ts`, `src/navigation/AuthNavigator.tsx`.
  * *Refactored:* `src/components/auth/auth-card.tsx` logic, `src/services/auth.ts`, `src/providers/auth-provider.tsx`.
* **E. Backend Integration:** Calls `/api/auth/sign-in/phone`, `/api/auth/sign-up/phone`, `/api/auth/phone/verify-otp`, `/api/auth/forgot-password`, `/api/auth/reset-password`, `/v1/farmers/me`, `/v1/farmers/claim`.
* **F. Dependencies:** Phase 1, Phase 2.
* **G. Acceptance Criteria:**
  * Officer/Admin credentials receive `403 client_not_permitted` and display web portal notice.
  * OTP 10-minute expiry and 5-failure lockout properly enforced.
  * Successful login persists bearer token in Keystore and hydrates user offline.
* **H. Testing Strategy:** Unit tests for auth schemas, Keystore integration tests, E2E tests for sign-up and password reset.
* **I. Initial Status:** Existing auth logic requires refactoring and role guard enforcement.

---

### Phase 4: Farmer Hub, Plot Registration & Soil Profiling
* **A. Objective:** Implement farmer and DA home hubs, offline plot registration with GPS centroid capture, qualitative soil profiling, automatic agro-zone tagging, and DA multi-farmer context switching.
* **B. Functionality:** Plot dashboard cards with audio summaries, plot creation with Timad/Kert/Hectare normalizer, high-accuracy GPS capture (<= 30m), offline elevation raster lookup, auto agro-zone derivation (Dega, Weyna Dega, Kolla), soil class and drainage selector, DA multi-farmer switcher (managing 30–50 farmers), and sensitive edit audit logging.
* **C. Screen Coverage:**
  4. *Farmer Home Dashboard*
  5. *DA Multi-Farmer Operations Hub*
  6. *Plot List Screen*
  7. *Register Plot Screen*
  8. *Plot Detail Screen*
* **D. Files & Modules:**
  * *Created:* `src/screens/main/FarmerHomeScreen.tsx`, `src/screens/main/DaOperationsHubScreen.tsx`, `src/screens/plots/PlotListScreen.tsx`, `src/screens/plots/RegisterPlotScreen.tsx`, `src/screens/plots/PlotDetailScreen.tsx`, `src/services/location/gps-service.ts`, `src/utils/unit-converter.ts`.
* **E. Backend Integration:** Consumes `/v1/farmers/{farmerId}/plots`, `/v1/geo/resolve`, `/v1/farmers`. Operates fully offline using WatermelonDB models.
* **F. Dependencies:** Phase 3.
* **G. Acceptance Criteria:**
  * Plot centroid captured offline with horizontal accuracy indicator.
  * DA can switch between 50 farmers in <= 1s without list lag.
  * Area conversions between Timad, Kert, and Hectare match within 0.01 ha.
* **H. Testing Strategy:** Unit tests for unit converter, GPS mocking tests, DA multi-farmer performance benchmarking.
* **I. Initial Status:** Mock home screen exists in `index.tsx`; standalone screens and GPS logic are new.

---

### Phase 5: Crop Lifecycle, Input Event Logging & DA Tasks
* **A. Objective:** Deliver granular agronomic event logging for the active crop cycle, split fertilizer tracking (basal, 1st Urea, 2nd Urea), field operations, harvest yields, cash ledger, and DA field visit tasks.
* **B. Functionality:** Start cycle from catalog crops, forward-only milestone progression (Land Preparation to Harvest), sowing log with seed source (certified vs. recycled), split fertilizer logging with explicit skips, 1st/2nd Urea days-after-sowing calculations, harvest volume recording with plausibility ceiling confirmation, cash ledger tracking, and DA task checklist completion.
* **C. Screen Coverage:**
  9. *Crop Cycle Hub*
  10. *Universal Field Event Logging Screen*
  11. *DA Tasks & Field Visits Screen*
* **D. Files & Modules:**
  * *Created:* `src/screens/agronomy/CropCycleHubScreen.tsx`, `src/screens/agronomy/UniversalLoggerScreen.tsx`, `src/screens/agronomy/DaTasksScreen.tsx`, `src/components/forms/LargeNumberPad.tsx`, `src/components/forms/DatePicker.tsx`.
* **E. Backend Integration:** Calls `/v1/plots/{id}/cycles`, `/v1/cycles/{id}/fertilizer-logs/{type}`, `/v1/cycles/{id}/harvest`, `/v1/da/tasks`. Uses WatermelonDB sync mutations.
* **F. Dependencies:** Phase 4.
* **G. Acceptance Criteria:**
  * Full fertilizer log completed by voice in <= 4 turns.
  * Urea 2 application before Urea 1 or sowing date is rejected by validation.
  * Plausibility confirmation requested when harvest yield exceeds 80 qt/ha.
* **H. Testing Strategy:** Unit tests for agronomic date calculations, form validation tests, bulk logging integration tests for DAs.
* **I. Initial Status:** New implementation required.

---

### Phase 6: AI Yield Gap Root-Cause Diagnostics & Agro-Weather
* **A. Objective:** Deliver server-computed peer yield benchmark comparisons, plain-language audio explanations, 7-day weather forecasts, and Farm-or-Not activity indicators.
* **B. Functionality:** Cohort yield gap display (median and top quartile), structured factor result cards (fertilizer dosage, split timing, rain onset variance, weed competition, seed variety), actionable recommendations saved as next-cycle reminders, cached 7-day forecast display, plowing readiness indicator, chemical spraying windows with rain wash-off warnings, and dry harvest windows.
* **C. Screen Coverage:**
  12. *Yield Gap Root-Cause Diagnostic Screen*
  13. *7-Day Weather & Spray/Plow Forecast Screen*
* **D. Files & Modules:**
  * *Created:* `src/screens/ai/YieldGapScreen.tsx`, `src/screens/ai/WeatherForecastScreen.tsx`, `src/components/overlays/WeatherAlertBanner.tsx`.
* **E. Backend Integration:** Calls `/v1/cycles/{id}/yield-gap`, `/v1/cycles/{id}/yield-gap/audio`, `/v1/plots/{id}/weather`. Stored as cached local entities for offline viewing.
* **F. Dependencies:** Phase 5.
* **G. Acceptance Criteria:**
  * Yield gap cards display top three ranked root causes with supporting metrics.
  * Weather forecast displays cached 7-day cards offline with observation timestamp.
  * Spray window correctly alerts when rain is forecast within 6 hours.
* **H. Testing Strategy:** Visual card rendering tests, offline cache fallback tests, calculation accuracy tests.
* **I. Initial Status:** New implementation required.

---

### Phase 7: Multimodal Vision Diagnostics & Input Verification
* **A. Objective:** Implement in-app leaf photo capture, on-device image resizing/metadata stripping, asynchronous Gemini Vision disease diagnosis, registered chemical safety filter display, and certified input directory verification.
* **B. Functionality:** Native camera capture (up to 4 photos), client-side compression to <= 400 KB with EXIF removal, framing guide with spoken guidance, offline queuing of diagnosis requests, visual diagnosis cards with treatment recommendations (strictly registered chemicals with copied dosage/PPE), 3-year crop rotation advice, and searchable registered chemical and seed directory with voice search.
* **C. Screen Coverage:**
  14. *Pest Diagnosis & Treatment Screen*
  15. *Certified Inputs Directory Screen*
* **D. Files & Modules:**
  * *Created:* `src/screens/ai/PestDiagnosisScreen.tsx`, `src/screens/ai/CertifiedInputsScreen.tsx`, `src/services/media/camera-service.ts`, `src/services/media/image-resizer.ts`.
* **E. Backend Integration:** Calls `/v1/diagnoses`, `/v1/diagnoses/{id}`, `/v1/catalog/chemicals`, `/v1/media/uploads`.
* **F. Dependencies:** Phase 4.
* **G. Acceptance Criteria:**
  * Captured photos compressed to <= 400 KB and long edge <= 1280 px with zero EXIF tags.
  * Diagnosis requests made offline are queued and submitted automatically upon sync.
  * Unregistered chemicals are never displayed in treatment output.
* **H. Testing Strategy:** Image compression unit tests, camera hardware mocks, directory search fuzzing.
* **I. Initial Status:** New implementation required.

---

### Phase 8: Grievance Voice Box, Market Board, Broadcasts & Release Hardening
* **A. Objective:** Implement voice grievance recording, two-way threaded desk chat, market day price board, sale logging, emergency broadcast takeovers, post-harvest PICS storage guide, unified inbox, and OWASP MASVS release hardening.
* **B. Functionality:** Spoken grievance recording (up to 3 minutes), category selection, status tracking, two-way threaded messaging (farmer voice + desk text read aloud via TTS), market price board with 12-week chart, sale logging with plausibility confirmation, expected revenue calculator, emergency broadcast full-screen takeover, illustrated PICS bag guide, unified notification inbox, data-saver mode, and min-supported-app-version checks.
* **C. Screen Coverage:**
  16. *Grievance Voice Box & Threaded Chat Screen*
  17. *Market Price Board & Sale Logger Screen*
  18. *Announcements Feed Screen*
  19. *Post-Harvest Storage Guide Screen*
  20. *Unified Inbox & Alerts Screen*
  21. *Sync Status & Device Settings Screen*
* **D. Files & Modules:**
  * *Created:* `src/screens/support/GrievanceChatScreen.tsx`, `src/screens/support/MarketPricesScreen.tsx`, `src/screens/support/AnnouncementsScreen.tsx`, `src/screens/support/StorageGuideScreen.tsx`, `src/screens/main/UnifiedInboxScreen.tsx`, `src/screens/support/SyncSettingsScreen.tsx`, `src/components/overlays/EmergencyBanner.tsx`.
* **E. Backend Integration:** Calls `/v1/grievances`, `/v1/grievances/{id}/messages`, `/v1/market/board`, `/v1/announcements`, `/v1/inbox`.
* **F. Dependencies:** Phase 3, Phase 4, Phase 5.
* **G. Acceptance Criteria:**
  * Spoken grievances up to 3 minutes uploaded unmodified with SHA-256 validation.
  * Emergency announcements pinned and read aloud until acknowledged.
  * 14-day offline soak test passes with zero data loss on 2 GB RAM reference device.
  * Release APK <= 40 MB, minified, and verified against OWASP MASVS Level 1.
* **H. Testing Strategy:** End-to-end multi-turn chat tests, market calculation tests, 14-day soak test, security scanning.
* **I. Initial Status:** New implementation required.
