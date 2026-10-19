# Mobile Application Architecture & Target Directory Specification

**Project:** Autonomous Agricultural Intelligence & Extension System (Ethiopia)  
**Target Client:** Farmer & Extension Agent (DA) Native Android Application (`apps/mobile`)  
**Architecture Model:** Clean Architecture with Offline-First Reactive Data Layer  
**Date:** October 2026  

---

## 1. Architectural Principles & Design System

The mobile application architecture is designed around four foundational pillars:
1. **Offline-First Reactive Core:** All screen reads and user writes operate exclusively against an encrypted local SQLite database (WatermelonDB + SQLCipher). Network communication is handled asynchronously by a transactional delta-sync background queue.
2. **Illiteracy-First Universal Accessibility:** The UI prioritizes visual color-coded cards, high-contrast iconography, large touch targets (minimum 48×48 dp, 56 dp for primary actions), and an automated voice pipeline (speech-to-text dictation, spoken screen explainers, and voice-intent routing in Amharic, Afaan Oromoo, Tigrinya, and English).
3. **Clean Separation of Concerns:** Strict layer decoupling ensures that UI components depend only on view models / presenters, which interact with repository interfaces, completely isolating local database logic and remote network transports.
4. **Tenant & Role Isolation:** Strict client admission restricts access to `farmer` and `da` roles, enforcing the 30-day sliding session token stored in the Android Keystore.

---

## 2. Target Directory Tree

The complete proposed structure for `apps/mobile/`:

