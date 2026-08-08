import { useCallback, useState } from 'react';

import { normalizeError } from '@utils/errors';
import * as userApi from '@services/user';

export function useDeleteUser() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => setError(null), []);

  const remove = useCallback(
    async (userId) => {
      if (isDeleting) return false;

      setIsDeleting(true);
      setError(null);

      try {
        await userApi.deleteUser(userId);
        return true;
      } catch (caught) {
        const normalized = normalizeError(caught);

        if (normalized.status === 403) {
          setError('You are not authorized to remove this account.');
        } else if (normalized.status === 404) {
          setError('User not found. It may already have been removed.');
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
