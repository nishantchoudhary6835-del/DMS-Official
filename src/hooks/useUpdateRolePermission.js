import { useCallback, useState } from 'react';

import { normalizeError } from '@utils/errors';
import { mapRolePermissionError } from '@validation/rolePermission';
import * as rolePermissionApi from '@services/rolePermission';

export function useUpdateRolePermission() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const clearMessages = useCallback(() => {
    setError(null);
    setFieldErrors({});
  }, []);

  const submit = useCallback(
    async (rolePermissionId, changes) => {
      if (isSubmitting) return null;

      setIsSubmitting(true);
      clearMessages();

      try {
        const response = await rolePermissionApi.updateRolePermission(
          rolePermissionId,
          changes
        );
        return response?.data ?? null;
      } catch (caught) {
        const normalized = normalizeError(caught);

        if (normalized.status === 403) {
          setError('Only a Super Admin can edit role assignments.');
          return null;
        }

        if (normalized.status === 404) {
          setError('Role assignment not found.');
          return null;
        }

        const mapped = mapRolePermissionError(normalized);

        setFieldErrors({ ...mapped.fieldErrors, ...normalized.fieldErrors });
        setError(mapped.formError);

        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, clearMessages]
  );

  return { submit, isSubmitting, error, fieldErrors, clearMessages };
}
