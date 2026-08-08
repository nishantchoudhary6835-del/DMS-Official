import { useCallback, useState } from 'react';

import { normalizeError } from '@utils/errors';
import * as employeeApi from '@services/employee';

export function useEmployeeStatus() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => setError(null), []);

  const submit = useCallback(
    async (employeeId, status) => {
      if (isSubmitting) return null;

      setIsSubmitting(true);
      setError(null);

      try {
        const response = await employeeApi.updateEmployeeStatus(
          employeeId,
          status
        );
        return response?.data ?? null;
      } catch (caught) {
        const normalized = normalizeError(caught);

        if (normalized.status === 403) {
          setError('You are not authorized to change this employee’s status.');
        } else if (normalized.status === 404) {
          setError('Employee not found.');
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
