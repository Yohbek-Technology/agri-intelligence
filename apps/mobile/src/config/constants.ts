/**
 * Mobile Architectural Constants & Operational Bounds
 * Aligned with SRS v1.3 and Part C Non-Functional Requirements
 */

export const APP_VERSION = '1.0.0';
export const CLIENT_TYPE = 'android';

export const SUPPORTED_LANGUAGES = ['am', 'om', 'ti', 'en'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const TOUCH_TARGETS = {
  min: 48, // Minimum WCAG / Material touch target
  primaryAction: 56, // Primary voice assistant & action buttons
} as const;

export const SYNC_CONFIG = {
  maxBatchRecords: 50,
  maxBatchSizeBytes: 500 * 1024, // 500 KB
  reconnectDebounceMs: 10 * 1000, // 10 seconds after connectivity
  cursorKey: 'agri_sync_last_cursor',
} as const;

export const MEDIA_LIMITS = {
  chunkSizeBytes: 256 * 1024, // 256 KB chunked upload
  maxPhotoSizeBytes: 400 * 1024, // 400 KB compressed limit
  photoMaxDimensionPx: 1280, // Max long edge
  maxDiagnosisPhotos: 4,
  maxGrievancePhotos: 3,
  maxGrievanceAudioSeconds: 180, // 3 minutes
  maxDeskAudioSeconds: 120, // 2 minutes
} as const;

export const VOICE_CONFIG = {
  silenceTimeoutMs: 1200, // 1.2s silence stops recording
  maxUtteranceSeconds: 10,
  minConfidenceThreshold: 0.65, // Below this asks clarifying question
} as const;

export const STORAGE_THRESHOLDS = {
  warningFreeMb: 200, // Warn user about low storage
  blockMediaFreeMb: 50, // Block media capture but keep record logging
  evictMediaAfterDays: 90, // Evict synced media older than 90 days
} as const;

export const SESSION_CONFIG = {
  slidingWindowDays: 30, // 30-day sliding expiry for mobile
  storageKeyToken: 'agri_keystore_session_token',
  storageKeyUser: 'agri_keystore_user_profile',
  storageKeyActiveFarmer: 'agri_da_active_farmer_id',
} as const;
