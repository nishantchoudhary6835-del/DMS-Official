import { useCallback, useState } from 'react';

import { normalizeError } from '@utils/errors';
import * as rolePermissionApi from '@services/rolePermission';

export function useRolePermissionStatus() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => setError(null), []);

  const submit = useCallback(
    async (rolePermissionId, status) => {
      if (isSubmitting) return null;

      setIsSubmitting(true);
      setError(null);

      try {
        const response = await rolePermissionApi.updateRolePermissionStatus(
          rolePermissionId,
          status
        );
        return response?.data ?? null;
      } catch (caught) {
        const normalized = normalizeError(caught);

        if (normalized.status === 403) {
          setError('Only a Super Admin can change this assignment’s status.');
        } else if (normalized.status === 404) {
          setError('Role assignment not found.');
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