```text
apps/mobile/
├── android/                             # Android native project files
│   ├── app/
│   │   ├── build.gradle
│   │   └── src/main/AndroidManifest.xml # Permissions (CAMERA, AUDIO, GPS, FCM)
│   └── build.gradle
├── assets/
│   ├── fonts/                           # Noto Sans Ge'ez & Latin font weights
│   ├── images/
│   │   ├── branding/                    # App icons, splash artwork
│   │   ├── categories/                  # Soil classes, crop types, pest icons
│   │   └── illustrations/               # Storage guide (PICS), framing guides
│   └── audio/                           # Offline audio chimes (start/stop listening)
├── src/
│   ├── App.tsx                          # Application bootstrap & provider hierarchy
│   ├── config/                          # Environment variables & constants
│   │   ├── env.ts                       # Validated API base URLs & config constants
│   │   └── constants.ts                 # Timeouts, pagination limits, chunk sizes
│   │
│   ├── theme/                           # Design system & design tokens
│   │   ├── colors.ts                    # HSL tailored agricultural palette
│   │   ├── typography.ts                # 16sp+ text scales & Ge'ez font families
│   │   ├── spacing.ts                   # 48dp / 56dp touch targets & layout margins
│   │   └── tokens.ts                    # Consolidated tokens for NativeWind / styling
│   │
│   ├── localization/                    # Multi-language string catalogs
│   │   ├── index.ts                     # i18n initialization & locale switcher
│   │   ├── am.json                      # Amharic (Ge'ez script)
│   │   ├── om.json                      # Afaan Oromoo (Latin script)
│   │   ├── ti.json                      # Tigrinya (Ge'ez script)
│   │   └── en.json                      # English
│   │
│   ├── database/                        # WatermelonDB Offline SQLite + SQLCipher
│   │   ├── index.ts                     # Database instance & SQLCipher setup
│   │   ├── schema.ts                    # 19 local synchronized tables schema
│   │   ├── migrations.ts                # Versioned migrations (N-2 compatibility)
│   │   ├── models/                      # WatermelonDB Model classes
│   │   │   ├── Farmer.ts
│   │   │   ├── Plot.ts
│   │   │   ├── CropCycle.ts
│   │   │   ├── SowingLog.ts
│   │   │   ├── FertilizerLog.ts
│   │   │   ├── FieldOperation.ts
│   │   │   ├── HarvestRecord.ts
│   │   │   ├── LedgerEntry.ts
│   │   │   ├── YieldGapAnalysis.ts
│   │   │   ├── DiagnosisCase.ts
│   │   │   ├── Grievance.ts
│   │   │   ├── GrievanceMessage.ts
│   │   │   ├── DaTask.ts
│   │   │   ├── MarketCentre.ts
│   │   │   ├── MarketSurvey.ts
│   │   │   ├── CrowdTransaction.ts
│   │   │   ├── Announcement.ts
│   │   │   ├── SyncMutation.ts
│   │   │   └── SyncChange.ts
│   │   └── sync/                        # Delta-sync engine
│   │       ├── sync-queue.ts            # Transactional mutation enqueuer
│   │       ├── delta-sync.ts            # Push/pull synchronization processor
│   │       └── conflict-resolver.ts     # Last-writer-wins & append-only logic
│   │
│   ├── services/                        # Native hardware & communication drivers
│   │   ├── api/                         # Network client & HTTP transport
│   │   │   ├── client.ts                # Axios/Fetch client with auth headers
│   │   │   ├── endpoints.ts             # Strongly typed API endpoints
│   │   │   └── interceptors.ts          # 401 handling, bearer injection, error map
│   │   ├── storage/                     # Secure hardware storage
│   │   │   ├── keychain-storage.ts      # React Native Keychain (Android Keystore)
│   │   │   └── file-storage.ts          # Encrypted local audio/photo file store
│   │   ├── voice/                       # Audio recording & Gemini speech pipeline
│   │   │   ├── audio-recorder.ts        # Native microphone driver (Opus/AAC)
│   │   │   ├── audio-player.ts          # Native audio player (streaming TTS)
│   │   │   ├── intent-classifier.ts     # Lightweight client-side intent parser
│   │   │   ├── voice-router.ts          # Screen routing & scroll execution
│   │   │   └── stt-service.ts           # Speech-to-text dictation service
│   │   ├── location/                    # GPS centroid capture
│   │   │   └── gps-service.ts           # Android Fused Location with accuracy bounds
│   │   ├── media/                       # Image compression & preparation
│   │   │   ├── camera-service.ts        # Guided leaf photo capture
│   │   │   └── image-resizer.ts         # Resizing <= 400KB, stripping EXIF
│   │   └── push/                        # Notifications & background wakeups
│   │       ├── fcm-handler.ts           # Firebase Cloud Messaging listener
│   │       └── notification-channels.ts # Android notification channels setup
│   │
│   ├── context/                         # Global React state providers
│   │   ├── AuthContext.tsx              # Session lifecycle & role admission
│   │   ├── FarmerContext.tsx            # DA active-farmer context switcher
│   │   ├── SyncContext.tsx              # Sync queue state, pending count, online
│   │   └── VoiceContext.tsx             # Voice listening overlay & TTS playback state
│   │
│   ├── navigation/                      # React Navigation system
│   │   ├── RootNavigator.tsx            # Auth stack vs. Main shell switch
│   │   ├── AuthNavigator.tsx            # Language -> SignIn -> OTP -> Setup
│   │   ├── FarmerTabNavigator.tsx       # Bottom tabs for Farmer role
│   │   ├── DaTabNavigator.tsx           # Bottom tabs for DA role
│   │   ├── routes.ts                    # Strongly typed route constants
│   │   └── types.ts                     # Navigation prop & screen param types
│   │
│   ├── components/                      # Shared UI components & design system
│   │   ├── common/
│   │   │   ├── AppHeader.tsx            # Header with DA active-farmer badge & sync chip
│   │   │   ├── Button.tsx               # 48dp/56dp high-contrast touch button
│   │   │   ├── VisualCard.tsx           # Illiteracy-first card with TTS play button
│   │   │   ├── AudioPlayerWidget.tsx    # Audio controls (play, pause, seek, speed)
│   │   │   ├── LoadingIndicator.tsx     # Animated loading spinner with spoken state
│   │   │   └── StatusChip.tsx           # Severity-colored pill (Verified, Stale, etc.)
│   │   ├── overlays/
│   │   │   ├── VoiceAssistant.tsx       # Persistent 56dp floating voice assistant widget
│   │   │   ├── ListeningOverlay.tsx     # Voice recording waveform & chime animation
│   │   │   ├── EmergencyBanner.tsx      # Full-screen emergency directive takeover
│   │   │   └── WeatherAlertBanner.tsx   # Red alert banner (frost, downpour, dry spell)
│   │   └── forms/
│   │       ├── PhoneInput.tsx           # +251 masked number input with voice dictation
│   │       ├── LargeNumberPad.tsx       # Large touch keypad with spoken digits
│   │       ├── DatePicker.tsx           # Dual-calendar (Ethiopian / Gregorian) picker
│   │       └── UnitSelector.tsx         # Land unit toggle (Timad, Kert, Hectare)
│   │
│   ├── screens/                         # 21 Standalone Mobile Screens
│   │   ├── auth/                        # Authentication & Onboarding
│   │   │   ├── LanguageSelectionScreen.tsx
│   │   │   ├── SignInScreen.tsx
│   │   │   └── ProfileSetupScreen.tsx
│   │   ├── main/                        # Navigation Hubs & Inboxes
│   │   │   ├── FarmerHomeScreen.tsx
│   │   │   ├── DaOperationsHubScreen.tsx
│   │   │   └── UnifiedInboxScreen.tsx
│   │   ├── plots/                       # Farm & Plot Profiling
│   │   │   ├── PlotListScreen.tsx
│   │   │   ├── RegisterPlotScreen.tsx
│   │   │   └── PlotDetailScreen.tsx
│   │   ├── agronomy/                    # Crop Cycles & Logging
│   │   │   ├── CropCycleHubScreen.tsx
│   │   │   ├── UniversalLoggerScreen.tsx
│   │   │   └── DaTasksScreen.tsx
│   │   ├── ai/                          # AI Diagnostics & Weather
│   │   │   ├── YieldGapScreen.tsx
│   │   │   ├── WeatherForecastScreen.tsx
│   │   │   ├── PestDiagnosisScreen.tsx
│   │   │   └── CertifiedInputsScreen.tsx
│   │   └── support/                     # Grievance, Market & Offline Settings
│   │       ├── GrievanceChatScreen.tsx
│   │       ├── MarketPricesScreen.tsx
│   │       ├── AnnouncementsScreen.tsx
│   │       ├── StorageGuideScreen.tsx
│   │       └── SyncSettingsScreen.tsx
│   │
│   └── utils/                           # Pure helper functions
│       ├── calendar-converter.ts        # Ethiopian <-> Gregorian calendar algorithms
│       ├── unit-converter.ts            # Timad/Kert to Hectare normalizer
│       ├── error-mapper.ts              # Localized user-friendly error translations
│       ├── formatters.ts                # Currency (ETB), area, and weight formatters
│       └── validation.ts                # Shared Zod validation helpers
│
├── __tests__/                           # Automated test suites
│   ├── unit/                            # Unit tests for business logic & calculators
│   │   ├── calendar-converter.test.ts
│   │   ├── unit-converter.test.ts
│   │   ├── intent-classifier.test.ts
│   │   └── conflict-resolver.test.ts
│   ├── component/                       # Component & UI rendering tests
│   │   ├── VisualCard.test.tsx
│   │   └── VoiceAssistant.test.tsx
│   └── integration/                     # WatermelonDB & Delta-Sync integration tests
│       ├── local-db.test.ts
│       └── delta-sync.test.ts
│
├── package.json
└── tsconfig.json
```

