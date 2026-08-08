import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from '@context/AuthContext';
import { setupInterceptors } from '@services/axiosInstance';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

function ApiBridge({ children }) {
  const { onSessionExpired } = useAuth();

  useEffect(() => {
    return setupInterceptors({ onSessionExpired });
  }, [onSessionExpired]);

  return children;
}

export function AppProviders({ children }) {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ApiBridge>{children}</ApiBridge>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
