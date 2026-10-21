import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Returns the active API base URL depending on platform & environment.
 * - Environment override: EXPO_PUBLIC_SERVER_URL
 * - Physical device via Expo Go: auto-derives the host computer LAN IP from Constants.expoConfig.hostUri
 * - Android Emulator fallback: 10.0.2.2:5000
 * - Web/Default fallback: localhost:5000
 */
export function getApiBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_SERVER_URL) {
    return process.env.EXPO_PUBLIC_SERVER_URL.replace(/\/$/, '');
  }

  // Auto-detect computer IP when running Expo Go on a physical phone
  const hostUri =
    Constants?.expoConfig?.hostUri ||
    (Constants as any)?.manifest?.debuggerHost ||
    (Constants as any)?.manifest2?.extra?.expoClient?.hostUri;

  if (hostUri) {
    const hostIp = hostUri.split(':')[0];
    if (hostIp && hostIp !== 'localhost' && hostIp !== '127.0.0.1') {
      return `http://${hostIp}:5000`;
    }
  }

  // Android Studio Emulator loopback alias
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000';
  }

  return 'http://localhost:5000';
}


export const API_BASE_URL = getApiBaseUrl();

export const API_ENDPOINTS = {
  health: `${API_BASE_URL}/health`,

  // Better Auth Core (SRS v1.3 / Database Schema v1.3)
  auth: {
    signInPhone: `${API_BASE_URL}/api/auth/sign-in/phone`,
    signUpPhone: `${API_BASE_URL}/api/auth/sign-up/phone`,
    verifyOtp: `${API_BASE_URL}/api/auth/phone/verify-otp`,
    resendOtp: `${API_BASE_URL}/api/auth/phone/resend-otp`,
    acceptInvitation: `${API_BASE_URL}/api/auth/invitations/accept`,
    forgotPassword: `${API_BASE_URL}/api/auth/forgot-password`,
    resetPassword: `${API_BASE_URL}/api/auth/reset-password`,
    getSession: `${API_BASE_URL}/api/auth/session`,
    signOut: `${API_BASE_URL}/api/auth/sign-out`,
  },

  // Farmer & Plot Registry
  farmers: {
    me: `${API_BASE_URL}/api/v1/farmers/me`,
    claim: `${API_BASE_URL}/api/v1/farmers/claim`,
    list: `${API_BASE_URL}/api/v1/farmers`,
    detail: (id: string) => `${API_BASE_URL}/api/v1/farmers/${id}`,
  },
  plots: {
    byFarmer: (farmerId: string) => `${API_BASE_URL}/api/v1/farmers/${farmerId}/plots`,
    detail: (id: string) => `${API_BASE_URL}/api/v1/plots/${id}`,
    archive: (id: string) => `${API_BASE_URL}/api/v1/plots/${id}/archive`,
    restore: (id: string) => `${API_BASE_URL}/api/v1/plots/${id}/restore`,
    cropHistory: (id: string) => `${API_BASE_URL}/api/v1/plots/${id}/crop-history`,
    geoResolve: `${API_BASE_URL}/api/v1/geo/resolve`,
  },

  // Crop Lifecycle & Event Logging
  cycles: {
    byPlot: (plotId: string) => `${API_BASE_URL}/api/v1/plots/${plotId}/cycles`,
    create: (plotId: string) => `${API_BASE_URL}/api/v1/plots/${plotId}/cycles`,
    detail: (id: string) => `${API_BASE_URL}/api/v1/cycles/${id}`,
    advanceStage: (id: string) => `${API_BASE_URL}/api/v1/cycles/${id}/stage`,
    sowing: (id: string) => `${API_BASE_URL}/api/v1/cycles/${id}/sowing`,
    fertilizerSlot: (id: string, slot: string) => `${API_BASE_URL}/api/v1/cycles/${id}/fertilizer-logs/${slot}`,
    bulkFertilizer: `${API_BASE_URL}/api/v1/cycles/fertilizer-logs/bulk`,
    operations: (id: string) => `${API_BASE_URL}/api/v1/cycles/${id}/operations`,
    harvest: (id: string) => `${API_BASE_URL}/api/v1/cycles/${id}/harvest`,
    ledger: (id: string) => `${API_BASE_URL}/api/v1/cycles/${id}/ledger`,
    ledgerSummary: (id: string) => `${API_BASE_URL}/api/v1/cycles/${id}/ledger/summary`,
  },

  // AI Yield Gap & Weather
  yieldGap: {
    byCycle: (cycleId: string) => `${API_BASE_URL}/api/v1/cycles/${cycleId}/yield-gap`,
    audio: (cycleId: string) => `${API_BASE_URL}/api/v1/cycles/${cycleId}/yield-gap/audio`,
  },
  weather: {
    byPlot: (plotId: string) => `${API_BASE_URL}/api/v1/plots/${plotId}/weather`,
    summaryAudio: (plotId: string) => `${API_BASE_URL}/api/v1/plots/${plotId}/weather/summary-audio`,
    alerts: (plotId: string) => `${API_BASE_URL}/api/v1/plots/${plotId}/weather/alerts`,
  },

  // Diagnostics & Catalog
  diagnostics: {
    submit: `${API_BASE_URL}/api/v1/diagnoses`,
    detail: (id: string) => `${API_BASE_URL}/api/v1/diagnoses/${id}`,
    byPlot: (plotId: string) => `${API_BASE_URL}/api/v1/plots/${plotId}/diagnoses`,
    audio: (id: string) => `${API_BASE_URL}/api/v1/diagnoses/${id}/audio`,
    rotationAdvice: `${API_BASE_URL}/api/v1/rotation-advice`,
  },
  catalog: {
    crops: `${API_BASE_URL}/api/v1/catalog/crops`,
    varieties: `${API_BASE_URL}/api/v1/catalog/varieties`,
    chemicals: `${API_BASE_URL}/api/v1/catalog/chemicals`,
    pests: `${API_BASE_URL}/api/v1/catalog/pests`,
  },

  // Grievances, Market, Announcements
  grievances: {
    list: `${API_BASE_URL}/api/v1/grievances`,
    submit: `${API_BASE_URL}/api/v1/grievances`,
    detail: (id: string) => `${API_BASE_URL}/api/v1/grievances/${id}`,
    messages: (id: string) => `${API_BASE_URL}/api/v1/grievances/${id}/messages`,
    reopen: (id: string) => `${API_BASE_URL}/api/v1/grievances/${id}/reopen`,
    confirm: (id: string) => `${API_BASE_URL}/api/v1/grievances/${id}/confirm`,
  },
  market: {
    board: `${API_BASE_URL}/api/v1/market/board`,
    centres: `${API_BASE_URL}/api/v1/market/centres`,
    compare: `${API_BASE_URL}/api/v1/market/compare`,
    history: `${API_BASE_URL}/api/v1/market/history`,
    sales: `${API_BASE_URL}/api/v1/market/sales`,
    mySales: `${API_BASE_URL}/api/v1/market/sales/mine`,
  },
  announcements: {
    feed: `${API_BASE_URL}/api/v1/announcements`,
    read: (id: string) => `${API_BASE_URL}/api/v1/announcements/${id}/read`,
    ack: (id: string) => `${API_BASE_URL}/api/v1/announcements/${id}/ack`,
  },
  inbox: {
    summary: `${API_BASE_URL}/api/v1/inbox/summary`,
    feed: `${API_BASE_URL}/api/v1/inbox`,
  },

  // Offline Delta-Sync & Media Uploads
  sync: {
    bootstrap: `${API_BASE_URL}/api/v1/sync/bootstrap`,
    push: `${API_BASE_URL}/api/v1/sync/push`,
    pull: `${API_BASE_URL}/api/v1/sync/pull`,
    status: `${API_BASE_URL}/api/v1/sync/status`,
    registerDevice: `${API_BASE_URL}/api/v1/devices`,
    updateDevice: (id: string) => `${API_BASE_URL}/api/v1/devices/${id}`,
  },
  media: {
    initUpload: `${API_BASE_URL}/api/v1/media/uploads`,
    uploadChunk: (id: string) => `${API_BASE_URL}/api/v1/media/uploads/${id}`,
    completeUpload: (id: string) => `${API_BASE_URL}/api/v1/media/uploads/${id}/complete`,
    file: (id: string) => `${API_BASE_URL}/api/v1/media/${id}`,
  },
  voice: {
    intents: `${API_BASE_URL}/api/v1/voice/intents`,
    intentFallback: `${API_BASE_URL}/api/v1/voice/intent`,
    transcribe: `${API_BASE_URL}/api/v1/voice/transcribe`,
    tts: `${API_BASE_URL}/api/v1/voice/tts`,
  },
  appVersion: `${API_BASE_URL}/api/v1/app/version`,
} as const;
