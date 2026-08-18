import { useCallback, useState } from 'react';

import { normalizeError } from '@utils/errors';
import { mapWorkflowError } from '@validation/workflow';
import * as workflowApi from '@services/workflow';

export function useReviewWorkflow() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const clearMessages = useCallback(() => setError(null), []);

  const submit = useCallback(
    async (workflowId, action, reviewComment = null) => {
      if (isSubmitting) return null;

      setIsSubmitting(true);
      clearMessages();

      try {
        const response = await workflowApi.reviewWorkflow(workflowId, action, reviewComment);
        return response?.data ?? null;
      } catch (caught) {
        const normalized = normalizeError(caught);

        if (normalized.status === 403) {
          setError('You are not authorized to review this document.');
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
