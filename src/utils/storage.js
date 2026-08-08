import * as SecureStore from 'expo-secure-store';

import { IS_DEV } from '@config/env';

export const STORAGE_KEYS = {
  USER: 'dms.user',
};

export async function getItem(key) {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    if (IS_DEV) console.warn(`[storage] Failed to read "${key}"`, error);
    return null;
  }
}

export async function setItem(key, value) {
  try {
    await SecureStore.setItemAsync(key, value);
    return true;
  } catch (error) {
    if (IS_DEV) console.warn(`[storage] Failed to write "${key}"`, error);
    return false;
  }
}

export async function removeItem(key) {
  try {
    await SecureStore.deleteItemAsync(key);
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