---

## 3. Layer Responsibilities & Architectural Flow

```
┌─────────────────────────────────────────────────────────────┐
│                       Presentation Layer                    │
│   Screens (21 Standalone Screens) + UI Overlays (Voice, AI) │
└──────────────────────────────┬──────────────────────────────┘
                               │ Observes & Triggers Actions
┌──────────────────────────────▼──────────────────────────────┐
│                    State & Context Layer                    │
│   AuthContext, FarmerContext (DA), SyncContext, VoiceContext│
└──────────────────────────────┬──────────────────────────────┘
                               │ Reads/Writes
┌──────────────────────────────▼──────────────────────────────┐
│                  Offline-First Reactive Layer               │
│   WatermelonDB (Encrypted SQLite via SQLCipher)             │
│   - Reads render instantly (<= 300ms)                       │
│   - Writes append to Transactional SyncMutation Queue       │
└──────────────────────────────┬──────────────────────────────┘
                               │ Synchronizes Asynchronously
┌──────────────────────────────▼──────────────────────────────┐
│                     Delta-Sync Engine                       │
│   NetInfo Connectivity Observer + WorkManager Background    │
│   - Batches mutations (<= 50 records)                       │
│   - Transmits SHA-256 payload hashes to Hono API            │
└──────────────────────────────┬──────────────────────────────┘
                               │ Calls HTTPS REST / OpenAPI 3.1
┌──────────────────────────────▼──────────────────────────────┐
│                     Shared Hono.js API                      │
│   PostgreSQL 15+ PostGIS / Redis / Gemini AI / Africa's T.  │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Comparison of Existing vs. Target Architecture

| Aspect | Existing Codebase (`apps/mobile`) | Recommended Target Architecture | Migration Approach |
| :--- | :--- | :--- | :--- |
| **Directory Structure** | Flat Expo Router structure in `src/app/`, mixing presentation, logic, and tests. | Clean feature-based modular layout (`src/screens/`, `src/database/`, `src/services/`). | Reorganize files into dedicated functional domains. |
| **Routing Model** | Expo Router file-based routing (`_layout.tsx`, `explore.tsx`). | React Navigation Native Stack & Tab Navigators with route guards. | Implement `RootNavigator.tsx` and route definitions in `routes.ts`. |
| **Data Persistence** | None. Purely in-memory React state + temporary AsyncStorage. | WatermelonDB with 19 local synchronized models encrypted via SQLCipher. | Initialize WatermelonDB schema matching PostgreSQL 42-table schema. |
| **Auth & Security** | `expo-secure-store` with web localStorage fallback. Username login permitted. | `react-native-keychain` Android Keystore. Phone + password only. | Replace auth service with OpenAPI v1.3 endpoints; reject Officer/Admin roles. |
| **Voice & Accessibility** | None. Standard touch inputs only. | Persistent 56dp voice assistant, intent classifier, Gemini STT/TTS audio streaming. | Implement `VoiceAssistant.tsx`, `audio-recorder.ts`, and `voice-router.ts`. |
| **Testing Architecture** | No test suites or test setup present. | Jest + React Native Testing Library in `__tests__/` (unit, component, sync integration). | Setup test runners and automated test fixtures. |
