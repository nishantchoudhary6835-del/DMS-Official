import { useCallback, useState } from 'react';

import { useAppData } from '@context/AppDataContext';
import { normalizeError, permissionDenialMessage } from '@utils/errors';
import * as documentApi from '@services/document';

export function useRestoreDocument() {
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
        const response = await documentApi.restoreDocument(documentId);
        documents.invalidate();
        return response?.data ?? true;
      } catch (caught) {
        const normalized = normalizeError(caught);

        const denial = permissionDenialMessage(normalized, {
          action: 'restore',
          permission: 'DOCUMENT.RESTORE',
        });

        // Past the permission engine, document.service.js refuses restore for
        // anyone but SUPER_ADMIN, and says so. Never paper over that sentence.
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
    [isSubmitting, clearMessages, documents]
  );

  return { submit, isSubmitting, error, clearMessages };
}
