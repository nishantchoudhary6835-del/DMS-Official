import { useCallback, useEffect, useRef, useState } from 'react';

import * as userApi from '@services/user';

function employeeIdOf(user) {
  const reference = user?.employeeId;

  if (!reference) return null;
  if (typeof reference === 'string') return reference;

  return reference._id ?? null;
}

export function useEmployeeAccount(employeeId) {
  const [account, setAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnavailable, setIsUnavailable] = useState(false);

  const requestRef = useRef(0);

  const load = useCallback(async (id) => {
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;

    setIsLoading(true);
    setIsUnavailable(false);

    if (!id) {
      setAccount(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await userApi.listUsers();

      if (requestRef.current !== requestId) return;

      const users = Array.isArray(response?.data) ? response.data : [];

      setAccount(users.find((user) => employeeIdOf(user) === id) ?? null);
    } catch {
      if (requestRef.current !== requestId) return;

      setAccount(null);
      setIsUnavailable(true);
    } finally {
      if (requestRef.current === requestId) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load(employeeId);
  }, [employeeId, load]);

  const refresh = useCallback(() => load(employeeId), [employeeId, load]);

  return { account, isLoading, isUnavailable, refresh };
}
