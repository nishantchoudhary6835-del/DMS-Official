import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAppData } from '@context/AppDataContext';

// All role-permission assignments, status/hierarchyLevel-filtered client-side
// (the endpoint takes no query parameters).
export function useRolePermissions() {
  const { rolePermissions } = useAppData();
  const [filters, setFilters] = useState({});

  useEffect(() => {
    rolePermissions.ensure();
  }, [rolePermissions.ensure]);

  const visible = useMemo(
    () =>
      rolePermissions.data.filter((row) => {
        if (filters.status && row.status !== filters.status) return false;
        if (filters.hierarchyLevel && row.hierarchyLevel !== filters.hierarchyLevel) {
          return false;
        }
        return true;
      }),
    [rolePermissions.data, filters]
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
    rolePermissions: visible,
    totalCount: rolePermissions.data.length,
    filters,
    activeFilterCount,
    toggleFilter,
    clearFilters,
    isLoading: rolePermissions.isLoading,
    isRefreshing: rolePermissions.isRefreshing,
    error: rolePermissions.error,
    isForbidden: rolePermissions.isForbidden,
    refresh: rolePermissions.refresh,
  };
}
