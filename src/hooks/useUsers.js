import { useEffect } from 'react';

import { useAppData } from '@context/AppDataContext';

export function useUsers() {
  const { users } = useAppData();

  useEffect(() => {
    users.ensure();
  }, [users.ensure]);

  return {
    users: users.data,
    isLoading: users.isLoading,
    isRefreshing: users.isRefreshing,
    error: users.error,
    isForbidden: users.isForbidden,
    refresh: users.refresh,
  };
}
