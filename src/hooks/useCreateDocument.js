import { useCallback, useState } from 'react';

import { useAppData } from '@context/AppDataContext';
import { normalizeError } from '@utils/errors';
import { mapDocumentError } from '@validation/document';
import * as documentApi from '@services/document';

export function useCreateDocument() {
  const { documents } = useAppData();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const clearMessages = useCallback(() => {
    setError(null);
    setFieldErrors({});
  }, []);

  const submit = useCallback(
    async (values) => {
      if (isSubmitting) return null;

      setIsSubmitting(true);
      clearMessages();

      try {
        const response = await documentApi.createDocument(values);
        const created = response?.data ?? null;

        // So every list showing "my documents" (Drafts, the dashboard, …)
        // reflects it immediately, not just the next time one happens to remount.
        if (created) documents.invalidate();

        return created;
      } catch (caught) {
        const normalized = normalizeError(caught);

        if (normalized.status === 403) {
          setError('You are not authorized to create documents.');
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
    [isSubmitting, clearMessages, documents]
  );

  return { submit, isSubmitting, error, fieldErrors, clearMessages };
}
