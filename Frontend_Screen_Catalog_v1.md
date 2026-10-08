# Frontend Screen Catalog & UI Overlay Specification (Version 1)

**Autonomous Agricultural Intelligence & Extension System**

**Totals:** 32 web screens, 21 mobile screens, 53 standalone screens in all. Every modal, popup, dropdown, side drawer, bottom sheet, form step, sub-tab, filter panel, and overlay alert is consolidated into its parent screen and listed in Section 3.

## Platform & Role Rules

- **Mobile (React Native, Android):** Smallholder Farmers and Development Agents (DAs) only. No office management dashboards.
- **Web Portal (Next.js):**
  - Web Admin/Office modules for City Agriculture Office staff (Officer) and System Admins.
  - Web Farmer Interface mirroring farmer operations for browser access.
  - DAs operate on Mobile only. No web screen lists DA as a role.
- **Roles used below:** `Farmer`, `DA`, `Officer`, `Admin`, `Public`.

## Persistent Floating AI Assistant (global overlay, not a screen)

- **Placement:** An AI Assistant button is anchored at the bottom of every screen on web and mobile. On mobile it is the 56 dp persistent voice button. On web it sits bottom-right above the page content and never covers primary action bars.
- **Opens:** A floating overlay popup on web and a bottom sheet on mobile. It accepts voice input (microphone) and text input (keyboard) in Amharic, Afaan Oromoo, Tigrinya, and English.
- **Concierge and navigator:** It parses the spoken or typed request into an intent and then does one of four things.
  - Navigates to a screen ("take me to the market page").
  - Applies an in-screen target ("show teff prices" opens the Market Price Board filtered to Teff).
  - Triggers a screen action ("save", "next field", "take photo", "read this screen").
  - Speaks or shows an answer from cached or live data (weather summary, latest price, grievance status).
- **Behaviour rules:**
  - Below 0.65 intent confidence it asks a clarifying question with at most three options and does not navigate until one is chosen.
  - Destructive or submitting actions (delete, submit grievance, publish announcement) always require a spoken or tapped confirmation.
  - It only offers intents the signed-in role may use. Officers and Admins get navigation, search, and read-only answers on web. Farmers and DAs get the full voice intent catalog.
  - It works offline on mobile for the core command catalog and answers from local data.
  - Pre-sign-in (Landing, Login, Language Picker) it is limited to language change, help, and navigation to sign-in.
  - Peer data is never exposed. Yield comparisons are aggregates only.
- **State persistence:** The panel closes on navigation. Its conversation history survives navigation within the session so the user can continue after being taken to a new page.

---

# Section 1: Complete List of Web Portal Standalone Screens (Next.js)

## Public & Auth

- **Landing Page**
  - **Target Role(s):** Public
  - **Core Functionality & Consolidated Sub-Flows:** Product overview, language switcher, sign-in link, and the app download link. The language switcher is an inline dropdown.

- **Dual-Mode Login Page**
  - **Target Role(s):** Public (becomes Farmer, Officer, or Admin after sign-in)
  - **Core Functionality & Consolidated Sub-Flows:** One page, two modes.
    - Farmers use phone number and SMS OTP.
    - Officers and Admins use email and password, then a mandatory SMS OTP second step.
    - It covers the OTP resend countdown, attempts-left indicator, five-failure 15-minute lockout, throttle messages, and the 30-minute session-expiry notice. The mode switch is an inline selector.

- **Password Reset & Invitation Page**
  - **Target Role(s):** Public (Officer, Admin)
  - **Core Functionality & Consolidated Sub-Flows:** Request a reset, verify the OTP, and set a new password under the password policy (at least 10 characters with complexity). The same page handles the first-login set-password step for invited Officers and Admins. Reset and invite steps are in-page steps, not separate screens.

