/**
 * Global Constants for AgrIntel Mobile
 * Source of truth for device limits, quotas, and sync policies.
 */

// NFR-DEV-002: Hard maximum image upload size (resized and compressed before transmission)
export const MAX_IMAGE_UPLOAD_BYTES = 400 * 1024; // Exactly 400 KB (409,600 bytes)
export const MAX_IMAGE_UPLOAD_KB = 400;

// Maximum dimensions for pest & disease leaf captures
export const MAX_IMAGE_WIDTH = 1280;
export const MAX_IMAGE_HEIGHT = 1280;
export const IMAGE_JPEG_QUALITY = 0.75;

// Offline Sync & Queue Limits
export const MAX_SYNC_BATCH_SIZE = 50; // Maximum operations pushed per sync request
export const SYNC_RETRY_INTERVAL_MS = 10000; // 10-second backoff on transient failure
export const MAX_SYNC_RETRY_ATTEMPTS = 5;

// Auth & Session
export const KEYCHAIN_TOKEN_KEY = 'agrintel_auth_token_v1';
export const KEYCHAIN_SQLCIPHER_KEY = 'agrintel_sqlcipher_encryption_key_v1';
export const SESSION_EXPIRY_DAYS = 30;

// Audio Grievance Recording
export const MAX_AUDIO_RECORDING_DURATION_SEC = 180; // 3-minute max grievance recording
export const AUDIO_SAMPLE_RATE = 16000; // 16kHz for Whisper / STT processing

// UI Accessibility
export const MIN_TOUCH_TARGET_DP = 56; // 56dp minimum touch target

