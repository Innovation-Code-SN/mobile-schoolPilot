import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'auth.token';
const REFRESH_TOKEN_KEY = 'auth.refreshToken';
const USER_KEY = 'auth.user';

const isWeb = Platform.OS === 'web';

async function getItem(key: string): Promise<string | null> {
  if (isWeb) {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function setItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function deleteItem(key: string): Promise<void> {
  if (isWeb) {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export const storage = {
  async getToken(): Promise<string | null> {
    return getItem(TOKEN_KEY);
  },
  async setToken(token: string): Promise<void> {
    await setItem(TOKEN_KEY, token);
  },
  async getRefreshToken(): Promise<string | null> {
    return getItem(REFRESH_TOKEN_KEY);
  },
  async setRefreshToken(token: string): Promise<void> {
    await setItem(REFRESH_TOKEN_KEY, token);
  },
  async getUser<T>(): Promise<T | null> {
    const raw = await getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
  async setUser<T>(user: T): Promise<void> {
    await setItem(USER_KEY, JSON.stringify(user));
  },
  async clearAuth(): Promise<void> {
    await Promise.all([
      deleteItem(TOKEN_KEY),
      deleteItem(REFRESH_TOKEN_KEY),
      deleteItem(USER_KEY),
    ]);
  },
};
