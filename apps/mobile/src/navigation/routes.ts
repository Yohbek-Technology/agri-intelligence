/**
 * Route Name Constants for Mobile Application
 * Exclusively covers in-scope Farmer and DA standalone screens (Screen Catalog v1.3)
 */

export const ROUTES = {
  // Auth & Onboarding
  LANGUAGE_SELECTION: 'LanguageSelection',
  SIGN_IN: 'SignIn',
  PROFILE_SETUP: 'ProfileSetup',

  // Main Navigation Hubs
  FARMER_HOME: 'FarmerHome',
  DA_OPERATIONS_HUB: 'DaOperationsHub',
  UNIFIED_INBOX: 'UnifiedInbox',

  // Farm & Plot Management
  PLOT_LIST: 'PlotList',
  REGISTER_PLOT: 'RegisterPlot',
  PLOT_DETAIL: 'PlotDetail',

  // Agronomic Operations
  CROP_CYCLE_HUB: 'CropCycleHub',
  UNIVERSAL_LOGGER: 'UniversalLogger',
  DA_TASKS: 'DaTasks',

  // AI Diagnostics & Decision Support
  YIELD_GAP: 'YieldGap',
  WEATHER_FORECAST: 'WeatherForecast',
  PEST_DIAGNOSIS: 'PestDiagnosis',
  CERTIFIED_INPUTS: 'CertifiedInputs',

  // Support, Trade & Offline
  GRIEVANCE_CHAT: 'GrievanceChat',
  MARKET_PRICES: 'MarketPrices',
  ANNOUNCEMENTS: 'Announcements',
  STORAGE_GUIDE: 'StorageGuide',
  SYNC_SETTINGS: 'SyncSettings',
} as const;

export type RouteName = (typeof ROUTES)[keyof typeof ROUTES];
