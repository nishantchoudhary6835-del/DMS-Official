import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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

export function AppProviders({ children }) {
  return (
    <ToastProvider>
      <SafeAreaProvider>
        <AuthProvider>
          <ApiBridge>{children}</ApiBridge>
        </AuthProvider>
      </SafeAreaProvider>
    </ToastProvider>
  );
}
