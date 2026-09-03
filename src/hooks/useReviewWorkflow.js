import { useCallback, useState } from 'react';

import { useAppData } from '@context/AppDataContext';
import { normalizeError } from '@utils/errors';
import { mapWorkflowError } from '@validation/workflow';
import * as workflowApi from '@services/workflow';

export function useReviewWorkflow() {
  const { documents, pendingWorkflows } = useAppData();

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
        const updated = response?.data ?? null;

        // Approving/returning/rejecting takes it off this reviewer's own
        // pending list and changes the document's status everywhere it's shown.
        if (updated) {
          documents.invalidate();
          pendingWorkflows.invalidate();
        }

        return updated;
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
    [isSubmitting, clearMessages, documents, pendingWorkflows]
  );

  return { submit, isSubmitting, error, clearMessages };
}
