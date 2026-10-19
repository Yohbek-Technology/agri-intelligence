# Mobile Application Codebase Cleanup & Foundation Rebuild Plan

**Project:** Autonomous Agricultural Intelligence & Extension System (Ethiopia)  
**Target Client:** Farmer & Extension Agent (DA) Native Android Application (`apps/mobile`)  
**Status:** PROPOSED — PENDING EXPLICIT USER APPROVAL BEFORE EXECUTION  
**Date:** October 2026  

---

## 1. Objectives & Safety Boundaries

The goal of this cleanup plan is to systematically eliminate boilerplate Expo starter-kit files, rectify architectural divergences from the project specifications, and rebuild the mobile foundation to support an **offline-first, voice-operable, 21-screen architecture** without discarding valuable completed work or corrupting project configurations.

> [!IMPORTANT]
> **Strict Approval Boundary:** No destructive deletions, file moves, or major package replacements will be executed until the user explicitly reviews and approves this plan.

---

## 2. File-by-File Classification

### 2.1 Files to Keep (Unmodified or Minimally Adjusted)
These files represent valuable project configuration, genuine branding, or essential build tooling:
1. `apps/mobile/metro.config.js`: Required for monorepo module resolution with `@repo/shared` and Turbo.
2. `apps/mobile/tsconfig.json`: Preserves TypeScript configuration and `@/*` path aliases.
3. `apps/mobile/assets/images/icon.png`: Main app launch icon.
4. `apps/mobile/assets/images/android-icon-foreground.png`: Android adaptive icon foreground.
5. `apps/mobile/assets/images/android-icon-background.png`: Android adaptive icon background.
6. `apps/mobile/assets/images/android-icon-monochrome.png`: Android themed/monochrome icon.
7. `apps/mobile/declarations.d.ts`: Retains standard module declarations.

### 2.2 Files to Refactor (Extract & Restructure into Target Architecture)
Valuable business logic, validation, and design tokens will be extracted and refactored into clean architectural layers:
1. `apps/mobile/src/lib/error-mapper.ts`:
   * *Refactor into:* `apps/mobile/src/utils/error-mapper.ts`.
   * *Modifications:* Preserve Ethiopian phone number error messages, lockout handling, and OTP expiry text; expand to return localization keys matching the 4 app languages (`am`, `om`, `ti`, `en`).
2. `apps/mobile/src/constants/theme.ts`:
   * *Refactor into:* `apps/mobile/src/theme/tokens.ts` and `apps/mobile/src/theme/colors.ts`.
   * *Modifications:* Retain authentic agricultural palette (`#16A34A`, `#C78326`, `#FAF8F4`); configure integration with NativeWind and accessibility contrast rules (WCAG 2.1 AA).
3. `apps/mobile/src/services/auth.ts`:
   * *Refactor into:* `apps/mobile/src/services/api/auth-service.ts`.
   * *Modifications:* 
     * Remove username sign-in and username update methods.
     * Align all endpoints with Database Schema v1.3 (`/api/auth/sign-in/phone`, `/api/auth/sign-up/phone`, `/api/auth/phone/verify-otp`, `/api/auth/forgot-password`, `/api/auth/reset-password`).
     * Inject mandatory mobile identification headers (`X-Client-Type: android`, `X-App-Version`, `X-Device-Id`).
     * Attach session token as `Authorization: Bearer <token>` (MOB-AUTH-2).
4. `apps/mobile/src/providers/auth-provider.tsx`:
   * *Refactor into:* `apps/mobile/src/context/AuthContext.tsx`.
   * *Modifications:* Connect session storage to `react-native-keychain` Android Keystore; enforce role admission guard (MOB-3: reject `officer` and `system_admin`); support DA multi-farmer context switching (AGENT-1).
5. `apps/mobile/src/components/auth/auth-card.tsx`:
   * *Refactor into:* 
     * `apps/mobile/src/screens/auth/SignInScreen.tsx` (Phone + Password sign-in, forgot password modal).
     * `apps/mobile/src/screens/auth/LanguageSelectionScreen.tsx` (Illiteracy-first language cards with audio read-aloud).
     * Modular UI form controls (`PhoneInput.tsx`, `OtpInput.tsx`, `PasswordInput.tsx`).

### 2.3 Files to Replace (Incompatible Foundational Systems)
1. `apps/mobile/src/lib/storage.ts`:
   * *Replace with:* `apps/mobile/src/services/storage/keychain-storage.ts` using `react-native-keychain` for Android Keystore session management and SQLCipher database encryption keys.
2. `apps/mobile/src/lib/config.ts`:
   * *Replace with:* `apps/mobile/src/config/env.ts` with strict validation of `API_BASE_URL` and standardized endpoint constants.
3. `apps/mobile/src/app/` (Expo Router directory):
   * *Replace with:* `apps/mobile/src/navigation/` using **React Navigation** (Native Stack + Bottom Tabs), supporting the persistent voice assistant and 21 screen catalog routes.

