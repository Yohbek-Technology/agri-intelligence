# Comprehensive Mobile Application Codebase & Architectural Audit

**Project:** Autonomous Agricultural Intelligence & Extension System (Ethiopia)  
**Target Client:** Farmer & Extension Agent (DA) Native Android Application (`apps/mobile`)  
**Auditor:** Senior Mobile Application Architect & Technical Lead  
**Specification Version:** Aligned with SRS v1.3, Database Schema v1.3, Screen Catalog v1.3  
**Date:** October 2026  

---

## 1. Executive Summary & Project Context

The **Autonomous Agricultural Intelligence & Extension System** is an offline-first, voice-operable agricultural decision-support platform designed for Ethiopian smallholder farmers and government Development Agents (DAs) in city agriculture jurisdictions (e.g., Adama, Asella). The overarching solution comprises:
1. **City Agriculture Administration Web Portal** (Next.js desktop/tablet application for City Agricultural Officers and System Administrators).
2. **Farmer & DA Progressive Web App (PWA)** (Next.js App Router mobile-first web interface).
3. **Farmer & DA Native Android Mobile Application** (`apps/mobile`: React Native Android application for smallholder farmers and DAs).
4. **Shared Backend & Data Layer** (Hono.js REST API, PostgreSQL 15+ with PostGIS, 42-table schema, Better Auth identity core, BullMQ background queues, Redis rate limiters, Google Gemini AI multimodal vision and audio services).

This audit focuses specifically on **`apps/mobile`**, examining its current initialization state, file inventory, architectural compliance, security boundaries, and feature readiness against the authoritative specifications.

---

## 2. Mobile Scope & Strict User Role Boundaries

### 2.1 Role Matrix & Admission Guard (Requirement MOB-3)
Per SRS Section 1.2, SRS Part C (3.17, MOB-3), and Frontend Screen Catalog Section Platform & Role Rules:
* **In-Scope Mobile Roles:** 
  * `farmer`: Smallholder farmers (frequently non-literate or semi-literate) operating low-specification Android devices (2 GB RAM, 16 GB storage) with intermittent 2G/3G connectivity.
  * `da` (Development Agent): Extension agents managing 30–50 farmers offline on a single shared device, performing plot registrations, input logs, and task inspections.
* **Strictly Prohibited Mobile Roles:**
  * `officer` (City Agriculture Officer)
  * `system_admin` (System Administrator)
* **Architectural Inconsistency in Existing Code:**
  In `apps/mobile/src/app/(tabs)/index.tsx` (lines 70–82), the existing implementation includes badges and state rendering for `officer` ("Agricultural Officer", purple badge) and `system_admin` ("System Admin", red badge). This violates requirement **MOB-3**:
  > *"The Android app admits only the roles `farmer` and `da`. Officer and System Admin accounts are web-portal only. If an Officer or System Admin submits correct credentials in the Android app, the API returns `403 client_not_permitted`, creates no session and no device row... no Officer or Admin screen is included in the Android bundle."*

---

## 3. Technology Stack Alignment & Discrepancies

A comprehensive comparison between the approved technology stack specification and the existing repository implementation reveals major structural divergences:

