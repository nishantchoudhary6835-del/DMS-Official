import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAppData } from '@context/AppDataContext';

/**
 * All permissions, status/action-filtered client-side (the endpoint takes no
 * query parameters).
 */
export function usePermissions() {
  const { permissions } = useAppData();
  const [filters, setFilters] = useState({});

  useEffect(() => {
    permissions.ensure();
  }, [permissions.ensure]);

  const visible = useMemo(
    () =>
      permissions.data.filter((permission) => {
        if (filters.status && permission.status !== filters.status) return false;
        if (filters.action && permission.action !== filters.action) return false;
        return true;
      }),
    [permissions.data, filters]
  );

  const toggleFilter = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key] === value ? undefined : value,
    }));
  }, []);

  const clearFilters = useCallback(() => setFilters({}), []);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return {
    permissions: visible,
    totalCount: permissions.data.length,
    filters,
    activeFilterCount,
    toggleFilter,
    clearFilters,
    isLoading: permissions.isLoading,
    isRefreshing: permissions.isRefreshing,
    error: permissions.error,
    isForbidden: permissions.isForbidden,
    refresh: permissions.refresh,
  };
}
