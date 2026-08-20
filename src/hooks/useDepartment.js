import { useCallback, useEffect, useRef, useState } from 'react';

import { normalizeError } from '@utils/errors';
import * as departmentApi from '@services/department';

export function useDepartment(departmentId) {
  const [department, setDepartment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isForbidden, setIsForbidden] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);

  const requestRef = useRef(0);

  const load = useCallback(async (id, { refresh = false } = {}) => {
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;

    // A refresh deliberately leaves isLoading alone: no detail screen shows
    // a background indicator, and flipping it would flash the full-page loader.
    if (!refresh) setIsLoading(true);

    setError(null);
    setIsForbidden(false);
    setIsNotFound(false);

    if (!id) {
      setDepartment(null);
      setIsNotFound(true);
      setError('Department not found.');
      setIsLoading(false);
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
    error,
    isForbidden,
    isNotFound,
    refresh,
  };
}
