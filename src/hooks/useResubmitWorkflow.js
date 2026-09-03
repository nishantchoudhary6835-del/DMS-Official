import { useCallback, useState } from 'react';

import { useAppData } from '@context/AppDataContext';
import { normalizeError } from '@utils/errors';
import { mapWorkflowError } from '@validation/workflow';
import * as workflowApi from '@services/workflow';

export function useResubmitWorkflow() {
  const { documents, mySubmissions } = useAppData();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const clearMessages = useCallback(() => setError(null), []);

  const submit = useCallback(
    async (documentId) => {
      if (isSubmitting) return null;

      setIsSubmitting(true);
      clearMessages();

      try {
        const response = await workflowApi.resubmitDocument(documentId);
        const updated = response?.data ?? null;

        if (updated) {
          documents.invalidate();
          mySubmissions.invalidate();
        }

        return updated;
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
    [isSubmitting, clearMessages, documents, mySubmissions]
  );

  return { submit, isSubmitting, error, clearMessages };
}
