import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { normalizeError } from '@utils/errors';
import * as rolePermissionApi from '@services/rolePermission';

/**
 * All role-permission assignments.
 *
 * No query parameters are documented, so — like usePermissions — status and
 * hierarchyLevel filtering happen here rather than being sent to the server.
 */
export function useRolePermissions() {
  const [rolePermissions, setRolePermissions] = useState([]);
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
      const response = await rolePermissionApi.listRolePermissions();

      if (requestRef.current !== requestId) return;

      setRolePermissions(Array.isArray(response?.data) ? response.data : []);
    } catch (caught) {
      if (requestRef.current !== requestId) return;

      const normalized = normalizeError(caught);

      if (normalized.status === 403) {
        setIsForbidden(true);
        setError('You are not authorized to view role assignments.');
      } else {
        setError(normalized.message);
      }

      setRolePermissions([]);
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
      rolePermissions.filter((row) => {
        if (filters.status && row.status !== filters.status) return false;
        if (filters.hierarchyLevel && row.hierarchyLevel !== filters.hierarchyLevel) {
          return false;
        }
        return true;
      }),
    [rolePermissions, filters]
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
    rolePermissions: visible,
    totalCount: rolePermissions.length,
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
