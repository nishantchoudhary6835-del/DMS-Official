import { useCallback, useState } from 'react';

import { normalizeError, permissionDenialMessage } from '@utils/errors';
import * as documentApi from '@services/document';

export function useDeleteDocument() {
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
        return true;
      } catch (caught) {
        const normalized = normalizeError(caught);

        // Two very different 403s reach here. The permission engine refuses
        // when the caller's hierarchy level was never granted DOCUMENT.DELETE
        // — nothing about this document will change that. Only past that does
        // canDeleteDocument refuse on ownership/draft grounds. Reporting the
        // second reason for the first sends the reader to inspect the wrong
        // thing entirely.
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
    [isSubmitting, clearMessages]
  );

  return { submit, isSubmitting, error, clearMessages };
}
