import { useCallback, useState } from 'react';

import { normalizeError } from '@utils/errors';
import { mapDocumentError } from '@validation/document';
import * as documentApi from '@services/document';

export function useUpdateDocument() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const clearMessages = useCallback(() => {
    setError(null);
    setFieldErrors({});
  }, []);

  const submit = useCallback(
    async (documentId, values) => {
      if (isSubmitting) return null;

      setIsSubmitting(true);
      clearMessages();

      try {
        const response = await documentApi.updateDocument(documentId, values);
        return response?.data ?? null;
      } catch (caught) {
        const normalized = normalizeError(caught);

        if (normalized.status === 403) {
          setError('You are not authorized to edit this document.');
          return null;
        }

        if (normalized.status === 404) {
          setError('Document not found.');
          return null;
        }

        const mapped = mapDocumentError(normalized);

        setFieldErrors({ ...mapped.fieldErrors, ...normalized.fieldErrors });
        setError(mapped.formError);

        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, clearMessages]
  );

  return { submit, isSubmitting, error, fieldErrors, clearMessages };
}
