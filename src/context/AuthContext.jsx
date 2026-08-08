import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  clearStoredUser,
  getStoredUser,
  setStoredUser,
} from '@utils/storage';
import { IS_DEV } from '@config/env';
import * as authApi from '@services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isRestoring, setIsRestoring] = useState(true);

  const applyUser = useCallback(async (userData) => {
    setUser(userData);

    if (userData) {
      await setStoredUser(userData);
    } else {
      await clearStoredUser();
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const stored = await getStoredUser();

      if (cancelled) return;

      if (stored) setUser(stored);
      setIsRestoring(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(
    async (userData) => {
      await applyUser(userData ?? null);
    },
    [applyUser]
  );

  const signOut = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      if (IS_DEV) {
        console.warn('[AuthContext] Server logout failed; clearing locally.', error);
      }
    } finally {
      await applyUser(null);
    }
  }, [applyUser]);

  const onSessionExpired = useCallback(() => {
    applyUser(null);
  }, [applyUser]);

  const value = useMemo(
    () => ({
      user,
      isRestoring,
      isAuthenticated: Boolean(user),
      signIn,
      signOut,
      onSessionExpired,
    }),
    [user, isRestoring, signIn, signOut, onSessionExpired]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>.');
  }

  return context;
}
