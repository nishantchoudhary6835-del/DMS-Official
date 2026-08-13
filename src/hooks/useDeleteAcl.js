import { useCallback, useState } from 'react';

import { normalizeError } from '@utils/errors';
import * as aclApi from '@services/acl';

export function useDeleteAcl() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => setError(null), []);

  const remove = useCallback(
    async (aclId) => {
      if (isDeleting) return false;

      setIsDeleting(true);
      setError(null);

      try {
        await aclApi.deleteAcl(aclId);
        return true;
      } catch (caught) {
        const normalized = normalizeError(caught);

        if (normalized.status === 403) {
          setError('Only a Super Admin can delete access rules.');
        } else if (normalized.status === 404) {
          setError('Access rule not found. It may already have been deleted.');
        } else {
          setError(normalized.message);
        }

        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [isDeleting]
  );

  return { remove, isDeleting, error, clearError };
}
