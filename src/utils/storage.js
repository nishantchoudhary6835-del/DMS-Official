import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import { IS_DEV } from '@config/env';

const STORAGE_KEYS = {
  USER: 'dms.user',
};

// expo-secure-store's web build is a bare `{}`, so nothing ever persisted in a
// browser. No keychain backs it on web anyway, so localStorage there instead.
const isWeb = Platform.OS === 'web';

async function getItem(key) {
  try {
    if (isWeb) return window.localStorage.getItem(key);
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    if (IS_DEV) console.warn(`[storage] Failed to read "${key}"`, error);
    return null;
  }
}

async function setItem(key, value) {
  try {
    if (isWeb) {
      window.localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
    return true;
  } catch (error) {
    if (IS_DEV) console.warn(`[storage] Failed to write "${key}"`, error);
    return false;
  }
}

async function removeItem(key) {
  try {
    if (isWeb) {
      window.localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  } catch (error) {
    if (IS_DEV) console.warn(`[storage] Failed to delete "${key}"`, error);
  }
}

export async function getStoredUser() {
  const raw = await getItem(STORAGE_KEYS.USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    if (IS_DEV) console.warn('[storage] Stored user is not valid JSON', error);
    return null;
  }
}

export const setStoredUser = (user) =>
  setItem(STORAGE_KEYS.USER, JSON.stringify(user));

export const clearStoredUser = () => removeItem(STORAGE_KEYS.USER);
