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

// AppDataProvider never unmounts across a login/logout, so an account switch
// kept serving the old account's cached lists. Keying on the id forces a remount.
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
          {/* Outside ScopedAppData, which remounts on every account switch: the
              401-refresh interceptor must stay registered across one. */}
          <ApiBridge>
            <ScopedAppData>{children}</ScopedAppData>
          </ApiBridge>
        </AuthProvider>
      </SafeAreaProvider>
    </ToastProvider>
  );
}
