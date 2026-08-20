import axios from 'axios';

import { API_BASE_URL, API_TIMEOUT_MS, IS_DEV } from '@config/env';
import { normalizeError } from '@utils/errors';

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Routes served without `passport.authenticate`: a 401 here is a rejected request,
// not an expired session, so refresh-and-retry must not fire and strand the user.
const PUBLIC_PATHS = [
  '/auth/send-email-otp',
  '/auth/verify-email-otp',
  '/auth/register',
  '/auth/login',
  '/auth/refresh',
  '/auth/forgot-password',
  '/auth/verify-forgot-password-otp',
];

const isPublicPath = (url = '') => PUBLIC_PATHS.some((p) => url.includes(p));

let refreshPromise = null;

const inFlightGets = new Map();

// Collapses identical concurrent GETs into one call. Only in-flight requests —
// the entry clears the instant it settles, so nothing is cached.
export function dedupedGet(url, config) {
  const key = `${url}?${JSON.stringify(config?.params ?? {})}`;

  const existing = inFlightGets.get(key);
  if (existing) return existing;

  const promise = axiosInstance.get(url, config).finally(() => {
    inFlightGets.delete(key);
  });

  inFlightGets.set(key, promise);
  return promise;
}

export function setupInterceptors({ onSessionExpired }) {
  const responseId = axiosInstance.interceptors.response.use(
    (response) => response,

    async (error) => {
      const original = error.config;
      const normalized = normalizeError(error);

      if (
        normalized.status !== 401 ||
        !original ||
        original._retry ||
        isPublicPath(original.url)
      ) {
        return Promise.reject(error);
      }

      original._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = axiosInstance.post('/auth/refresh', {}).finally(() => {
            refreshPromise = null;
          });
        }

        await refreshPromise;

        return axiosInstance(original);
      } catch (refreshError) {
        if (IS_DEV) {
          console.warn(
            '[axiosInstance] Session refresh failed — signing out.',
            normalizeError(refreshError).message
          );
        }

        onSessionExpired();
        return Promise.reject(error);
      }
    }
  );

  return () => {
    axiosInstance.interceptors.response.eject(responseId);
  };
}