| Architectural Component | Approved Specification (Tech Stack & SRS v1.3) | Existing `apps/mobile` Implementation | Status / Verdict |
| :--- | :--- | :--- | :--- |
| **Framework Base** | React Native (Android-first, optimized for API 26+) | Expo SDK 57 (`"expo": "~57.0.28"`, `"react-native": "0.86.3"`) | **Divergence:** Expo managed starter template |
| **Navigation & Routing** | **React Navigation** (Native Stack + Bottom Tabs, persistent headers, dual-mode touch/voice) | **Expo Router** (`expo-router`: file-based routing in `src/app/`) | **Incompatible:** Must replace with React Navigation per Tech Stack Specification |
| **Local Database Engine** | **WatermelonDB** (`@nozbe/watermelondb`) SQLite adapter | **None.** No local SQLite database or ORM is installed or configured. | **Missing Foundation:** Release-blocking gap for offline-first operation (SYNC-1, MOB-DATA-1) |
| **Database Encryption** | **SQLCipher** (`react-native-sqlcipher-storage`, AES-256) | **None.** | **Missing Foundation:** Violates AGENT-8 and MOB-AUTH-3 |
| **Secure Key & Credential Storage** | **React Native Keychain** (`react-native-keychain`) Android Keystore | `expo-secure-store` with Web fallback (`localStorage`) | **Refactor/Replace:** Inadequate for hardware-backed Keystore management on shared devices |
| **Styling & Design Tokens** | **NativeWind** (Tailwind CSS for React Native) + Accessible Tokens | `global.css` with CSS variables + manual `StyleSheet` objects in components | **Refactor:** Inconsistent utility styling; no NativeWind compiler configured |
| **Iconography** | **Lucide React Native** (`lucide-react-native`) vector icons | `expo-symbols` (iOS SF Symbols wrapper) + PNG icons | **Replace:** SF Symbols do not render natively on Android; requires Lucide React Native |
| **Camera & Image Compression** | `react-native-vision-camera` + `@bam.tech/react-native-image-resizer` (<= 400 KB, EXIF stripped) | `expo-image` only. No camera capture or resizing module installed. | **Missing Foundation:** Required for DIAG-1, GRIEV-4, MOB-DEV-1 |
| **Audio Capture & Playback** | `react-native-audio-recorder-player` (Opus/AAC voice notes, streaming Gemini TTS) | None. | **Missing Foundation:** Required for VOICE-1, GRIEV-1, MOB-VOICE-1 |
| **Speech Recognition & TTS** | `@react-native-voice/voice` + Backend Gemini STT/TTS (`stt.ts`, `tts.ts`) | None. | **Missing Foundation:** Required for VOICE-1 to VOICE-6 |
| **Network & Connectivity** | `@react-native-community/netinfo` (auto sync trigger on 2G/3G/Wi-Fi) | None. Polling `/health` via `setInterval` in UI. | **Replace:** Polling drains battery; NetInfo observer required for SYNC-3 |
| **Geospatial & GPS** | Android Fused Location (`@react-native-community/geolocation`, accuracy <= 30m) | None. | **Missing Foundation:** Required for PLOT-5, MOB-DEV-2 |
| **Push Notifications** | `@react-native-firebase/messaging` (FCM) + Android Channels | None. | **Missing Foundation:** Required for MOB-PUSH-1 to MOB-PUSH-5 |
| **Realtime Sockets** | `socket.io-client` (two-way grievance chat thread) | None. | **Missing Foundation:** Required for GRIEV-6 |

---

## 4. File-by-File Audit of Existing Mobile Codebase

Every existing file in `apps/mobile/` was inspected:

### 4.1 Root Configuration Files
* **`apps/mobile/package.json`**:
  * *Content:* Configured with Expo dependencies (`expo`, `expo-router`, `expo-splash-screen`, `@expo/ui`, `expo-symbols`).
  * *Weakness:* Missing all required core native modules: `@nozbe/watermelondb`, `react-native-keychain`, `lucide-react-native`, `react-native-vision-camera`, `react-native-audio-recorder-player`, `@react-native-community/netinfo`, `@react-native-community/geolocation`, `@react-native-firebase/messaging`, `socket.io-client`.
  * *Verdict:* **Refactor / Rebuild.** Update dependencies to match the approved stack.
* **`apps/mobile/app.json`**:
  * *Content:* Basic Expo config with scheme `"agri-intelligence"`, splash screen `#208AEF` (generic blue), orientation portrait.
  * *Weakness:* Missing Android runtime permissions declarations (`RECORD_AUDIO`, `CAMERA`, `ACCESS_FINE_LOCATION`, `POST_NOTIFICATIONS`).
  * *Verdict:* **Refactor.** Update permissions and metadata.
* **`apps/mobile/metro.config.js`**:
  * *Content:* Default monorepo Metro configuration resolving workspace packages.
  * *Verdict:* **Keep.** Valid monorepo asset/module resolver.
* **`apps/mobile/tsconfig.json`**:
  * *Content:* Extends Expo default TypeScript configuration with `@/*` path mapping.
  * *Verdict:* **Keep & Refactor.** Retain path aliases while adding strict null checks.
* **`apps/mobile/README.md` & `apps/mobile/scripts/reset-project.js`**:
  * *Content:* Unedited default template text from `create-expo-app`.
  * *Verdict:* **Remove.** Dead template artifacts.