### 2.4 Files Proposed for Removal (Boilerplate & Obsolete Artifacts)
The following files are generic starter-kit templates, unused web artifacts, or dead boilerplate that clutter the codebase:
1. `apps/mobile/README.md`: Generic Expo README. (Replace with comprehensive mobile development documentation).
2. `apps/mobile/scripts/reset-project.js`: Template reset script from `create-expo-app`.
3. `apps/mobile/src/app/(tabs)/explore.tsx`: Default Expo starter screen with API ping button.
4. `apps/mobile/src/app/+not-found.tsx`: Expo Router default 404 handler.
5. `apps/mobile/src/app/(tabs)/_layout.tsx`: Generic Expo tab bar using iOS symbols.
6. `apps/mobile/src/app/_layout.tsx`: Boilerplate Expo Router splash and stack.
7. `apps/mobile/src/components/animated-icon.tsx`: Reanimated Expo logo splash animation.
8. `apps/mobile/src/components/animated-icon.web.tsx`: Web version of Expo logo animation.
9. `apps/mobile/src/components/animated-icon.module.css`: CSS module for Expo logo animation.
10. `apps/mobile/src/components/hint-row.tsx`: Starter template hint component ("Try editing app/index.tsx").
11. `apps/mobile/src/components/web-badge.tsx`: Component displaying Expo package version.
12. `apps/mobile/src/components/external-link.tsx`: Unused template link helper.
13. `apps/mobile/src/components/ui/collapsible.tsx`: Unused template accordion component.
14. `apps/mobile/assets/expo.icon`: Unused iOS icon format.
15. `apps/mobile/assets/images/expo-badge.png` & `expo-badge-white.png`: Expo branding badge.
16. `apps/mobile/assets/images/expo-logo.png`: Expo logo.
17. `apps/mobile/assets/images/logo-glow.png`: Expo logo background effect.
18. `apps/mobile/assets/images/react-logo.png`, `react-logo@2x.png`, `react-logo@3x.png`: Default React logo assets.
19. `apps/mobile/assets/images/splash-icon.png`: Default blue splash icon.
20. `apps/mobile/assets/images/tutorial-web.png`: Starter kit tutorial graphic.
21. `apps/mobile/assets/images/tabIcons/`: Placeholder tab icons (`explore.png`, `home.png`).

### 2.5 New Files & Modules to Create (Foundational Architecture)
* **`src/database/`**: WatermelonDB local database schema, models, and delta-sync engine.
  * `schema.ts`: 19 local synchronized tables reflecting the 42-table schema.
  * `index.ts`: Database initialization with SQLCipher encryption adapter.
  * `models/`: Models for `Farmer`, `Plot`, `CropCycle`, `FertilizerLog`, `HarvestRecord`, `Grievance`, `MarketPrice`, etc.
  * `sync/sync-engine.ts`: Transactional delta-sync queue (SYNC-2 to SYNC-6).
* **`src/navigation/`**: React Navigation configuration.
  * `RootNavigator.tsx`: High-level state switch between Auth Stack and Main App Shell.
  * `AuthNavigator.tsx`: Language selection, phone sign-in, OTP verification, profile setup.
  * `FarmerTabNavigator.tsx`: Bottom tabs for Farmer (Home, Plots, Logger, Weather, Market).
  * `DaTabNavigator.tsx`: Bottom tabs for DA (Operations Hub, Farmers, Tasks, Sync, Settings).
  * `routes.ts`: Strict TypeScript route constants and navigation parameters.
* **`src/components/common/`**: Reusable illiteracy-first UI components.
  * `VoiceAssistant.tsx`: Persistent 56 dp floating AI voice button and modal bottom sheet.
  * `VisualCard.tsx`: Color-coded, high-contrast visual card with TTS audio readout button.
  * `AppHeader.tsx`: Header with active farmer context badge (for DAs) and sync status chip.
  * `AudioPlayer.tsx`: Audio player for human voice notes (grievances) and on-demand Gemini TTS.
* **`src/services/`**: Core device and backend service adapters.
  * `api/client.ts`: Shared Fetch/Axios client with Bearer auth, client headers, and offline queuing.
  * `voice/voice-router.ts`: Seven-step voice intent classification and screen router.
  * `voice/tts-service.ts`: On-demand Gemini TTS playback client.
  * `location/location-service.ts`: GPS centroid capture with accuracy validation.
  * `media/camera-service.ts`: Camera capture with client-side compression to <= 400 KB.

---

## 3. Risks & Dependencies

1. **Dependency Installation & Native Linking:**
   * *Risk:* Adding native modules (`@nozbe/watermelondb`, `react-native-keychain`, etc.) requires compatible native build configurations.
   * *Mitigation:* Ensure `expo-build-properties` or native Gradle dependencies are configured to target Android API 26+ and Java 17/Node 20+.
2. **Offline Data Model Consistency:**
   * *Risk:* Mismatches between local WatermelonDB schema and PostgreSQL tables could cause delta-sync failures.
   * *Mitigation:* Share Zod schemas directly from `@repo/shared` to validate payloads across network boundaries.
3. **Preservation of Git History:**
   * *Risk:* Bulk deletion could make git history review difficult.
   * *Mitigation:* Changes will be executed in clear, logically grouped git commits with explicit messages.

---

## 4. Safe Migration Sequence

```
Step 1: Backup & Git Snapshot (Verify working tree is clean)
   │
Step 2: Remove obsolete Expo starter template files and unused assets
   │
Step 3: Update `apps/mobile/package.json` with required architecture dependencies
   │
Step 4: Reorganize directory structure into `src/` modular layout
   │
Step 5: Migrate and refactor existing utilities (`theme`, `error-mapper`, `auth-service`)
   │
Step 6: Rebuild Foundation (React Navigation shell, WatermelonDB database client, SecureStorage)
   │
Step 7: Verification (TypeScript type-check, build verification, lint checks)
```

---

## 5. Post-Cleanup Verification Plan

Following execution, the foundation will be verified against the following criteria:
1. **TypeScript Typecheck:** `pnpm --filter mobile check-types` passes with zero errors.
2. **Linting Check:** `pnpm --filter mobile lint` passes with no dead imports or syntax warnings.
3. **App Bootstrap & Splash:** The application initializes successfully with React Navigation rendering the `LanguageSelectionScreen` or `SignInScreen`.
4. **Clean File Tree:** No lingering Expo sample files (`explore.tsx`, `hint-row.tsx`, etc.) remain in the project directory.
