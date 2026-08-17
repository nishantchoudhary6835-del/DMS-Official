import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAppData } from '@context/AppDataContext';

/**
 * All ACL rules, status/effect-filtered client-side (the endpoint takes no
 * query parameters).
 */
export function useAcls() {
  const { acls } = useAppData();
  const [filters, setFilters] = useState({});

  useEffect(() => {
    acls.ensure();
  }, [acls.ensure]);

  const visible = useMemo(
    () =>
      acls.data.filter((acl) => {
        if (filters.status && acl.status !== filters.status) return false;
        if (filters.effect && acl.effect !== filters.effect) return false;
        return true;
      }),
    [acls.data, filters]
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
    acls: visible,
    totalCount: acls.data.length,
    filters,
    activeFilterCount,
    toggleFilter,
    clearFilters,
    isLoading: acls.isLoading,
    isRefreshing: acls.isRefreshing,
    error: acls.error,
    isForbidden: acls.isForbidden,
    refresh: acls.refresh,
  };
}
