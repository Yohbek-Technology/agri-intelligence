# Farmer & Extension Agent (DA) Native Mobile Application

Part of the **Autonomous Agricultural Intelligence & Extension System** (Ethiopia).

Targeting smallholder farmers and government Development Agents (DAs) in Ethiopian city agriculture offices (Adama, Asella).

---

## 1. Architectural Highlights

* **Offline-First:** All user-facing reads and writes operate on local SQLite with delta-synchronization.
* **Universal Accessibility:** Voice-first navigation, automated Gemini TTS screen explainers, and illiteracy-first color cards.
* **Strict Role Boundaries:** Mobile client admits **only** `farmer` and `da` roles. Agricultural Officers and System Administrators use the Web Portal.
* **Multi-Language:** First-class support for Amharic (`am`), Afaan Oromoo (`om`), Tigrinya (`ti`), and English (`en`).
* **Authentication:** Unified phone-and-password credential sign-in with 6-digit SMS OTP verification (Better Auth). 30-day sliding session stored in Android Keystore.

---

## 2. Directory Structure

```text
src/
├── config/        # Validated API endpoints & operational thresholds
├── theme/         # HSL agricultural color palette, 48/56dp touch targets
├── database/      # Offline SQLite schema, models & transactional sync queue
├── services/      # Native hardware adapters (Camera, Audio, Fused Location, FCM)
├── context/       # AuthContext (Keystore session), SyncContext, FarmerContext
├── navigation/    # Navigation container & route definitions (21 screens)
├── components/    # Reusable UI (VoiceAssistant, VisualCard, AppHeader)
├── screens/       # 21 Standalone Mobile Screens (Screen Catalog v1.3)
│   ├── auth/      # LanguageSelection, SignIn, ProfileSetup
│   ├── main/      # FarmerHome, DaOperationsHub, UnifiedInbox
│   ├── plots/     # PlotList, RegisterPlot, PlotDetail
│   ├── agronomy/  # CropCycleHub, UniversalLogger, DaTasks
│   ├── ai/        # YieldGap, WeatherForecast, PestDiagnosis, CertifiedInputs
│   └── support/   # GrievanceChat, MarketPrices, Announcements, Storage, Sync
└── utils/         # Calendar converter, unit normalizer, error mapper
```

---

## 3. Getting Started

### Run Typecheck
```bash
pnpm --filter mobile check-types
```

### Start Development Server
```bash
pnpm --filter mobile dev
```
