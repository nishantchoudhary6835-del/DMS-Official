import { useCallback, useState } from 'react';

import { normalizeError } from '@utils/errors';
import * as permissionApi from '@services/permission';

// PERMISSION_MODULE.md documents no delete-blocking behaviour, so unlike
// useDeleteDepartment/useDeleteTeam this does not guess at one.
export function useDeletePermission() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => setError(null), []);

  const remove = useCallback(
    async (permissionId) => {
      if (isDeleting) return false;

      setIsDeleting(true);
      setError(null);

      try {
        await permissionApi.deletePermission(permissionId);
        return true;
      } catch (caught) {
        const normalized = normalizeError(caught);

        if (normalized.status === 403) {
          setError('Only a Super Admin can delete permissions.');
        } else if (normalized.status === 404) {
          setError('Permission not found. It may already have been deleted.');
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
