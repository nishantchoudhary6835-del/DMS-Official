import { useCallback, useState } from 'react';

import { normalizeError } from '@utils/errors';
import * as userApi from '@services/user';

export function useUserStatus() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => setError(null), []);

  const submit = useCallback(
    async (userId, accountStatus) => {
      if (isSubmitting) return null;

      setIsSubmitting(true);
      setError(null);

      try {
        const response = await userApi.updateUserStatus(userId, accountStatus);
        return response?.data ?? true;
      } catch (caught) {
        const normalized = normalizeError(caught);

        if (normalized.status === 403) {
          setError('You are not authorized to change this account status.');
        } else if (normalized.status === 404) {
          setError('User not found.');
        } else {
          setError(normalized.message);
        }

        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting]
  );

  return { submit, isSubmitting, error, clearError };
}
