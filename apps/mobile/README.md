# AgrIntel Mobile Application

Autonomous Agricultural Intelligence & Extension System (AgrIntel) client designed for low-literacy Ethiopian smallholder farmers and Kebele Development Agents (DAs).

## System Architecture

- **Framework**: React Native 0.86 with Expo ~57 and Expo Router v57 file-based routing.
- **Offline Storage**: WatermelonDB with SQLCipher 256-bit AES encryption sourced from hardware-backed secure storage.
- **Voice-First Accessibility**: Speech-to-text dictation, multi-lingual TTS narration, and offline command parsing supporting Amharic (`am`), Afaan Oromoo (`om`), Tigrinya (`ti`), and English (`en`).
- **Touch Target Compliance**: Minimum 56dp interactive touch target enforced across field buttons and action cards (`src/theme/tokens.ts`).
- **Separation of Concerns**: Pure agronomic and meteorological business rules reside in `@repo/domain` with standalone unit test coverage.

---

## Directory Layout

```
apps/mobile/
├── app.config.ts                          Expo config (Android package, permissions, plugins)
├── eas.json                               EAS build profiles (development client, preview, production)
├── babel.config.js                        Babel & NativeWind compiler config
├── package.json
├── tsconfig.json
├── App.tsx                                Root entry placeholder
├── assets/                                Soil, storage, crop pictures & localized audio prompts
├── __tests__/                             Component, model, sync, voice, and e2e test suites
└── src/
    ├── app/                               Expo Router file-based route tree
    │   ├── _layout.tsx                    Root Layout (Theme, AuthProvider, I18nProvider)
    │   ├── index.tsx                      Role / Onboarding dispatcher
    │   ├── (auth)/                        M-01 to M-04 (Language, Phone/OTP, Registration, Pending)
    │   ├── (farmer)/                      M-05, M-06, M-18, M-22, M-24 (5 bottom tabs)
    │   ├── (da)/                          M-30 to M-34 (4 bottom tabs + farmers/ stack)
    │   ├── plots/                         M-07, M-08, M-21 (Registration, Detail, Rotation)
    │   ├── cycles/                        M-09 to M-17 (Planting, Fertilizer, Activities, Harvest, Finance, Yield Gap)
    │   ├── diagnostics/                   M-19 (Pest diagnosis result)
    │   ├── weather/                       M-23 (Farm-or-Not daily advisory)
    │   ├── grievances/                    M-25 (My grievances audio feed)
    │   ├── announcements/                 M-26 (Kebele bulletins & subsidies)
    │   ├── support/                       M-27 (Post-harvest & hermetic PICS bag guidance)
    │   └── settings/                      M-28, M-29 (Settings & Offline sync manager)
    ├── components/                        VoiceBar, TopBar, SoilTypeCard, FarmOrNotCard, FarmerSwitcher
    ├── database/                          WatermelonDB schema, versioned migrations, and models
    ├── hooks/                             useAuth, useNetwork, useSync, useTts, useVoiceCommand, useRecorder
    ├── i18n/                              am.json, om.json, ti.json, en.json translations
    ├── lib/                               constants.ts (400 KB image limit), errors.ts, format.ts
    ├── providers/                         auth-provider, i18n-provider, sync-provider, voice-provider
    ├── services/                          api, auth, audio, speech, location, camera, image, push, network
    ├── theme/                             tokens.ts (56dp min target), typography.ts, tailwind.config.js
    └── voice/                             parser.ts, registry.ts, and multilingual phrases
```

---

## Environment Variables

Create `.env` in `apps/mobile/` (or configure via EAS secret):

```bash
# Backend REST & WebSocket Gateway
EXPO_PUBLIC_API_URL="https://api.agrintel.gov.et"

# Application Environment Mode ('development' | 'preview' | 'production')
EXPO_PUBLIC_APP_VARIANT="development"

# Map & Geolocation API (Optional for Satellite Basemap)
EXPO_PUBLIC_MAPBOX_TOKEN=""
```

---

## Build & Run Steps

This application uses native modules (SQLCipher, Vision Camera, Firebase Messaging, Audio, Speech). **Do not run in Expo Go**; use an Expo Development Client build.

### 1. Install Workspace Dependencies
```bash
pnpm install
```

### 2. Run TypeScript Typecheck
```bash
pnpm --filter mobile run check-types
```

### 3. Build Android Development APK Locally
```bash
npx expo run:android
```

### 4. Build via EAS (Expo Application Services)
```bash
# Development client build
eas build --profile development --platform android

# Production App Bundle (AAB for Google Play / Internal Track)
eas build --profile production --platform android
```

---

## Running Automated Tests

### 1. Mobile Unit & E2E Tests
Runs all 9 test suites (components, WatermelonDB models, migrations, op-queue, voice parser, registration flow, crop cycle flow, and offline sync flow):
```bash
npx vitest run --config vitest.config.ts __tests__
```

### 2. Pure Domain Business Rule Tests
Runs the 27 domain rule test suites in `packages/domain`:
```bash
pnpm --filter @repo/domain run test
```
