import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { normalizeError } from '@utils/errors';
import * as aclApi from '@services/acl';

/**
 * All ACL rules.
 *
 * No query parameters are documented, so status and effect filtering happen
 * here rather than being sent to the server, same as usePermissions.
 */
export function useAcls() {
  const [acls, setAcls] = useState([]);
  const [filters, setFilters] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isForbidden, setIsForbidden] = useState(false);

  const requestRef = useRef(0);

  const load = useCallback(async ({ refresh = false } = {}) => {
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;

    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);

    setError(null);
    setIsForbidden(false);

    try {
      const response = await aclApi.listAcls();

      if (requestRef.current !== requestId) return;

      setAcls(Array.isArray(response?.data) ? response.data : []);
    } catch (caught) {
      if (requestRef.current !== requestId) return;

      const normalized = normalizeError(caught);

      if (normalized.status === 403) {
        setIsForbidden(true);
        setError('You are not authorized to view access rules.');
      } else {
        setError(normalized.message);
      }

      setAcls([]);
    } finally {
      if (requestRef.current === requestId) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(
    () =>
      acls.filter((acl) => {
        if (filters.status && acl.status !== filters.status) return false;
        if (filters.effect && acl.effect !== filters.effect) return false;
        return true;
      }),
    [acls, filters]
  );

  const toggleFilter = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key] === value ? undefined : value,
    }));
  }, []);

  const clearFilters = useCallback(() => setFilters({}), []);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const refresh = useCallback(() => load({ refresh: true }), [load]);

  return {
    acls: visible,
    totalCount: acls.length,
    filters,
    activeFilterCount,
    toggleFilter,
    clearFilters,
    isLoading,
    isRefreshing,
    error,
    isForbidden,
    refresh,
  };
}
