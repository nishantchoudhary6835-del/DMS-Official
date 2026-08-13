import { useCallback, useState } from 'react';

import { normalizeError } from '@utils/errors';
import { mapPermissionError } from '@validation/permission';
import * as permissionApi from '@services/permission';

export function useUpdatePermission() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const clearMessages = useCallback(() => {
    setError(null);
    setFieldErrors({});
  }, []);

  const submit = useCallback(
    async (permissionId, changes) => {
      if (isSubmitting) return null;

      setIsSubmitting(true);
      clearMessages();

      try {
        const response = await permissionApi.updatePermission(
          permissionId,
          changes
        );
        return response?.data ?? null;
      } catch (caught) {
        const normalized = normalizeError(caught);

        if (normalized.status === 403) {
          setError('Only a Super Admin can edit permissions.');
          return null;
        }

        if (normalized.status === 404) {
          setError('Permission not found.');
          return null;
        }

        const mapped = mapPermissionError(normalized);

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
