import { useCallback, useState } from 'react';

import { useAppData } from '@context/AppDataContext';
import { normalizeError } from '@utils/errors';
import { mapWorkflowError } from '@validation/workflow';
import * as workflowApi from '@services/workflow';

export function useSubmitDocument() {
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
        const response = await workflowApi.submitDocumentForReview(documentId);
        const workflow = response?.data ?? null;

        // Moves the document out of Drafts and creates a new entry in My
        // Submissions — both need to refetch, not just the document list.
        if (workflow) {
          documents.invalidate();
          mySubmissions.invalidate();
        }

        return workflow;
      } catch (caught) {
        const normalized = normalizeError(caught);

        if (normalized.status === 403) {
          setError('You are not authorized to submit this document.');
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
