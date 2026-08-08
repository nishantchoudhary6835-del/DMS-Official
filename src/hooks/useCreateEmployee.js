import { useCallback, useState } from 'react';

import { normalizeError } from '@utils/errors';
import { mapEmployeeError } from '@validation/employee';
import * as employeeApi from '@services/employee';

export function useCreateEmployee() {
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
        const response = await employeeApi.createEmployee(values);
        return response?.data ?? null;
      } catch (caught) {
        const normalized = normalizeError(caught);
        const mapped = mapEmployeeError(normalized);

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
