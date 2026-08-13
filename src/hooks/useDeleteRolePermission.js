import { useCallback, useState } from 'react';

import { normalizeError } from '@utils/errors';
import * as rolePermissionApi from '@services/rolePermission';

export function useDeleteRolePermission() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => setError(null), []);

  const remove = useCallback(
    async (rolePermissionId) => {
      if (isDeleting) return false;

      setIsDeleting(true);
      setError(null);

      try {
        await rolePermissionApi.deleteRolePermission(rolePermissionId);
        return true;
      } catch (caught) {
        const normalized = normalizeError(caught);

        if (normalized.status === 403) {
          setError('Only a Super Admin can delete role assignments.');
        } else if (normalized.status === 404) {
          setError('Role assignment not found. It may already have been deleted.');
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
