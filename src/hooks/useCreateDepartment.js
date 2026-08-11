import { useCallback, useState } from 'react';

import { normalizeError } from '@utils/errors';
import { mapDepartmentError } from '@validation/department';
import * as departmentApi from '@services/department';

export function useCreateDepartment() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const clearMessages = useCallback(() => {
    setError(null);
    setFieldErrors({});
  }, []);

  const submit = useCallback(
    async (values) => {
      if (isSubmitting) return null;

      setIsSubmitting(true);
      clearMessages();

      try {
        const response = await departmentApi.createDepartment(values);
        return response?.data ?? null;
      } catch (caught) {
        const normalized = normalizeError(caught);

        if (normalized.status === 403) {
          setError('You are not authorized to create departments.');
          return null;
        }

        const mapped = mapDepartmentError(normalized);

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
