import { useCallback, useState } from 'react';

import { useAppData } from '@context/AppDataContext';
import { normalizeError, permissionDenialMessage } from '@utils/errors';
import * as documentApi from '@services/document';

export function useDeleteDocument() {
  const { documents } = useAppData();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const clearMessages = useCallback(() => setError(null), []);

  const submit = useCallback(
    async (documentId) => {
      if (isSubmitting) return false;

      setIsSubmitting(true);
      clearMessages();

      try {
        await documentApi.deleteDocument(documentId);
        documents.invalidate();
        return true;
      } catch (caught) {
        const normalized = normalizeError(caught);

        // Two different 403s reach here — the permission engine refusing
        // DOCUMENT.DELETE, and canDeleteDocument refusing on ownership grounds.
        const denial = permissionDenialMessage(normalized, {
          action: 'delete',
          permission: 'DOCUMENT.DELETE',
        });

        if (denial) {
          setError(denial);
          return false;
        }

        setError(
          normalized.status === 403 && !normalized.hasServerMessage
            ? 'You can only delete your own documents while they are still drafts.'
            : normalized.message
        );
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, clearMessages, documents]
  );

  return { submit, isSubmitting, error, clearMessages };
}
