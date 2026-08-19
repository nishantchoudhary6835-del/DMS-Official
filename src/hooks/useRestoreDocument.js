import { useCallback, useState } from 'react';

import { normalizeError, permissionDenialMessage } from '@utils/errors';
import * as documentApi from '@services/document';

export function useRestoreDocument() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const clearMessages = useCallback(() => setError(null), []);

  const submit = useCallback(
    async (documentId) => {
      if (isSubmitting) return null;

      setIsSubmitting(true);
      clearMessages();

      try {
        const response = await documentApi.restoreDocument(documentId);
        return response?.data ?? true;
      } catch (caught) {
        const normalized = normalizeError(caught);

        const denial = permissionDenialMessage(normalized, {
          action: 'restore',
          permission: 'DOCUMENT.RESTORE',
        });

        // Past the permission engine, document.service.js refuses restore for
        // anyone who is not SUPER_ADMIN, and says so. That sentence is the
        // whole answer, so never paper over it with a generic one.
        setError(
          denial ??
            (normalized.status === 403 && !normalized.hasServerMessage
              ? 'You are not authorized to restore this document.'
              : normalized.message)
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
