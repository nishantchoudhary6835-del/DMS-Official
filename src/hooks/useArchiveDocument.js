import { useCallback, useState } from 'react';

import { useAppData } from '@context/AppDataContext';
import { normalizeError, permissionDenialMessage } from '@utils/errors';
import * as documentApi from '@services/document';

export function useArchiveDocument() {
  const { documents } = useAppData();

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
        documents.invalidate();
        return response?.data ?? true;
      } catch (caught) {
        const normalized = normalizeError(caught);

        const denial = permissionDenialMessage(normalized, {
          action: 'archive',
          permission: 'DOCUMENT.ARCHIVE',
        });

        setError(
          denial ??
            (normalized.status === 403 && !normalized.hasServerMessage
              ? 'You are not authorized to archive this document.'
              : normalized.message)
        );
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, clearMessages, documents]
  );

  return { submit, isSubmitting, error, clearMessages };
}
