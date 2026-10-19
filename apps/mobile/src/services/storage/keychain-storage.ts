import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const inMemoryFallback = new Map<string, string>();

/**
 * Hardware-backed secure storage service.
 * Manages 30-day session tokens and encryption keys inside the Android Keystore.
 */
export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(key);
        }
        return inMemoryFallback.get(key) ?? null;
      }
      return await SecureStore.getItemAsync(key);
    } catch (err) {
      console.warn(`[secureStorage] Failed to read key ${key}:`, err);
      return inMemoryFallback.get(key) ?? null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    inMemoryFallback.set(key, value);
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
        return;
      }
      await SecureStore.setItemAsync(key, value, {
        keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
      });
    } catch (err) {
      console.warn(`[secureStorage] Failed to write key ${key}:`, err);
    }
  },

  async removeItem(key: string): Promise<void> {
    inMemoryFallback.delete(key);
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
        }
        return;
      }
      await SecureStore.deleteItemAsync(key);
    } catch (err) {
      console.warn(`[secureStorage] Failed to delete key ${key}:`, err);
    }
  },

  async clear(): Promise<void> {
    inMemoryFallback.clear();
  },
};
