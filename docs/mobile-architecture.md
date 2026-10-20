# Mobile Application Architecture & Target Directory Specification

**Project:** Autonomous Agricultural Intelligence & Extension System (Ethiopia)  
**Target Client:** Farmer & Extension Agent (DA) Native Android Application (`apps/mobile`)  
**Architecture Model:** Clean Architecture with Offline-First Reactive Data Layer & Stitch UI Reference  
**Status:** Reconciled to Database Schema & API Surface Specification v1.3  
**Date:** October 2026  

---

## 1. Architectural Principles & Design System

The mobile application architecture is designed around five foundational pillars:
1. **Offline-First Reactive Core:** All screen reads and user writes operate exclusively against an encrypted local SQLite database (WatermelonDB + SQLCipher). Network communication is handled asynchronously by a transactional delta-sync background queue (`POST /v1/sync/push`, `GET /v1/sync/pull`).
2. **Illiteracy-First Universal Accessibility:** The UI prioritizes visual color-coded cards, high-contrast iconography, large touch targets (minimum 48×48 dp, 56 dp for primary actions), and an automated voice pipeline (speech-to-text dictation, spoken screen explainers, and voice-intent routing in Amharic, Afaan Oromoo, Tigrinya, and English).
3. **Stitch UI Design Fidelity:** The presentation layer directly mirrors the Stitch UI MVP designs, maintaining identical component hierarchies, visual cards, navigation flows, and color tokens tailored for Ethiopian agricultural contexts.
4. **Strict API Contract Conformance:** All remote operations strictly comply with the documented Hono API Surface v1.3 (Bearer authentication via Android Keystore, required headers `X-Client-Type: android`, `X-Device-Id`, `X-App-Version`, `Accept-Language`, `Idempotency-Key`, standard success/error envelopes, and chunked media uploads).
5. **Tenant & Role Isolation (MOB-3):** Strict client admission restricts access to `farmer` and `da` roles only. Officer and Admin sign-in attempts are rejected with `403 client_not_permitted` and redirected to the Web Portal.

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
│   ├── theme/                           # Design system & Stitch Design Tokens
│   │   ├── colors.ts                    # HSL tailored palette (Koticha, Beda, Teff Gold, Greenery)
│   │   ├── typography.ts                # 16sp+ text scales & Ge'ez font families
│   │   ├── spacing.ts                   # 48dp / 56dp touch targets & layout margins
│   │   └── tokens.ts                    # Consolidated design tokens (Radii, Shadows, TouchTargets)
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
│   │   │   ├── endpoints.ts             # Strongly typed API endpoints from API Surface v1.3
│   │   │   ├── interceptors.ts          # Bearer injection, 403 role guard, error envelope map
│   │   │   ├── media-uploader.ts        # 256 KB chunked upload driver with SHA-256
│   │   │   └── audio-streamer.ts        # Ephemeral streaming TTS audio player
│   │   ├── storage/                     # Secure hardware storage
│   │   │   ├── keychain-storage.ts      # React Native Keychain (Android Keystore)
│   │   │   └── file-storage.ts          # Encrypted local audio/photo file store
│   │   ├── voice/                       # Audio recording & Gemini speech pipeline
│   │   │   ├── audio-recorder.ts        # Native microphone driver (Opus/AAC/M4A)
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
│   ├── navigation/                      # Navigation system
│   │   ├── RootNavigator.tsx            # Auth stack vs. Main shell switch
│   │   ├── AuthNavigator.tsx            # Language -> SignIn -> OTP -> Setup
│   │   ├── FarmerTabNavigator.tsx       # Bottom tabs for Farmer role
│   │   ├── DaTabNavigator.tsx           # Bottom tabs for DA role
│   │   ├── routes.ts                    # Strongly typed route constants
│   │   └── types.ts                     # Navigation prop & screen param types
│   │
│   ├── components/                      # Stitch UI Reusable Component Library
│   │   ├── common/
│   │   │   ├── AppHeader.tsx            # Header with DA active-farmer badge & sync chip
│   │   │   ├── Button.tsx               # 48dp/56dp high-contrast touch button
│   │   │   ├── VisualCard.tsx           # Illiteracy-first card with TTS play button
│   │   │   ├── MetricCard.tsx           # Large typography KPI card (Yield, Area, Price)
│   │   │   ├── StatusBadge.tsx          # Severity-colored pill (Verified, Stale, etc.)
│   │   │   ├── AudioPlayerWidget.tsx    # Audio controls (play, pause, seek, speed)
│   │   │   └── LoadingIndicator.tsx     # Animated loading spinner with spoken state
│   │   ├── overlays/
│   │   │   ├── VoiceAssistant.tsx       # Persistent 56dp floating voice assistant widget
│   │   │   ├── ListeningOverlay.tsx     # Voice recording waveform & chime animation
│   │   │   ├── EmergencyBanner.tsx      # Full-screen emergency directive takeover
│   │   │   └── WeatherAlertBanner.tsx   # Red alert banner (frost, downpour, dry spell)
│   │   └── forms/
│   │       ├── PhoneInput.tsx           # +251 masked number input with voice dictation
│   │       ├── LargeNumberPad.tsx       # Large touch keypad with spoken digits
│   │       ├── DatePicker.tsx           # Dual-calendar (Ethiopian / Gregorian) picker
│   │       ├── UnitSelector.tsx         # Land unit toggle (Timad, Kert, Hectare)
│   │       ├── SoilClassPicker.tsx      # Visual soil texture & drainage selector
│   │       └── GPSCaptureButton.tsx     # GPS centroid trigger with accuracy meter
│   │
│   ├── screens/                         # 21 Standalone Mobile Screens (Stitch Aligned)
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

