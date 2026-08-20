import { useCallback, useEffect, useRef, useState } from 'react';

import { normalizeError } from '@utils/errors';
import * as rolePermissionApi from '@services/rolePermission';

export function useRolePermission(rolePermissionId) {
  const [rolePermission, setRolePermission] = useState(null);
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
      setRolePermission(null);
      setIsNotFound(true);
      setError('Role assignment not found.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await rolePermissionApi.getRolePermissionById(id);

      if (requestRef.current !== requestId) return;

      setRolePermission(response?.data ?? null);
    } catch (caught) {
      if (requestRef.current !== requestId) return;

      const normalized = normalizeError(caught);

      if (normalized.status === 403) {
        setIsForbidden(true);
        setError('You are not authorized to view this role assignment.');
      } else if (normalized.status === 404) {
        setIsNotFound(true);
        setError('Role assignment not found.');
      } else {
        setError(normalized.message);
      }

      setRolePermission(null);
    } finally {
      if (requestRef.current === requestId) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    load(rolePermissionId);
  }, [rolePermissionId, load]);

  const refresh = useCallback(
    () => load(rolePermissionId, { refresh: true }),
    [rolePermissionId, load]
  );

  return {
    rolePermission,
    isLoading,
    error,
    isForbidden,
    isNotFound,
    refresh,
  };
}
