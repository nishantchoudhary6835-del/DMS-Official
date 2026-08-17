import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import { IS_DEV } from '@config/env';

const STORAGE_KEYS = {
  USER: 'dms.user',
};

/**
 * expo-secure-store has no real web implementation — its web build
 * (node_modules/expo-secure-store/build/ExpoSecureStore.web.js) is a bare
 * `{}`, so every call throws on web and was being silently swallowed below,
 * meaning nothing ever actually persisted in a browser. That's what made
 * the session look logged out after every refresh even though the real
 * session cookie was often still valid. There's no OS keychain to back
 * SecureStore on the web platform anyway, so this stores the same
 * non-sensitive profile object (the login response's `user`, no token) in
 * localStorage there instead — same function signatures either way, so
 * nothing above this file needs to know which one is in use.
 */
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