## 3. Stitch UI Design System & Component Library Integration

When the user provides the Stitch UI MVP designs, the presentation layer directly implements them through the following standardized structure:

### 3.1 Design Tokens (`src/theme/`)
* **Color Palette (`colors.ts`):** 
  * Primary Green: `#16A34A` (Crop Foliage / Ethiopian Highlands)
  * Accent Gold: `#C78326` (Ripe Teff / Grain)
  * Vertisol Soil: `#27272A` (*Koticha* Black Clay)
  * Nitisol Soil: `#991B1B` (*Beda* Red Volcanic Soil)
  * Surface/Backgrounds: `#FAF8F4` (Warm Parchment), Card: `#FFFFFF`
  * Status Colors: Success `#16A34A`, Warning `#D97706`, Danger `#DC2626`, Info `#0284C7`
* **Typography (`typography.ts`):** Minimum body size 16sp, large mode up to 24sp. Ge'ez font families (`NotoSansEthiopic`) for Amharic/Tigrinya and Roboto for Latin scripts.
* **Layout & Sizing (`spacing.ts`, `tokens.ts`):** Minimum touch target 48×48 dp, primary buttons 56 dp, persistent voice FAB 56×56 dp.

### 3.2 Component Extraction Strategy
* Every UI pattern visible in the Stitch designs is extracted into reusable atomic components:
  1. **Visual Cards:** High-contrast cards with an integrated TTS speaker icon (`VisualCard.tsx`) allowing illiterate farmers to tap to listen.
  2. **Metric Displays:** Dual-unit displays showing local units (*Timad*, *Kert*) alongside standardized hectares and quintals.
  3. **Visual Pickers:** Grid-based visual selectors for soil classes, crop stages, and pest symptoms.
  4. **Overlays:** Consistent bottom sheets (`VoiceAssistant`, `SoilPicker`, `CropHistoryEntry`) that do not disorient the user.

---

## 4. Network Transport & API Contract Conformance

The API service layer enforces the documented Hono API conventions through automated interceptors:

### 4.1 Request Interceptor Chain
```typescript
// src/services/api/interceptors.ts
apiClient.interceptors.request.use(async (config) => {
  // 1. Inject Android Client Identity
  config.headers['X-Client-Type'] = 'android';
  config.headers['X-Device-Id'] = await getDeviceId();
  config.headers['X-App-Version'] = getAppVersion();
  config.headers['Accept-Language'] = getActiveLanguage(); // 'am' | 'om' | 'ti' | 'en'

  // 2. Inject Idempotency Key for Mutations
  if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
    config.headers['Idempotency-Key'] = Crypto.randomUUID();
  }

  // 3. Inject Keystore Bearer Token
  const token = await secureStorage.getItem('auth_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  return config;
});
```

### 4.2 Error Handling & Role Admission Guard
```typescript
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 403 && error.response?.data?.error?.code === 'client_not_permitted') {
      // MOB-3: Officer or Admin logged in on Android client
      await secureStorage.clear();
      navigationRef.navigate('SignIn', { 
        notice: 'Agricultural Officers and Admins must use the Web Portal.' 
      });
    }
    return Promise.reject(error);
  }
);
```

### 4.3 Chunked Media Uploader (`/v1/media/uploads`)
* Uploads are divided into strict **256 KB (262,144 bytes)** chunks.
* `POST /v1/media/uploads` initializes the transfer with SHA-256 and file size.
* `PUT /v1/media/uploads/{id}` sends chunks with `Content-Range: bytes start-end/total`.
* `POST /v1/media/uploads/{id}/complete` validates the full hash on the server.

### 4.4 Ephemeral Streaming TTS Audio Player
* The mobile app streams audio directly from `/v1/voice/tts`, `/v1/cycles/:id/yield-gap/audio`, and `/v1/plots/:id/weather/summary-audio`.
* Audio is piped directly to the native audio buffer and is **never written to persistent flash storage**, adhering to privacy and storage constraints.

---

## 5. Architectural Flow & Synchronization

```
┌─────────────────────────────────────────────────────────────┐
│                       Presentation Layer                    │
│   Stitch UI Screens (21 Screens) + Overlays (Voice Assistant)│
└──────────────────────────────┬──────────────────────────────┘
                                │ Observes & Dispatches Actions
┌──────────────────────────────▼──────────────────────────────┐
│                    State & Context Layer                    │
│   AuthContext, FarmerContext (DA), SyncContext, VoiceContext│
└──────────────────────────────┬──────────────────────────────┘
                                │ Reads / Writes
┌──────────────────────────────▼──────────────────────────────┐
│                  Offline-First Reactive Layer               │
│   WatermelonDB (Encrypted SQLite via SQLCipher)             │
│   - Reads render instantly (<= 200ms)                       │
│   - Writes append to Transactional SyncMutation Queue       │
└──────────────────────────────┬──────────────────────────────┘
                                │ Synchronizes Asynchronously
┌──────────────────────────────▼──────────────────────────────┐
│                     Delta-Sync Engine                       │
│   NetInfo Connectivity Observer + WorkManager Background    │
│   - Batches mutations (<= 50 records, <= 500 KB gzip)       │
│   - Computes SHA-256 payload hash                           │
│   - Transmits to POST /v1/sync/push                         │
│   - Pulls updates from GET /v1/sync/pull?cursor=...         │
└──────────────────────────────┬──────────────────────────────┘
                                │ Authenticated HTTPS REST
┌──────────────────────────────▼──────────────────────────────┐
│                     Shared Hono.js API                      │
│   PostgreSQL 15+ PostGIS / Redis / Gemini AI / Africa's T.  │
└─────────────────────────────────────────────────────────────┘
```
