import { useCallback, useEffect, useRef, useState } from 'react';

import { normalizeError } from '@utils/errors';
import * as employeeApi from '@services/employee';

export function useEmployees() {
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isForbidden, setIsForbidden] = useState(false);

  const requestRef = useRef(0);

  const load = useCallback(
    async (activeFilters, { refresh = false } = {}) => {
      const requestId = requestRef.current + 1;
      requestRef.current = requestId;

      if (refresh) setIsRefreshing(true);
      else setIsLoading(true);

      setError(null);
      setIsForbidden(false);

      try {
        const response = await employeeApi.listEmployees(activeFilters);

        if (requestRef.current !== requestId) return;

        setEmployees(Array.isArray(response?.data) ? response.data : []);
      } catch (caught) {
        if (requestRef.current !== requestId) return;

        const normalized = normalizeError(caught);

        if (normalized.status === 403) {
          setIsForbidden(true);
          setError('You are not authorized to view employees.');
        } else {
          setError(normalized.message);
        }

        setEmployees([]);
      } finally {
        if (requestRef.current === requestId) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    load(filters);
  }, [filters, load]);

  const toggleFilter = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key] === value ? undefined : value,
    }));
  }, []);

  const clearFilters = useCallback(() => setFilters({}), []);

  const refresh = useCallback(() => {
    load(filters, { refresh: true });
  }, [filters, load]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return {
    employees,
    filters,
    activeFilterCount,
    isLoading,
    isRefreshing,
    error,
    isForbidden,
    toggleFilter,
    clearFilters,
    refresh,
  };
}
