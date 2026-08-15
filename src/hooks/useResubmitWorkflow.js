import { useCallback, useState } from 'react';

import { normalizeError } from '@utils/errors';
import { mapWorkflowError } from '@validation/workflow';
import * as workflowApi from '@services/workflow';

export function useResubmitWorkflow() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const clearMessages = useCallback(() => setError(null), []);

  const submit = useCallback(
    async (workflowId) => {
      if (isSubmitting) return null;

      setIsSubmitting(true);
      clearMessages();

      try {
        const response = await workflowApi.resubmitWorkflow(workflowId);
        return response?.data ?? null;
      } catch (caught) {
        const normalized = normalizeError(caught);

        if (normalized.status === 403) {
          setError('You are not authorized to resubmit this document.');
          return null;
        }

        const mapped = mapWorkflowError(normalized);
        setError(mapped.formError);
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, clearMessages]
  );

  return { submit, isSubmitting, error, clearMessages };
}
