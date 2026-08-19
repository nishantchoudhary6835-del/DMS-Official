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

/**
 * Routes the backend serves without `passport.authenticate` — confirmed
 * against `auth.routes.js`. A 401 from one of these means the request itself
 * was rejected, not that a session expired, so the refresh-and-retry below
 * must not fire for them: it would spend a pointless round trip and then
 * call onSessionExpired() on a user who was never signed in, swallowing the
 * real error. `/auth/change-password` is deliberately absent — that one is
 * JWT-protected, so a 401 there really should refresh.
 */
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

/**
 * Collapses identical concurrent GET requests into one network call.
 *
 * AuthContext's access probe (GET /employee, GET /department, to infer
 * isSuperAdmin/isAdminOrAbove) and whichever screen loads right after login
 * ask for the same lists within a moment of each other on every session —
 * two round-trips for data one response could have answered. This only
 * collapses requests that are still in flight when a duplicate is made; the
 * map entry is cleared the instant the request settles, so it caches
 * nothing and a later, genuinely separate fetch still hits the network,
 * same as before. Safe by construction: two GETs to the same URL+params
 * fired close enough together to overlap would have returned the same data
 * anyway.
 */
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
