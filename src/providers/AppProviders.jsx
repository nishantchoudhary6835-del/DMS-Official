import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppDataProvider } from '@context/AppDataContext';
import { AuthProvider, useAuth } from '@context/AuthContext';
import { ToastProvider } from '@context/ToastContext';
import { setupInterceptors } from '@services/axiosInstance';

function ApiBridge({ children }) {
  const { onSessionExpired } = useAuth();

  useEffect(() => {
    return setupInterceptors({ onSessionExpired });
  }, [onSessionExpired]);

  return children;
}

/**
 * AppDataContext's resources are fetched once and then reused (`ensure()`
 * never re-fetches once loaded — see its own header comment) so that
 * navigating between screens sharing a resource doesn't refire the same
 * request. But AppDataProvider itself never naturally unmounts across a
 * login/logout, so without this, switching accounts kept serving the
 * previous account's cached departments/employees/permissions/etc. — fully
 * rendered, no loading state (only `isRefreshing` fires on a background
 * refresh, not `isLoading`) — until each screen's own refresh-on-focus
 * happened to resolve. Keying on the account's own id forces a full remount
 * of the whole subtree on every account change, which resets every
 * useListResource back to empty/unfetched before anything can render with
 * the wrong account's data.
 */
function ScopedAppData({ children }) {
  const { user } = useAuth();

  return (
    <AppDataProvider key={user?._id ?? 'anonymous'}>
      {children}
    </AppDataProvider>
  );
}

export function AppProviders({ children }) {
  return (
    <ToastProvider>
      <SafeAreaProvider>
        <AuthProvider>
          {/*
            ApiBridge wraps ScopedAppData, not the other way around: the
            axios response interceptor it registers is what catches a 401,
            attempts a refresh, and signs the user out automatically on
            failure. ScopedAppData remounts AppDataProvider on every account
            switch (see its own comment) — if ApiBridge were inside that
            boundary, the interceptor would be torn down and re-registered on
            every switch too, leaving a real window right as the new
            account's screens fire their first requests where no interceptor
            is attached to catch a 401 at all. Keeping it outside means the
            interceptor stays continuously registered across account
            switches, independent of the data cache being reset.
          */}
          <ApiBridge>
            <ScopedAppData>{children}</ScopedAppData>
          </ApiBridge>
        </AuthProvider>
      </SafeAreaProvider>
    </ToastProvider>
  );
}
