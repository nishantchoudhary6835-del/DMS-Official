import { useCallback, useState } from 'react';
import { Platform } from 'react-native';

import { normalizeError } from '@utils/errors';
import * as documentApi from '@services/document';

const NOT_SUPPORTED_MESSAGE =
  "Viewing documents in-app isn't available on this platform yet.";

// Web-only: createObjectURL/window.open are DOM APIs, and native would need a
// bundled PDF renderer this app has not installed. Native gets a clear refusal.
export function useViewDocument() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearMessages = useCallback(() => setError(null), []);

  const view = useCallback(
    async (documentId) => {
      if (isLoading) return;

      if (Platform.OS !== 'web') {
        setError(NOT_SUPPORTED_MESSAGE);
        return;
      }

      setIsLoading(true);
      clearMessages();

      try {
        const blob = await documentApi.viewDocument(documentId);
        const objectUrl = URL.createObjectURL(blob);

        window.open(objectUrl, '_blank');

        // The new tab needs time to actually load the blob URL before it's
        // revoked — revoking immediately can race that load.
        setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
      } catch (caught) {
        const normalized = normalizeError(caught);

        if (normalized.status === 403) {
          setError('You are not authorized to view this document.');
        } else if (normalized.status === 404) {
          setError('Document not found.');
        } else {
          setError(normalized.message);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, clearMessages]
  );

  return { view, isLoading, error, clearMessages };
}
