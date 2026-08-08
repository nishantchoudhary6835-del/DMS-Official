import { useCallback, useState } from 'react';

import { normalizeError } from '@utils/errors';
import * as userApi from '@services/user';

export function useResetPassword() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => setError(null), []);

  const submit = useCallback(
    async (userId, newPassword) => {
      if (isSubmitting) return false;

      setIsSubmitting(true);
      setError(null);

      try {
        await userApi.resetUserPassword(userId, newPassword);
        return true;
      } catch (caught) {
        const normalized = normalizeError(caught);

        if (normalized.status === 403) {
          setError('You are not authorized to reset this password.');
        } else if (normalized.status === 404) {
          setError('User not found.');
        } else {
          setError(normalized.message);
        }

        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting]
  );

  return { submit, isSubmitting, error, clearError };
}
