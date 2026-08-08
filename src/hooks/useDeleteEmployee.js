import { useCallback, useState } from 'react';

import { normalizeError } from '@utils/errors';
import * as employeeApi from '@services/employee';

export function useDeleteEmployee() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => setError(null), []);

  const remove = useCallback(
    async (employeeId) => {
      if (isDeleting) return false;

      setIsDeleting(true);
      setError(null);

      try {
        await employeeApi.deleteEmployee(employeeId);
        return true;
      } catch (caught) {
        const normalized = normalizeError(caught);

        if (normalized.status === 403) {
          setError('You are not authorized to delete this employee.');
        } else if (normalized.status === 404) {
          setError('Employee not found. It may already have been deleted.');
        } else {
          setError(normalized.message);
        }

        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [isDeleting]
  );

  return { remove, isDeleting, error, clearError };
}
