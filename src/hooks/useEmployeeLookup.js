import { useCallback, useState } from 'react';

import { normalizeError } from '@utils/errors';
import * as employeeApi from '@services/employee';

export function useEmployeeLookup() {
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [isNotFound, setIsNotFound] = useState(false);

  const clear = useCallback(() => {
    setError(null);
    setIsNotFound(false);
  }, []);

  const lookup = useCallback(
    async (email) => {
      const trimmed = String(email ?? '').trim();

      if (isSearching || !trimmed) return null;

      setIsSearching(true);
      setError(null);
      setIsNotFound(false);

      try {
        const response = await employeeApi.getEmployeeByEmail(trimmed);
        const found = response?.data ?? null;

        if (!found) setIsNotFound(true);

        return found;
      } catch (caught) {
        const normalized = normalizeError(caught);

        if (normalized.status === 404) {
          setIsNotFound(true);
        } else if (normalized.status === 403) {
          setError('You are not authorized to look up employees.');
        } else {
          setError(normalized.message);
        }

        return null;
      } finally {
        setIsSearching(false);
      }
    },
    [isSearching]
  );

  return { lookup, isSearching, error, isNotFound, clear };
}