### 4.2 Application Entry & Routing (`apps/mobile/src/app/`)
* **`src/app/_layout.tsx`**:
  * *Content:* Root layout wrapping `AuthProvider`, `AnimatedSplashOverlay`, and `Stack` with `(tabs)` and `+not-found`.
  * *Verdict:* **Replace.** Replaced by `App.tsx` and React Navigation root container (`AppNavigator.tsx`).
* **`src/app/(tabs)/_layout.tsx`**:
  * *Content:* Expo Router 2-tab definition ("Home" and "Explore") using `SymbolView` (iOS symbols).
  * *Verdict:* **Remove.** Irrelevant to the 21-screen agricultural information architecture.
* **`src/app/(tabs)/index.tsx`**:
  * *Content:* Monolithic 580-line file blending `/health` polling, user profile display with prohibited Officer/Admin roles, mock weather widget, mock extension advisory, and rendering `AuthCard`.
  * *Verdict:* **Replace.** Logic will be decomposed into proper feature screens: `FarmerHomeScreen`, `DaOperationsHubScreen`, and modular widgets.
* **`src/app/(tabs)/explore.tsx`**:
  * *Content:* 286-line file containing an Expo documentation viewer and an API latency ping button.
  * *Verdict:* **Remove.** Non-functional template relic.
* **`src/app/+not-found.tsx`**:
  * *Content:* Standard 404 screen.
  * *Verdict:* **Remove.** Managed natively by React Navigation fallbacks.

### 4.3 Components & UI (`apps/mobile/src/components/`)
* **`src/components/auth/auth-card.tsx`**:
  * *Content:* 757-line combined card for phone/username sign-in, phone sign-up, OTP countdown timer, and password validation.
  * *Strengths:* Implements valid live validation schemas (`PhoneSignInSchema`), OTP resend timer logic (60s countdown), and language selectors (`am`, `om`, `ti`, `en`).
  * *Weaknesses:* Includes username sign-in (violates ADM-8 phone-only requirement), combines multiple distinct screen flows into an unwieldy stateful widget, lacks voice guidance and illiteracy-first accessibility.
  * *Verdict:* **Refactor & Decompose.** Extract reusable form logic into `src/screens/auth/SignInScreen.tsx` and `src/screens/auth/LanguageSelectionScreen.tsx`.
* **`src/components/animated-icon.tsx`, `animated-icon.web.tsx`, `animated-icon.module.css`**:
  * *Content:* Reanimated keyframe animations for the Expo logo (`expo-logo.png`, `logo-glow.png`).
  * *Verdict:* **Remove.** Unrelated Expo branding assets.
* **`src/components/hint-row.tsx`, `web-badge.tsx`, `external-link.tsx`, `ui/collapsible.tsx`**:
  * *Content:* Template components referencing `app/index.tsx` and Expo package versions.
  * *Verdict:* **Remove.** Unused starter kit files.
* **`src/components/themed-text.tsx`, `themed-view.tsx`**:
  * *Content:* Basic theme wrappers.
  * *Verdict:* **Refactor / Replace.** Replace with dedicated design system typography and NativeWind primitives.

### 4.4 Services, Providers, and Storage (`apps/mobile/src/`)
* **`src/services/auth.ts`**:
  * *Content:* 276-line API client implementing `signInWithPhone`, `signInWithUsername`, `requestOtp`, `verifyOtpAndSignUp`, `requestPasswordReset`, `resetPassword`, `getSession`, and `signOut`.
  * *Strengths:* Correctly normalizes phone numbers via `PhoneUtils.normalize`, handles JSON parsing and basic HTTP errors.
  * *Weaknesses:*
    * Contains `signInWithUsername` and username update logic (contradicts ADM-8).
    * `API_ROUTES` in `config.ts` points to non-standard endpoints (`/api/auth/sign-in/phone-number`, `/api/auth/phone-number/send-otp`) rather than Database Schema v1.3 OpenAPI endpoints (`/api/auth/sign-in/phone`, `/api/auth/sign-up/phone`, `/api/auth/phone/verify-otp`).
    * Lacks client identification headers (`X-Client-Type: android`, `X-App-Version`, `X-Device-Id`).
    * Lacks Bearer token injection for native mobile session transport (MOB-AUTH-2).
  * *Verdict:* **Refactor.** Re-align endpoint paths and headers with OpenAPI v1.3; remove username methods.
