export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export const API_TIMEOUT_MS = 45000;

export const EMAIL_TIMEOUT_MS = 150000;

export const IS_DEV = typeof __DEV__ !== 'undefined' && __DEV__;

if (!API_BASE_URL && IS_DEV) {
  console.warn(
    '[config/env] EXPO_PUBLIC_API_BASE_URL is not set.\n' +
      'Copy .env.example to .env and fill it in.'
  );
}
