import { useCallback, useEffect, useRef, useState } from 'react';

import { normalizeError } from '@utils/errors';
import * as userApi from '@services/user';

export function useUsers() {
  const [users, setUsers] = useState([]);
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
      const response = await userApi.listUsers();

      if (requestRef.current !== requestId) return;

      setUsers(Array.isArray(response?.data) ? response.data : []);
    } catch (caught) {
      if (requestRef.current !== requestId) return;

      const normalized = normalizeError(caught);

      if (normalized.status === 403) {
        setIsForbidden(true);
        setError('You are not authorized to view accounts.');
      } else {
        setError(normalized.message);
      }

      setUsers([]);
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

  const refresh = useCallback(() => load({ refresh: true }), [load]);

  return { users, isLoading, isRefreshing, error, isForbidden, refresh };
}
