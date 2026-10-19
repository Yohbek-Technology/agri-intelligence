# Backend API Dependency Register & Integration Readiness

**Project:** Autonomous Agricultural Intelligence & Extension System (Ethiopia)  
**Target Client:** Farmer & Extension Agent (DA) Native Android Application (`apps/mobile`)  
**Status:** Integration Boundary Definition (Backend Contract Pending Finalization)  
**Date:** October 2026  

---

## 1. Integration Boundary & Contract Abstraction Strategy

The mobile application is designed to operate completely independently of backend implementation progress. Because the backend team is finalizing the API contracts, the mobile application enforces strict repository patterns, local SQLite (WatermelonDB) interfaces, and mock data sources.

### 1.1 Architectural Boundary Rules
1. **No Direct Remote Calls in UI:** Screens and state hooks never invoke `fetch` or Axios directly. They interact exclusively with local repository interfaces.
2. **Offline-First Buffering:** All mutating operations (e.g., plot registration, fertilizer logs, sale records) commit directly to the local WatermelonDB database and queue a `SyncMutation` record.
3. **Mock Adapter Separation:** Mock data sources and synthetic network delay simulators are strictly quarantined in `src/services/api/mock/` and will be hot-swapped for live HTTP clients once the backend contract is published.
4. **No Fabricated Endpoints:** Unconfirmed endpoint URLs, headers, or query parameters are never hardcoded into production code.

---

## 2. API Dependency Register

The following register documents every mobile feature, its required remote operations, corresponding database entities, details pending backend confirmation, and current development feasibility:

