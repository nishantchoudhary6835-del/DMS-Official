import { useCallback, useEffect, useRef, useState } from 'react';

import { normalizeError } from '@utils/errors';
import * as employeeApi from '@services/employee';

export function useEmployee(employeeId) {
  const [employee, setEmployee] = useState(null);
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
      setEmployee(null);
      setIsNotFound(true);
      setError('Employee not found.');
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    try {
      const response = await employeeApi.getEmployeeById(id);

      if (requestRef.current !== requestId) return;

      setEmployee(response?.data ?? null);
    } catch (caught) {
      if (requestRef.current !== requestId) return;

      const normalized = normalizeError(caught);

      if (normalized.status === 403) {
        setIsForbidden(true);
        setError('You are not authorized to view this employee.');
      } else if (normalized.status === 404) {
        setIsNotFound(true);
        setError('Employee not found.');
      } else {
        setError(normalized.message);
      }

      setEmployee(null);
    } finally {
      if (requestRef.current === requestId) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    load(employeeId);
  }, [employeeId, load]);

  const refresh = useCallback(
    () => load(employeeId, { refresh: true }),
    [employeeId, load]
  );

  return {
    employee,
    isLoading,
    isRefreshing,
    error,
    isForbidden,
    isNotFound,
    refresh,
  };
}