- **Farmer Profile Setup**
  - **Target Role(s):** Farmer
  - **Core Functionality & Consolidated Sub-Flows:** First-time web onboarding after the first successful OTP. It captures full name, local ID (validated against the office's configured format), city, kebele, preferred language, calendar, area unit, and the clustering and SMS consent choice. It includes a claim-profile merge for a farmer a DA registered without a phone. Steps are shown in one scrolling form.

## Farmer-Facing Web Views

- **Farmer Home / Dashboard**
  - **Target Role(s):** Farmer
  - **Core Functionality & Consolidated Sub-Flows:** Plot summary cards with current crop and growth stage, weather alert banner, latest yield-gap result, grievance status chips, pinned announcements, and quick links. Cards have "Listen" buttons.

- **My Plots**
  - **Target Role(s):** Farmer
  - **Core Functionality & Consolidated Sub-Flows:** Active and archived plot list with the area unit switch (Timad, Kert, Hectare). Hosts the Register Plot drawer (name, area, planned crop, GPS pin on a map, soil class and drainage) and the archive and restore confirmation.

- **Plot Detail**
  - **Target Role(s):** Farmer
  - **Core Functionality & Consolidated Sub-Flows:** Plot profile with the auto-tagged agro-zone (read-only), soil, 1–3 season crop history, the current cycle summary with milestone timeline, cash ledger totals, and diagnosis history. Hosts the edit-plot drawer, the crop-history entry drawer, and the start-cycle dialog.

- **Universal Field Event Logger**
  - **Target Role(s):** Farmer
  - **Core Functionality & Consolidated Sub-Flows:** One page for the active crop cycle. A log-type picker switches the form between sowing, basal fertilizer, 1st Urea, 2nd Urea, plowing, weeding, spraying, irrigation, harvest, and cash ledger entries. It lists existing logs with their correction state. Hosts the skip-reason dialog, the read-back confirmation, the yield plausibility confirmation, and the 14-day correction dialog.

- **Yield Gap Comparison View**
  - **Target Role(s):** Farmer
  - **Core Functionality & Consolidated Sub-Flows:** Plot yield against the peer median and top quartile, the top-three root-cause cards with audio, and one to five next-season recommendations. It handles the widened-cohort label, the not-enough-peers state, and the top-quartile "what worked" state. Hosts the save-as-reminders action. A season selector switches between closed cycles.

- **Weather & Farm-or-Not View**
  - **Target Role(s):** Farmer
  - **Core Functionality & Consolidated Sub-Flows:** Current conditions, 7-day forecast, Go/Wait/No plowing indicator, spray window with rain wash-off warning, harvest window, extreme-weather alert banners, and the weekly audio advisory. A plot switcher replaces per-plot pages.

- **Pest Diagnosis Desk**
  - **Target Role(s):** Farmer
  - **Core Functionality & Consolidated Sub-Flows:** Upload 1–4 photos, see the diagnosis card (registry-filtered treatment with dosage, safety interval, and protective equipment copied from the directory), and browse diagnosis history per plot. It handles the low-confidence "not sure, sent to your DA" state, the 3-year rotation advice panel, and the send-to-DA action.

- **Certified Inputs & Seed Catalog**
  - **Target Role(s):** Farmer
  - **Core Functionality & Consolidated Sub-Flows:** Searchable directory of registered chemicals and certified seed varieties. Each entry shows brand, active ingredient, registration number, permitted crops, and a label image. A zero-result search shows the advisory to report a suspect product through the grievance desk and links to it.

- **Grievance Thread View**
  - **Target Role(s):** Farmer
  - **Core Functionality & Consolidated Sub-Flows:** Grievance list with status chips and the two-way voice and text thread with status history. Hosts the new-grievance composer drawer (category chips, browser voice note up to 3 minutes, up to 3 photos, plot attach) and the confirm-resolution and reopen prompt (7-day window).

- **Market Price Board**
  - **Target Role(s):** Farmer
  - **Core Functionality & Consolidated Sub-Flows:** Surveyed min, max, and average prices with stale labels, 12-week price chart, neighbouring-market comparison, expected revenue calculator, and net result against the cash ledger. Hosts the sale logger drawer and the price plausibility confirmation. Crop and market selectors filter the page.

- **Announcements Feed**
  - **Target Role(s):** Farmer
  - **Core Functionality & Consolidated Sub-Flows:** Official announcements with emergency items pinned, unread badges, audio playback, and acknowledge for emergency items. The detail view is a drawer.

- **Post-Harvest Storage Guide**
  - **Target Role(s):** Farmer
  - **Core Functionality & Consolidated Sub-Flows:** Illustrated, narrated guidance on grain moisture testing without a meter and hermetic (PICS) bag filling, sealing, and storage.

- **Unified Inbox & Alerts Center**
  - **Target Role(s):** Farmer
  - **Core Functionality & Consolidated Sub-Flows:** One feed combining weather alerts, grievance replies and status changes, diagnosis results, outbreak cluster alerts, announcements, and reminders, with unread badges. Filter chips (all, alerts, messages, announcements) are inline. Each item deep-links to its source screen.

- **Profile & Consent Settings**
  - **Target Role(s):** Farmer
  - **Core Functionality & Consolidated Sub-Flows:** Name, local ID, language, calendar (Ethiopian or Gregorian), default area unit, and the clustering and SMS consent toggle. Hosts the consent-revoke and language-change confirmations.

## Administrative & Office Desks

- **Officer Overview Dashboard**
  - **Target Role(s):** Officer
  - **Core Functionality & Consolidated Sub-Flows:** Office summary cards for outbreak threshold alerts, overdue grievances (over 72 hours), crops with no survey in 10 days, demand shortfall highlights, and flagged data-quality items. Cards link to the relevant desk. The outbreak alert has a shortcut into a prefilled quarantine broadcast.

- **Land Registry & Farmer Directory**
  - **Target Role(s):** Officer
  - **Core Functionality & Consolidated Sub-Flows:** Paginated registry of farmers and plots with search and filters (kebele, DA, crop, soil, verified or self-registered). It has the hectare, Timad, and Kert unit switch and CSV and Excel export. Hosts the farmer detail drawer, the field-verify action, farmer-to-DA reassignment, the agro-zone override dialog, the data-quality flag dialog, and the filter panel.

- **Kebele Territory Map & Staff Assignment**
  - **Target Role(s):** Officer
  - **Core Functionality & Consolidated Sub-Flows:** Draw or edit kebele polygons or centroid-and-radius areas, and see plots that match no kebele. It also manages staff: create, deactivate, and reassign DA and Officer accounts, and assign each DA one or two kebeles. Hosts the kebele assignment drawer, the staff drawer, and the deactivate confirmation.

- **Office Settings Manager**
  - **Target Role(s):** Officer
  - **Core Functionality & Consolidated Sub-Flows:** Edit all office parameters on one page, in sections: land-unit conversion factors, agro-zone elevation boundaries, local-ID format, and weather, alert, voice, yield, diagnosis, outbreak, triage, demand, market, and broadcast thresholds. Hosts the change-confirmation and reset-to-default dialogs. Sections are anchors on the page, not sub-tabs.

- **Catalog & Chemical Directory Desk**
  - **Target Role(s):** Officer
  - **Core Functionality & Consolidated Sub-Flows:** Manage crops, varieties, registered chemicals, soil management entries, fertilizer rates, crop rotation rules, and critical weeding windows. Entries carry status (active or retired), effective dates, permitted zones, and registration numbers. Hosts the add and edit drawers for each entry type and the retire confirmation.

- **Seasonal Demand & Depot Inventory Desk**
  - **Target Role(s):** Officer
  - **Core Functionality & Consolidated Sub-Flows:** Season demand for Urea, NPS, and seed by crop and kebele, with a safety margin (0–30%) and hectare overrides. It compares demand to depot stock plus pending deliveries and shows shortfall or surplus. Hosts the depot drawer, the stock movement drawer (receipts, issues, adjustments), the incoming delivery drawer (expected or confirmed), and the snapshot save dialog. A season selector switches seasons.

- **Productivity Analytics & Plot Audit Desk**
  - **Target Role(s):** Officer
  - **Core Functionality & Consolidated Sub-Flows:** City-wide yield statistics (mean, median, quartiles, sample size) by crop, variety, soil, season, kebele, and zone. It shows top and bottom 10% plots, root-cause factor percentages across low-yield plots, kebele-to-kebele comparison, and multi-season trends. Hosts the plot audit drawer (log timeline beside the cohort benchmark and stored AI result), the flag-for-DA-visit task dialog, the data-quality flag and resolve dialogs, the filter panel, and PDF and CSV export.

- **Broadcasting Center**
  - **Target Role(s):** Officer
  - **Core Functionality & Consolidated Sub-Flows:** Announcement list with delivery metrics (delivered, read, acknowledged, failed) and retry of failed SMS. Hosts the composer drawer (type, per-language text and audio, targeting by city, kebele, crop, or zone, recipient count preview, SMS segment cost), the quarantine template dialog (Fall Armyworm, Desert Locust, Yellow Rust with four-language preview), the publish confirmation, and the edit and recall dialogs.

- **Grievance Triage & Outbreak Heatmap Desk**
  - **Target Role(s):** Officer
  - **Core Functionality & Consolidated Sub-Flows:** Filterable ticket queue with overdue highlighting, an audio player (0.75× to 2×), the ticket thread with browser voice recording or text reply, and the pest and disease heatmap by kebele and week. Hosts the assign-DA dialog, the status action dialogs (in progress, resolve, reject with reason), the duplicate merge dialog, the regulatory escalation PDF export, and the filter panel.

- **Market Survey & Moderation Desk**
  - **Target Role(s):** Officer
  - **Core Functionality & Consolidated Sub-Flows:** Weekly price survey entry for multiple crops per market centre, CSV import, draft or verified status, and survey history by crop, market, and week. It includes the moderation queue for farmer-reported sales with outlier pre-flagging. Hosts the survey entry drawer, the CSV import error report dialog, the verify and publish confirmation, and the reject-with-reason dialog.

- **Office Audit Trail**
  - **Target Role(s):** Officer
  - **Core Functionality & Consolidated Sub-Flows:** Office-scoped audit log with filters. It shows before and after values for log corrections, farmer verification, exports, and data-quality flags. Hosts the entry detail drawer and the filter panel.

## System Admin Console

- **Office Provisioning Console**
  - **Target Role(s):** Admin
  - **Core Functionality & Consolidated Sub-Flows:** Office list with status and counts, and office creation (name, jurisdiction, default language, first Officer invite). Defaults are seeded automatically. Hosts the provisioning drawer, office edit, activate and deactivate dialogs, and user lookup with account deactivate or reactivate.

- **Health & Quota Monitor**
  - **Target Role(s):** Admin
  - **Core Functionality & Consolidated Sub-Flows:** API error rate, sync lag, AI call counts and failures, SMS delivery rates, 24-hour and 7-day trends, and background job queue state. Hosts the daily AI quota editor dialog and the language pack and prompt template release record with second-admin approval and rollback dialogs.

- **Global Audit Trail**
  - **Target Role(s):** Admin
  - **Core Functionality & Consolidated Sub-Flows:** Cross-office audit log with filters. Hosts the entry detail drawer, the filter panel, and the time-boxed, reason-required support access view of a farmer's data. Every access is logged.

---

# Section 2: Complete List of Mobile Application Standalone Screens (React Native, Android)

## Auth & Onboarding

- **Language Selection Screen**
  - **Target Role(s):** Public
  - **Core Functionality & Consolidated Sub-Flows:** Four large cards (Amharic, Afaan Oromoo, Tigrinya, English) spoken in sequence. The choice applies instantly to UI text, voice output, and speech recognition. It also hosts the welcome and voice tutorial slides as an in-screen carousel.

- **Phone OTP Login Screen**
  - **Target Role(s):** Farmer, DA
  - **Core Functionality & Consolidated Sub-Flows:** Phone entry (+251 mask, number pad), then six-digit OTP entry with voice input. It covers resend countdown, attempts-left, expired and throttled states. The first success creates the account.

- **Profile Setup & Claim Screen**
  - **Target Role(s):** Farmer, DA (a DA also uses it to register a farmer, with phone optional)
  - **Core Functionality & Consolidated Sub-Flows:** Name, local ID, city, kebele, and consent. It includes the claim flow that merges a profile a DA registered without a phone. Hosts the permission primer dialogs (microphone, location, camera, notifications).

## Main Navigation Hubs

- **Farmer Home Dashboard**
  - **Target Role(s):** Farmer
  - **Core Functionality & Consolidated Sub-Flows:** Plot cards, weather alert banner, yield result shortcut, grievance status, and announcement badge. It carries the bottom navigation, the sync chip, and the floating AI Assistant.

- **DA Multi-Farmer Operations Hub**
  - **Target Role(s):** DA
  - **Core Functionality & Consolidated Sub-Flows:** Assigned farmer list with search by name or voice, a persistent active-farmer header, per-farmer completeness dashboard, field-verify action, and assigned grievances and outbreak alerts. Hosts the farmer switcher sheet, the bulk Urea logging sheet (up to 20 farmers), and the sign-out lock dialog.

- **Unified Inbox & Alerts Screen**
  - **Target Role(s):** Farmer, DA
  - **Core Functionality & Consolidated Sub-Flows:** One feed for weather alerts, grievance replies and status changes, diagnosis results, outbreak cluster alerts, announcements, and reminders, with unread badges. It works offline from cached items. Each item deep-links to its source screen.

## Farm & Plot Management

- **Plot List Screen**
  - **Target Role(s):** Farmer, DA
  - **Core Functionality & Consolidated Sub-Flows:** Active and archived plots with area in the chosen unit, current crop, and growth stage. Each card reads aloud as one summary. Hosts the archive and restore confirmation.

- **Register Plot Screen**
  - **Target Role(s):** Farmer, DA
  - **Core Functionality & Consolidated Sub-Flows:** Plot name, area and unit, planned crop, GPS centroid capture (works offline, jurisdiction check), and soil class with drainage. The agro-zone is auto-tagged and read-only. Hosts the soil picker sheet, the low-GPS-accuracy warning, and the outside-jurisdiction block message.

- **Plot Detail Screen**
  - **Target Role(s):** Farmer, DA
  - **Core Functionality & Consolidated Sub-Flows:** Plot profile, soil, zone, 1–3 season history, edit and archive, diagnosis history, and links to the cycle hub, yield result, and weather. Hosts the crop-history entry sheet, the sensitive-edit warning, and the DA zone-override dialog.

## Agronomic Operations

- **Crop Cycle Hub**
  - **Target Role(s):** Farmer, DA
  - **Core Functionality & Consolidated Sub-Flows:** Start a cycle (crop and variety from the catalog), milestone timeline with next-step prompt, cash ledger totals, and harvest entry point. Hosts the start-cycle dialog and the milestone correction dialog (DA).

- **Universal Field Event Logging Screen**
  - **Target Role(s):** Farmer, DA
  - **Core Functionality & Consolidated Sub-Flows:** One dynamic screen driven by a log-type picker for sowing, basal, 1st and 2nd Urea, plowing, weeding, spraying, irrigation, harvest, and ledger entries. It supports voice dictation. Hosts the skip-reason dialog, the read-back prompt, the yield plausibility dialog, and the correction dialog.

- **DA Tasks & Field Visits Screen**
  - **Target Role(s):** DA
  - **Core Functionality & Consolidated Sub-Flows:** Tasks the Officer or the system assigned to the DA: flagged plot visits with checklist, low-confidence diagnosis reviews with photos, and assigned grievances. Hosts the task detail sheet and the mark-complete confirmation.

## AI & Decision Support

- **Yield Gap Root-Cause Diagnostic Screen**
  - **Target Role(s):** Farmer, DA
  - **Core Functionality & Consolidated Sub-Flows:** Plot yield against peer median and top quartile, three severity-coded cause cards with play buttons, and next-season recommendations. It works offline once generated. Hosts the save-as-reminders confirmation and the widened-cohort and not-enough-peers states.

- **7-Day Weather & Spray/Plow Forecast Screen**
  - **Target Role(s):** Farmer, DA
  - **Core Functionality & Consolidated Sub-Flows:** Current conditions, seven daily cards, Go/Wait/No plowing indicator, spray window with wash-off warning, harvest window, alert banners, and the 60-second audio summary. It shows a stale-data label when cached. A plot switcher dropdown selects the plot.

- **Pest Diagnosis & Treatment Screen**
  - **Target Role(s):** Farmer, DA
  - **Core Functionality & Consolidated Sub-Flows:** Framing-guided camera capture (1–4 photos), queued offline submission, result card with registry-filtered treatment, and history. It includes the 3-year rotation advice and the "not sure, sent to DA" state. Hosts the photo source sheet and the send-to-DA confirmation.

- **Certified Inputs Directory Screen**
  - **Target Role(s):** Farmer, DA
  - **Core Functionality & Consolidated Sub-Flows:** Offline searchable directory of registered chemicals and certified seed, with voice search. A not-found result shows the advisory and a link to report a suspect product. Entry detail is a sheet.

## Support, Trade & Offline

- **Grievance Voice Box & Threaded Chat Screen**
  - **Target Role(s):** Farmer, DA
  - **Core Functionality & Consolidated Sub-Flows:** Record a voice grievance (up to 3 minutes), choose a category chip, attach up to 3 photos, and submit. It then shows the status tracker and the two-way voice and text thread. Hosts the submit confirmation, the resolve and reopen prompt, and the waiting-to-send state.

- **Market Price Board & Sale Logger Screen**
  - **Target Role(s):** Farmer, DA
  - **Core Functionality & Consolidated Sub-Flows:** Surveyed prices with stale labels, 12-week chart with spoken trend, neighbouring-market comparison, expected revenue calculator, and net result against the ledger. Hosts the sale logger sheet with voice entry and the price plausibility dialog.

- **Announcements Feed Screen**
  - **Target Role(s):** Farmer, DA
  - **Core Functionality & Consolidated Sub-Flows:** Offline-cached announcements with emergency items pinned, unread badges, audio playback, and emergency acknowledgement. Detail is a sheet.

- **Post-Harvest Storage Guide Screen**
  - **Target Role(s):** Farmer, DA
  - **Core Functionality & Consolidated Sub-Flows:** Offline, voice-narrated, illustrated steps for grain moisture testing and PICS bag storage. Reachable from the harvest flow and the home menu.

- **Sync Status & Device Settings Screen**
  - **Target Role(s):** Farmer, DA
  - **Core Functionality & Consolidated Sub-Flows:** Last sync time, pending record count (per farmer for a DA), failed items with plain-language reasons and retry, and data-saver mode. Settings cover language, calendar, area unit, auto-read, clustering and SMS consent, and secure sign-out. Hosts the consent-revoke, local-database restore, and sign-out dialogs and the failed-record detail sheet.

---

# Section 3: Comprehensive Overlay, Modal & Component Inventory

Platform tags: **[W]** web, **[M]** mobile.

## 3.1 Modals & Dialog Windows

### Data-entry safeguards (Farmer and DA)
- **Skip-reason selector** (unavailable, unaffordable, forgot, other) records a fertilizer application as "not applied". Hosts: Universal Field Event Logger [W], Universal Field Event Logging Screen [M].
- **Read-back confirmation** lists every field and requires a confirm before saving. Hosts: Field Event Logger [W], Field Event Logging Screen [M], Register Plot [M], Sale Logger [W, M], Grievance composer [W, M].
- **Yield ceiling plausibility confirmation** appears when harvest volume exceeds the per-crop ceiling (default 80 quintals per hectare equivalent). Hosts: Field Event Logger [W], Field Event Logging Screen [M].
- **Sale price plausibility confirmation** appears when the price is outside the band (default ±50% of the latest survey average). Hosts: Market Price Board [W], Market Price Board & Sale Logger Screen [M].
- **Log correction dialog** captures the reason. Authors can correct within 14 days, and later corrections are for the DA or Officer. Hosts: Field Event Logger [W], Field Event Logging Screen [M].
- **Milestone correction dialog** (DA only, reason required, audit-logged). Hosts: Crop Cycle Hub [M].
- **Start-cycle dialog** (crop and variety from the catalog, blocked if soil is unset or a cycle is active). Hosts: Plot Detail [W], Crop Cycle Hub [M].
- **Archive and restore plot confirmation.** Hosts: My Plots [W], Plot List Screen [M].
- **Sensitive-edit warning** shown when changing area, centroid, or soil class, which are audit-logged and flagged to the DA once a cycle has started. Hosts: Plot Detail [W, M].
- **Outside-jurisdiction block and low-GPS-accuracy warning.** Hosts: Register Plot [M], Register Plot drawer [W].
- **DA agro-zone override dialog** (reason required). Hosts: Plot Detail [M], Land Registry & Farmer Directory [W, Officer].
- **Grievance submit confirmation.** Hosts: Grievance Thread View [W], Grievance Voice Box Screen [M].
- **Confirm resolution or reopen prompt** (within 7 days of resolution). Hosts: Grievance Thread View [W], Grievance Voice Box Screen [M].
- **Save-as-reminders confirmation.** Hosts: Yield Gap Comparison View [W], Yield Gap Screen [M].
- **Send-to-DA confirmation.** Hosts: Pest Diagnosis Desk [W], Pest Diagnosis Screen [M].
- **Consent revoke confirmation** (excludes future cases from outbreak clustering). Hosts: Profile & Consent Settings [W], Sync Status & Device Settings [M].
- **Permission primer dialogs** (microphone, location, camera, notifications), each skippable, spoken before the system prompt. Hosts: Profile Setup & Claim Screen [M].
- **Claim-profile merge confirmation.** Hosts: Farmer Profile Setup [W], Profile Setup & Claim Screen [M].
- **Secure sign-out and local-database restore dialogs.** Sign-out locks the database and keeps the unsynced queue. Restore warns about any unsynced items lost. Hosts: Sync Status & Device Settings [M], DA Hub [M].
- **Mark-task-complete confirmation.** Hosts: DA Tasks & Field Visits [M].

### Officer and Admin workflows
- **Change password dialog** (current password, new password under policy). Hosts: global web account menu on every authenticated Officer and Admin page [W].
- **Session-expiry warning** after 30 minutes of inactivity with a stay-signed-in action. Hosts: every authenticated web page [W].
- **Farmer field-verify confirmation** (audit-logged). Hosts: Land Registry & Farmer Directory [W].
- **Data-quality flag and resolve dialogs** (a flagged cycle is excluded from benchmarks until resolved). Hosts: Land Registry & Farmer Directory, Productivity Analytics & Plot Audit Desk [W].
- **Flag-for-DA-visit task creation dialog** (reason and checklist, appears on the DA's device after sync). Hosts: Productivity Analytics & Plot Audit Desk [W].
- **Export confirmation** (audit-logged). Hosts: Land Registry & Farmer Directory, Productivity Analytics & Plot Audit Desk, Grievance Triage Desk [W].
- **Staff create, deactivate, and reassign confirmations** (deactivation revokes sessions within 60 seconds). Hosts: Kebele Territory Map & Staff Assignment [W].
- **Office settings change confirmation and reset-to-default.** Hosts: Office Settings Manager [W].
- **Catalog retire confirmation** (retired chemicals leave the diagnosis filter). Hosts: Catalog & Chemical Directory Desk [W].
- **Demand snapshot save dialog and override-reason dialog.** Hosts: Seasonal Demand & Depot Inventory Desk [W].
- **Publish announcement confirmation** with recipient count. Hosts: Broadcasting Center [W].
- **Edit and recall announcement dialogs**, and **bulk SMS retry confirmation.** Hosts: Broadcasting Center [W].
- **Quarantine template dialog** with variables and a four-language preview. Hosts: Broadcasting Center [W].
- **Assign ticket dialog** (choose DA). Hosts: Grievance Triage & Outbreak Heatmap Desk [W].
- **Status action dialogs** (in progress, resolve, reject with reason), **duplicate merge dialog**, and **regulatory escalation export dialog.** Hosts: Grievance Triage & Outbreak Heatmap Desk [W].
- **Survey verify and publish confirmation**, **reject-with-reason dialog**, and **CSV import error report.** Hosts: Market Survey & Moderation Desk [W].
- **Office activate and deactivate dialogs, user deactivate and reactivate dialogs.** Hosts: Office Provisioning Console [W].
- **AI quota editor dialog**, and **prompt template approve and rollback dialogs.** Hosts: Health & Quota Monitor [W].
- **Support access reason dialog** (time-boxed, every access logged). Hosts: Global Audit Trail [W].

## 3.2 Bottom Sheets & Side Drawers

### Mobile bottom sheets
- **Farmer switcher sheet** (search by name or voice, active-farmer header updates on selection). Hosts: DA Multi-Farmer Operations Hub [M], opened from the persistent header on every DA screen.
- **DA bulk Urea logging sheet** (up to 20 farmers, per-farmer quantity, per-row validation, review before save). Hosts: DA Multi-Farmer Operations Hub [M].
- **Soil picker sheet** (icon, photo example, spoken description per soil class and drainage). Hosts: Register Plot Screen [M].
- **Crop-history entry sheet** (season year and crop, or "new land"). Hosts: Plot Detail Screen [M].
- **Task detail sheet** (checklist, photos, reason). Hosts: DA Tasks & Field Visits Screen [M].
- **Sale logger sheet** and **revenue calculator sheet.** Hosts: Market Price Board & Sale Logger Screen [M].
- **Photo source sheet** (camera or gallery, up to 4 photos for diagnosis and 3 for grievances). Hosts: Pest Diagnosis Screen, Grievance Voice Box Screen [M].
- **Directory entry detail sheet.** Hosts: Certified Inputs Directory Screen [M].
- **Announcement detail sheet.** Hosts: Announcements Feed Screen [M].
- **Failed-record detail sheet** (plain-language reason, retry). Hosts: Sync Status & Device Settings Screen [M].
- **Inbox item preview sheet.** Hosts: Unified Inbox & Alerts Screen [M].
- **AI Assistant bottom sheet.** See 3.3.

### Web side drawers
- **Register Plot drawer** (name, area and unit, planned crop, map pin, soil and drainage). Hosts: My Plots [W].
- **Edit plot drawer** and **crop-history entry drawer.** Hosts: Plot Detail [W].
- **New grievance composer drawer.** Hosts: Grievance Thread View [W].
- **Sale logger drawer.** Hosts: Market Price Board [W].
- **Announcement detail drawer.** Hosts: Announcements Feed [W].
- **Farmer detail drawer** (profile, plots, assigned DA, verification state). Hosts: Land Registry & Farmer Directory [W].
- **Kebele assignment drawer** (kebele boundary, DA assignment of one or two kebeles, farmer-to-DA reassignment) and **staff drawer.** Hosts: Kebele Territory Map & Staff Assignment [W].
- **Catalog entry drawers** (crop, variety, chemical, soil management, fertilizer rates, rotation rules, weeding windows). Hosts: Catalog & Chemical Directory Desk [W].
- **Depot drawer**, **stock movement drawer** (receipts, issues, adjustments), and **incoming delivery management drawer** (expected or confirmed, expected date). Hosts: Seasonal Demand & Depot Inventory Desk [W].
- **Plot audit drawer** (log timeline beside cohort benchmark and stored AI yield-gap result). Hosts: Productivity Analytics & Plot Audit Desk [W].
- **Announcement composer drawer** and **delivery metrics drawer.** Hosts: Broadcasting Center [W].
- **Survey entry drawer** (multi-crop rows for a market centre) and **moderation detail drawer.** Hosts: Market Survey & Moderation Desk [W].
- **Audit entry detail drawer.** Hosts: Office Audit Trail, Global Audit Trail [W].
- **Office provisioning drawer.** Hosts: Office Provisioning Console [W].
- **Filter panels** (side drawers). Hosts: Land Registry & Farmer Directory, Productivity Analytics & Plot Audit Desk, Grievance Triage & Outbreak Heatmap Desk, Market Survey & Moderation Desk, Office Audit Trail, Global Audit Trail [W].

## 3.3 Popups & Floating Overlays

- **Persistent floating AI Assistant (Voice/Text AI Concierge)**
  - **Web:** a floating popup anchored at the bottom of the page. **Mobile:** a bottom sheet opened from the 56 dp assistant button.
  - It accepts voice and text, shows the transcript and its reply, and can speak the reply.
  - **Cross-screen behaviour:**
    - The button is present on every screen, including pre-sign-in screens with limited intents.
    - It closes when it navigates, then shows the destination with a brief highlight.
    - Conversation history persists within the session.
    - It uses the same intent registry as each screen's declared voice targets and actions, so "scroll down", "save", and "next field" act on the screen beneath it.
    - It never covers the primary action bar. It collapses when the on-screen keyboard is open in a form.
- **Listening overlay:** waveform, chime, and stop control while the microphone captures speech (stops after 1.2 seconds of silence or 10 seconds). Hosts: every screen via the assistant, and dictation fields [W, M].
- **Voice clarification popup:** a spoken question with at most three options when confidence is below 0.65. No navigation happens until one is chosen. Hosts: every screen [W, M].
- **Read-back prompt popup:** the parsed value of a spoken number, date, or price is shown and read aloud for confirm or redo before it is committed. Hosts: all entry screens (Field Event Logger, Sale Logger, Register Plot, OTP entry) [W, M].
- **Emergency announcement takeover alert:** a red full-screen overlay (mobile) or modal banner (web) for emergency directives. It is read aloud, stays pinned until acknowledged, and acknowledgement stops the SMS fallback. Hosts: every farmer and DA screen on app open and on sync [W, M].
- **Extreme weather alert banners** (frost, downpour, dry spell): red, persistent until dismissed, read aloud on app open. Hosts: Farmer Home, Weather screens [W, M].
- **Read-this-screen player:** a floating mini-bar with play, pause, and stop. Hosts: every screen [M], and "Listen" buttons on farmer web pages [W].
- **Sync status chip popover:** last sync time, pending count, and a link to the Sync screen. Hosts: top bar on every mobile screen [M].
- **Offline and stale-data banners**, and **waiting-to-send badges.** Hosts: Weather, Market, Yield, Grievance, Logger [M].
- **Toasts and snackbars:** saved, queued, sent, failed with retry. Hosts: every screen [W, M].
- **Push and in-app notification toasts:** grievance reply, diagnosis ready, outbreak alert. They deep-link into the Unified Inbox item. Hosts: every screen [W, M].
- **Outbreak threshold alert card with quarantine broadcast shortcut.** Hosts: Officer Overview Dashboard, Grievance Triage Desk [W].

## 3.4 Dropdowns & Inline Selectors

- **Plot switcher:** Weather [W, M], Field Event Logger [W], Pest Diagnosis [W, M], Yield Gap [W, M], Grievance composer plot attach [W, M], Sale Logger [W, M].
- **Language toggle:** Landing Page, Login, Farmer Profile Setup, Profile & Consent Settings [W]; Language Selection Screen, Sync Status & Device Settings [M]; Broadcasting Center per-language text tabs-as-selectors [W].
- **Calendar toggle (Ethiopian or Gregorian):** Profile & Consent Settings [W], Sync Status & Device Settings [M], Farmer Profile Setup [W], and date fields in all logging forms.
- **Area unit switch (Timad, Kert, Hectare):** My Plots [W], Plot List [M], Register Plot [W, M], Land Registry & Farmer Directory [W], Profile & Consent Settings [W].
- **Log type picker** (sowing, basal, 1st Urea, 2nd Urea, plowing, weeding, spraying, irrigation, harvest, ledger): Field Event Logger [W], Field Event Logging Screen [M].
- **Form field selectors:** seed source type (certified or recycled), fertilizer type (NPS or NPS-Zinc), growth stage at application, irrigation method, harvest unit (quintal or kg), price unit (quintal or kg), ledger category (input costs, rental, labour, revenue). Hosts: Field Event Logger [W], Field Event Logging Screen [M], Sale Logger [W, M].
- **Soil class and drainage radio cards:** Register Plot drawer [W], Register Plot Screen [M], edit plot drawer [W].
- **Crop and variety selectors:** Start-cycle dialog, Market Price Board, Sale Logger, Productivity Analytics Desk, Seasonal Demand Desk, Catalog Desk, Survey Desk [W, M where applicable].
- **Category chips** (Fertilizer/Seed Shortage, Pest Outbreak, Water Conflict, Adulterated Inputs): grievance composers [W, M]; category filter in Grievance Triage Desk [W].
- **Season selectors:** Yield Gap Comparison View [W], Productivity Analytics Desk, Seasonal Demand Desk, Market Survey Desk [W].
- **Market centre selector:** Market Price Board [W, M], Market Survey & Moderation Desk [W].
- **Kebele, DA, crop, soil, verified-status, and status filters:** Land Registry & Farmer Directory, Grievance Triage Desk, Productivity Analytics Desk, Office Audit Trail [W].
- **Inbox filter chips** (all, alerts, messages, announcements): Unified Inbox & Alerts Center [W], Unified Inbox & Alerts Screen [M].
- **Announcement type and targeting selectors** (city, kebele, crop, zone): Broadcasting Center composer drawer [W].
- **Heatmap filters** (pest, crop, date range) and **audio playback speed selector (0.75× to 2×):** Grievance Triage & Outbreak Heatmap Desk [W].
- **Farmer search and typeahead with voice search:** Land Registry & Farmer Directory [W], farmer switcher sheet [M].
- **Office selector and date range selectors:** Office Provisioning Console, Health & Quota Monitor, Global Audit Trail [W].
