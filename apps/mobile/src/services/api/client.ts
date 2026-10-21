import { secureStorage } from '../storage/keychain-storage';
import { SESSION_CONFIG, APP_VERSION, CLIENT_TYPE } from '@/config/constants';
import { mapAuthError } from '@/utils/error-mapper';

export interface ServiceResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
  statusCode?: number;
  details?: Record<string, unknown>;
}

const DEVICE_ID_KEY = 'agri_device_identifier_uuid';
const LANGUAGE_KEY = 'agri_selected_language';

export async function getOrCreateDeviceId(): Promise<string> {
  let deviceId = await secureStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = `android-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    await secureStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

export async function getActiveLanguage(): Promise<string> {
  const lang = await secureStorage.getItem(LANGUAGE_KEY);
  return lang || 'en';
}

export async function setActiveLanguage(lang: string): Promise<void> {
  await secureStorage.setItem(LANGUAGE_KEY, lang);
}


function generateUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Robust HTTP client adhering strictly to the API Surface v1.3 contract.
 * Automatically injects mandatory Android headers, Bearer tokens, Idempotency-Keys, and handles envelopes.
 */
export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<ServiceResult<T>> {
  const token = await secureStorage.getItem(SESSION_CONFIG.storageKeyToken);
  const deviceId = await getOrCreateDeviceId();
  const activeLanguage = await getActiveLanguage();
  const method = (options.method || 'GET').toUpperCase();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Client-Type': CLIENT_TYPE, // strictly 'android'
    'X-App-Version': APP_VERSION,
    'X-Device-Id': deviceId,
    'Accept-Language': activeLanguage,
    ...(options.headers as Record<string, string>),
  };

  // Inject Idempotency-Key on all mutating requests if not provided
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && !headers['Idempotency-Key']) {
    headers['Idempotency-Key'] = generateUuid();
  }

  // Inject Keystore Bearer Token
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const body = await res.json().catch(() => null);

    // Handle HTTP 403 Forbidden with client_not_permitted (MOB-3: Officer/Admin on Android)
    if (res.status === 403 && body?.error?.code === 'client_not_permitted') {
      await secureStorage.removeItem(SESSION_CONFIG.storageKeyToken);
      await secureStorage.removeItem(SESSION_CONFIG.storageKeyUser);
      return {
        success: false,
        statusCode: 403,
        errorCode: 'client_not_permitted',
        error: 'Agricultural Officers and Admins must use the Web Portal.',
      };
    }

    if (!res.ok) {
      const errObj = body?.error;
      const errorMsg = errObj?.message || (errObj?.code ? mapAuthError(errObj.code) : res.statusText);
      return {
        success: false,
        statusCode: res.status,
        errorCode: errObj?.code,
        error: errorMsg,
        details: errObj?.details,
      };
    }

    if (body?.error) {
      return {
        success: false,
        statusCode: res.status,
        errorCode: body.error.code,
        error: body.error.message || mapAuthError(body.error.code),
        details: body.error.details,
      };
    }

    // Envelope unwrapping: API returns { data: ..., meta: ... }
    const responseData = body?.data !== undefined ? body.data : body;

    return {
      success: true,
      statusCode: res.status,
      data: responseData as T,
    };
  } catch (err) {
    return {
      success: false,
      error: mapAuthError(err),
    };
  }
}
