import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'bbash_auth_token';
const USER_KEY = 'bbash_user_profile';
const BIOMETRIC_ENABLED_KEY = 'bbash_biometrics_enabled';

export const SecureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, value);
        }
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (e) {
      console.warn('Storage set error:', e);
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') {
          return window.localStorage.getItem(key);
        }
        return null;
      }
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      console.warn('Storage get error:', e);
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(key);
        }
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (e) {
      console.warn('Storage delete error:', e);
    }
  },

  setToken(token: string) {
    return this.setItem(TOKEN_KEY, token);
  },

  getToken() {
    return this.getItem(TOKEN_KEY);
  },

  setUser(user: any) {
    return this.setItem(USER_KEY, JSON.stringify(user));
  },

  async getUser() {
    const data = await this.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  setBiometricEnabled(enabled: boolean) {
    return this.setItem(BIOMETRIC_ENABLED_KEY, enabled ? 'true' : 'false');
  },

  async isBiometricEnabled() {
    const val = await this.getItem(BIOMETRIC_ENABLED_KEY);
    return val === 'true';
  },

  clearAll() {
    return Promise.all([
      this.removeItem(TOKEN_KEY),
      this.removeItem(USER_KEY),
      this.removeItem(BIOMETRIC_ENABLED_KEY),
    ]);
  },
};
