import { useCallback, useEffect, useRef, useState } from 'react';

import { normalizeError } from '@utils/errors';
import * as documentApi from '@services/document';

export function useDocument(documentId) {
  const [document, setDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isForbidden, setIsForbidden] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);

  const requestRef = useRef(0);

  const load = useCallback(async (id, { refresh = false } = {}) => {
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;

    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);

    setError(null);
    setIsForbidden(false);
    setIsNotFound(false);

    if (!id) {
      setDocument(null);
      setIsNotFound(true);
      setError('Document not found.');
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    try {
      const response = await documentApi.getDocumentById(id);

      if (requestRef.current !== requestId) return;

      setDocument(response?.data ?? null);
    } catch (caught) {
      if (requestRef.current !== requestId) return;

      const normalized = normalizeError(caught);

      if (normalized.status === 403) {
        setIsForbidden(true);
        setError('You are not authorized to view this document.');
      } else if (normalized.status === 404) {
        setIsNotFound(true);
        setError('Document not found.');
      } else {
        setError(normalized.message);
      }

      setDocument(null);
    } finally {
      if (requestRef.current === requestId) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    load(documentId);
  }, [documentId, load]);

  const refresh = useCallback(
    () => load(documentId, { refresh: true }),
    [documentId, load]
  );

  return {
    document,
    isLoading,
    isRefreshing,
    error,
    isForbidden,
    isNotFound,
    refresh,
  };
}
