import { useCallback, useEffect, useRef, useState } from 'react';

import { normalizeError } from '@utils/errors';
import * as userApi from '@services/user';

export function useUser(userId) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isForbidden, setIsForbidden] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);

  const requestRef = useRef(0);

  const load = useCallback(async (id) => {
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;

    setIsLoading(true);
    setError(null);
    setIsForbidden(false);
    setIsNotFound(false);

    if (!id) {
      setUser(null);
      setIsNotFound(true);
      setError('User not found.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await userApi.getUserById(id);

      if (requestRef.current !== requestId) return;

      setUser(response?.data ?? null);
    } catch (caught) {
      if (requestRef.current !== requestId) return;

      const normalized = normalizeError(caught);

      if (normalized.status === 403) {
        setIsForbidden(true);
        setError('You are not authorized to view this account.');
      } else if (normalized.status === 404) {
        setIsNotFound(true);
        setError('User not found.');
      } else {
        setError(normalized.message);
      }

      setUser(null);
    } finally {
      if (requestRef.current === requestId) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load(userId);
  }, [userId, load]);

  const refresh = useCallback(() => load(userId), [userId, load]);

  return { user, isLoading, error, isForbidden, isNotFound, refresh };
}
