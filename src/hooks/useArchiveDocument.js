import { useCallback, useState } from 'react';

import { normalizeError } from '@utils/errors';
import * as documentApi from '@services/document';

export function useArchiveDocument() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const clearMessages = useCallback(() => setError(null), []);

  const submit = useCallback(
    async (documentId) => {
      if (isSubmitting) return null;

      setIsSubmitting(true);
      clearMessages();

      try {
        const response = await documentApi.archiveDocument(documentId);
        return response?.data ?? true;
      } catch (caught) {
        const normalized = normalizeError(caught);

        setError(
          normalized.status === 403
            ? 'You are not authorized to archive this document.'
            : normalized.message
        );
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, clearMessages]
  );

  return { submit, isSubmitting, error, clearMessages };
}
