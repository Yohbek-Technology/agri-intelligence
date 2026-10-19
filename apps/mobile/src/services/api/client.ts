import { secureStorage } from '../storage/keychain-storage';
import { SESSION_CONFIG, APP_VERSION, CLIENT_TYPE } from '@/config/constants';
import { mapAuthError } from '@/utils/error-mapper';

export interface ServiceResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

const DEVICE_ID_KEY = 'agri_device_identifier_uuid';

export async function getOrCreateDeviceId(): Promise<string> {
  let deviceId = await secureStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = `android-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    await secureStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<ServiceResult<T>> {
  const token = await secureStorage.getItem(SESSION_CONFIG.storageKeyToken);
  const deviceId = await getOrCreateDeviceId();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Client-Type': CLIENT_TYPE,
    'X-App-Version': APP_VERSION,
    'X-Device-Id': deviceId,
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMsg = data?.error ? mapAuthError(data.error) : res.statusText;
      return {
        success: false,
        statusCode: res.status,
        error: errorMsg,
      };
    }

    if (data?.error) {
      return {
        success: false,
        statusCode: res.status,
        error: mapAuthError(data.error),
      };
    }

    return {
      success: true,
      statusCode: res.status,
      data: (data?.data !== undefined ? data.data : data) as T,
    };
  } catch (err) {
    return {
      success: false,
      error: mapAuthError(err),
    };
  }
}
