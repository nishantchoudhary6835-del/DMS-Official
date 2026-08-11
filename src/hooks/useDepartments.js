import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { normalizeError } from '@utils/errors';
import * as departmentApi from '@services/department';

/**
 * All departments.
 *
 * The endpoint takes no query parameters, so status filtering is done here
 * rather than sent to the server.
 */
export function useDepartments() {
  const [departments, setDepartments] = useState([]);
  const [status, setStatus] = useState(null);
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
      const response = await departmentApi.listDepartments();

      if (requestRef.current !== requestId) return;

      setDepartments(Array.isArray(response?.data) ? response.data : []);
    } catch (caught) {
      if (requestRef.current !== requestId) return;

      const normalized = normalizeError(caught);

      if (normalized.status === 403) {
        setIsForbidden(true);
        setError('You are not authorized to view departments.');
      } else {
        setError(normalized.message);
      }

      setDepartments([]);
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
      status
        ? departments.filter((department) => department.status === status)
        : departments,
    [departments, status]
  );

  const toggleStatus = useCallback((value) => {
    setStatus((prev) => (prev === value ? null : value));
  }, []);

  const refresh = useCallback(() => load({ refresh: true }), [load]);

  return {
    departments: visible,
    totalCount: departments.length,
    status,
    toggleStatus,
    isLoading,
    isRefreshing,
    error,
    isForbidden,
    refresh,
  };
}
