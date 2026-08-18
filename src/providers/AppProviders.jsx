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
          <ScopedAppData>
            <ApiBridge>{children}</ApiBridge>
          </ScopedAppData>
        </AuthProvider>
      </SafeAreaProvider>
    </ToastProvider>
  );
}
