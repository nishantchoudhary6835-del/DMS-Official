import { useCallback, useEffect, useRef, useState } from 'react';

import { normalizeError } from '@utils/errors';
import * as permissionApi from '@services/permission';

export function usePermission(permissionId) {
  const [permission, setPermission] = useState(null);
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
      setPermission(null);
      setIsNotFound(true);
      setError('Permission not found.');
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    try {
      const response = await permissionApi.getPermissionById(id);

      if (requestRef.current !== requestId) return;

      setPermission(response?.data ?? null);
    } catch (caught) {
      if (requestRef.current !== requestId) return;

      const normalized = normalizeError(caught);

      if (normalized.status === 403) {
        setIsForbidden(true);
        setError('You are not authorized to view this permission.');
      } else if (normalized.status === 404) {
        setIsNotFound(true);
        setError('Permission not found.');
      } else {
        setError(normalized.message);
      }

      setPermission(null);
    } finally {
      if (requestRef.current === requestId) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    load(permissionId);
  }, [permissionId, load]);

  const refresh = useCallback(
    () => load(permissionId, { refresh: true }),
    [permissionId, load]
  );

  return {
    permission,
    isLoading,
    isRefreshing,
    error,
    isForbidden,
    isNotFound,
    refresh,
  };
}
