import { useCallback, useEffect, useRef, useState } from 'react';

import { normalizeError } from '@utils/errors';
import * as departmentApi from '@services/department';

export function useDepartment(departmentId) {
  const [department, setDepartment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isForbidden, setIsForbidden] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);

  const requestRef = useRef(0);

  const load = useCallback(async (id, { refresh = false } = {}) => {
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;

    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);

    setError(null);
    setIsForbidden(false);
    setIsNotFound(false);

    if (!id) {
      setDepartment(null);
      setIsNotFound(true);
      setError('Department not found.');
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    try {
      const response = await departmentApi.getDepartmentById(id);

      if (requestRef.current !== requestId) return;

      setDepartment(response?.data ?? null);
    } catch (caught) {
      if (requestRef.current !== requestId) return;

      const normalized = normalizeError(caught);

      if (normalized.status === 403) {
        setIsForbidden(true);
        setError('You are not authorized to view this department.');
      } else if (normalized.status === 404) {
        setIsNotFound(true);
        setError('Department not found.');
      } else {
        setError(normalized.message);
      }

      setDepartment(null);
    } finally {
      if (requestRef.current === requestId) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    load(departmentId);
  }, [departmentId, load]);

  const refresh = useCallback(
    () => load(departmentId, { refresh: true }),
    [departmentId, load]
  );

  return {
    department,
    isLoading,
    isRefreshing,
    error,
    isForbidden,
    isNotFound,
    refresh,
  };
}