* **`src/providers/auth-provider.tsx`**:
  * *Content:* React Context managing session state, user hydration on launch, and authentication methods.
  * *Strengths:* Implements token persistence and hydration on app launch.
  * *Weaknesses:* Lacks multi-DA profile separation (AGENT-8, MOB-AUTH-3), lacks device registration after login (MOB-AUTH-4), lacks session expiry handling for 30-day sliding window.
  * *Verdict:* **Refactor.** Move into `src/features/auth/AuthContext.tsx` with Android Keystore binding.
* **`src/lib/storage.ts`**:
  * *Content:* Wrapper over `expo-secure-store` with web `localStorage` and in-memory fallbacks.
  * *Weaknesses:* Insecure fallback to memory/localStorage; does not support hardware-backed Android Keystore keys for SQLCipher encryption keys.
  * *Verdict:* **Replace.** Implement `src/services/storage/secure-storage.ts` using `react-native-keychain`.
* **`src/lib/error-mapper.ts`**:
  * *Content:* 70-line error normalizer translating server error strings (e.g., "invalid credentials", "locked", "otp expired") into user-friendly messages.
  * *Strengths:* Very solid localized mapping logic for common auth errors.
  * *Verdict:* **Keep & Refactor.** Move to `src/utils/error-mapper.ts` and expand to support multi-language error keys (`am`, `om`, `ti`, `en`).
* **`src/constants/theme.ts` & `src/global.css`**:
  * *Content:* Color definitions (`light` / `dark`), spacing tokens, font stacks.
  * *Strengths:* Colors (`primary: #16A34A`, `accent: #C78326`, `background: #FAF8F4`) match agricultural identity.
  * *Verdict:* **Keep & Refactor.** Move to `src/theme/tokens.ts` and integrate with NativeWind.

---

## 5. Architectural Strengths vs. Weaknesses

### 5.1 Current Strengths
1. **Monorepo Integration:** `apps/mobile` correctly consumes `@repo/shared` workspace schemas (`PhoneSignInSchema`, `PhoneOtpVerifySchema`, `PhoneUtils`).
2. **Robust Validation:** Keystroke and submission validation using Zod prevents malformed inputs before reaching the network.
3. **Thoughtful Error Normalization:** `error-mapper.ts` provides a strong starting point for converting API status codes into actionable user messages.
4. **Agri-Brand Visual Foundation:** `constants/theme.ts` establishes an authentic green-earth aesthetic aligned with Ethiopian agricultural contexts.

### 5.2 Critical Architectural Weaknesses & Gaps
1. **No Offline Data Persistence (Major):** Zero implementation of WatermelonDB or SQLite. The app currently fails all offline functional requirements (SYNC-1 to SYNC-10, MOB-DATA-1 to MOB-DATA-7).
2. **No Voice / Intent Routing Engine (Major):** Completely absent voice processing pipeline. The core voice-first navigation (VOICE-1 to VOICE-12, MOB-VOICE-1) is nonexistent.
3. **Routing Framework Mismatch:** Uses Expo Router file-based tabs instead of a structured React Navigation stack that accommodates the 21 standalone screens, DA farmer switcher, and persistent floating AI Assistant.
4. **Spec Violation in Auth Methods:** Exposes username login and web administrator roles on mobile, violating ADM-8 and MOB-3.
5. **No Media Capture or Compression:** No camera or audio recording capabilities exist for pest diagnostics (DIAG-1) or voice grievance submissions (GRIEV-1).

---

## 6. Unresolved Questions & External Dependencies

1. **Pending Backend API Contract:** While Database Schema v1.3 defines the 42 tables and standard endpoints, exact request/response schemas for complex aggregations (e.g., `POST /v1/sync/push` response format, `POST /v1/diagnoses` payload) require mock adapters until backend implementation finishes.
2. **Audio Streaming Format:** Confirm whether Gemini TTS audio playback from `@/services/tts.ts` will stream raw PCM, WAV, or AAC chunks over HTTP to ensure optimal mobile native player configuration.
3. **FCM Push Notification Credentials:** Firebase project configuration (`google-services.json`) must be provisioned before push notification testing can occur.