| Feature / Domain | Required Operation | Relevant Data & Entities | Contract Details Needed (Pending Confirmation) | Work Possible Now? |
| :--- | :--- | :--- | :--- | :--- |
| **Authentication: Phone Sign-In** | Authenticate user via phone number and password | `users`, `accounts`, `sessions` | Bearer token format in response header vs body; sliding expiry refresh mechanics. | **Yes** (Mock Keystore session & UI flows) |
| **Authentication: Phone Sign-Up & OTP** | Request 6-digit SMS OTP & verify registration | `users`, `accounts`, `verifications` | Exact SMS gateway retry cooldown; throttling response error schema on rate limit. | **Yes** (Zod validation, 60s countdown, mock OTP verification) |
| **Authentication: Password Reset** | Send recovery OTP & submit new password | `users`, `accounts`, `verifications` | Recovery OTP payload format; multi-device session revocation confirmation. | **Yes** (Full UI, validation, and local state management) |
| **Farmer Profile & Claim** | Submit profile details & claim DA-created record | `farmers`, `kebeles`, `city_offices` | Exact merge conflict behavior when linking phone-verified account to `farmers.user_id`. | **Yes** (Local profile creation & WatermelonDB sync queue) |
| **Plot Registration & Soil Profiling** | Register plot with GPS centroid, soil class, & unit | `plots`, `kebeles`, `city_offices` | Spatial containment validation endpoint format (`/v1/geo/resolve` response payload). | **Yes** (Offline GPS capture, local unit normalizer, mock elevation lookup) |
| **Crop Lifecycle: Milestones & Sowing** | Start cycle & record seed variety and rate | `crop_cycles`, `sowing_logs`, `crops`, `crop_varieties` | Plausibility warning threshold payload format when seed rate is outside standard band. | **Yes** (Local cycle creation, sowing validation, offline queuing) |
| **Crop Lifecycle: Split Fertilizer Logging** | Log basal, 1st Urea, and 2nd Urea or record skip | `fertilizer_logs`, `crop_cycles` | Exact server response payload for trigger-computed `days_after_sowing` and `rate_kg_per_ha`. | **Yes** (Full dynamic form, skip dialogs, on-device validation rules) |
| **Crop Lifecycle: Harvest & Cash Ledger** | Record harvested volume and input/labor costs | `harvest_records`, `ledger_entries`, `crops` | Plausibility confirmation challenge/response protocol for yields > 80 qt/ha. | **Yes** (Local yield calculation, plausibility confirmation modal, ledger) |
| **AI Yield Gap Root-Cause Diagnostics** | Fetch peer benchmark comparison & root causes | `yield_gap_analyses`, `crop_cycles` | Streaming audio protocol for `narration_text` (chunked HTTP vs. pre-signed audio URL). | **Yes** (UI comparison cards, mock structured factor results, TTS player) |
| **Weather & Farm-or-Not Indicators** | Fetch 7-day forecast & activity advisories | `weather_forecasts`, `weather_alerts` | Forecast JSON schema structure per 0.1° grid cell; alert threshold flags. | **Yes** (Cached forecast display, Farm-or-Not indicators, alert banners) |
| **Multimodal Vision Diagnostics** | Upload leaf photos & request Gemini diagnosis | `diagnosis_cases`, `media_files`, `registered_chemicals` | Chunked media upload handshake (`/v1/media/uploads` chunk size and resume token format). | **Yes** (Camera capture, client compression <= 400KB, mock diagnosis card) |
| **Registered Chemical Directory** | Search and verify genuine inputs | `registered_chemicals`, `pest_catalog` | Search query parameter conventions (`q`, `crop_id`, `category`); pagination cursor format. | **Yes** (Offline catalog search, voice query filtering, pack image view) |
| **Grievance Voice Box & Chat** | Submit audio complaint & converse with desk | `grievances`, `grievance_messages`, `media_files` | Audio chunk upload protocol; Socket.io event naming conventions for real-time messages. | **Yes** (Microphone recording, audio player widget, mock chat thread) |
| **City Market Price Board** | Display surveyed prices & log crowdsourced sale | `market_centres`, `market_surveys`, `crowd_transactions` | Stale price threshold response flag; outlier price confirmation payload format. | **Yes** (Price board, revenue calculator, sale logger form, plausibility modal) |
| **Official Announcements Feed** | Fetch broadcast directives & acknowledge emergency | `announcements`, `announcement_deliveries` | Emergency acknowledgement payload schema; signed audio URL vs streaming TTS for voice broadcasts. | **Yes** (Pinned feed, audio playback, full-screen emergency takeover banner) |
| **Post-Harvest Storage Guide** | Illustrated PICS bag moisture & sealing guide | Static / Catalog guide entities | Format of server-side guide content updates. | **Yes** (Fully self-contained offline illustrated & voice-guided screen) |
| **Transactional Delta-Sync** | Transmit client mutation queue & pull delta updates | `sync_mutations`, `sync_changes`, `devices` | Batch mutation response format (`applied` / `duplicate` / `rejected`); conflict error schema. | **Yes** (Client queue engine, payload hashing, local cursor management) |

---

## 3. Mock Data & Isolation Strategy

To ensure continuous development prior to the delivery of the final API contract:

### 3.1 Repository Pattern Implementation
```typescript
// Example: src/services/api/repositories/PlotRepository.ts
export interface PlotRepository {
  getPlotsByFarmer(farmerId: string): Promise<Plot[]>;
  createPlot(input: CreatePlotDTO): Promise<Plot>;
  archivePlot(plotId: string): Promise<void>;
  resolveAgroZone(coords: { lat: number; lng: number }): Promise<AgroZoneResolution>;
}
```

### 3.2 Mock Data Layer Structure
* **`src/services/api/mock/data/`**: JSON fixtures representing sample Ethiopian smallholder plots (Teff, Wheat, Maize on *Koticha* and *Beda* soils in Adama and Asella).
* **`src/services/api/mock/handlers/`**: Synthetic latency handlers simulating 2G/3G network conditions (50 kbps bandwidth, 600ms latency, intermittent failure injection).
* **Mock Provider Switch:** An environment flag (`EXPO_PUBLIC_USE_MOCK_API=true`) allows immediate toggling between mock providers and real Hono API endpoints.
