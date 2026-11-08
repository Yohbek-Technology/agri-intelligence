import { Platform } from 'react-native';

/**
 * Returns the active API base URL depending on platform & environment.
 * - Android Emulator: 10.0.2.2 points to host machine loopback
 * - iOS Simulator / Web: localhost points to host machine
 * - Physical device: set EXPO_PUBLIC_SERVER_URL to LAN IP (e.g. http://192.168.1.X:5000)
 */
export function getApiBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_SERVER_URL) {
    return process.env.EXPO_PUBLIC_SERVER_URL.replace(/\/$/, '');
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000';
  }
  return 'http://localhost:5000';
}

export const API_BASE_URL = getApiBaseUrl();

export const API_ROUTES = {
  health: `${API_BASE_URL}/health`,
  // Better Auth endpoints
  signInPhone: `${API_BASE_URL}/api/auth/sign-in/phone-number`,
  signInUsername: `${API_BASE_URL}/api/auth/sign-in/username`,
  sendOtp: `${API_BASE_URL}/api/auth/phone-number/send-otp`,
  verifyOtp: `${API_BASE_URL}/api/auth/phone-number/verify`,
  updateUser: `${API_BASE_URL}/api/auth/update-user`,
  getSession: `${API_BASE_URL}/api/auth/get-session`,
  signOut: `${API_BASE_URL}/api/auth/sign-out`,
  // Additional server endpoints
  checkPhone: `${API_BASE_URL}/api/v1/auth/check-phone`,
  requestPasswordReset: `${API_BASE_URL}/api/v1/auth/phone-number/request-password-reset`,
  resetPassword: `${API_BASE_URL}/api/v1/auth/phone-number/reset-password`,
} as const;
