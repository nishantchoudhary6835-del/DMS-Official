import { useCallback, useState } from 'react';

import { normalizeError } from '@utils/errors';
import { isDeleteBlocked } from '@validation/department';
import * as departmentApi from '@services/department';

export function useDeleteDepartment() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);

  const clearError = useCallback(() => {
    setError(null);
    setIsBlocked(false);
  }, []);

  const remove = useCallback(
    async (departmentId) => {
      if (isDeleting) return false;

      setIsDeleting(true);
      setError(null);
      setIsBlocked(false);

      try {
        await departmentApi.deleteDepartment(departmentId);
        return true;
      } catch (caught) {
        const normalized = normalizeError(caught);

        // Not a failure so much as a refusal: employees still point at this
        // department. The caller has to keep the row on screen either way, but
        // this one deserves an explanation rather than a generic error.
        if (isDeleteBlocked(normalized)) {
          setIsBlocked(true);
          setError(
            'This department cannot be deleted because employees are assigned to it.'
          );
        } else if (normalized.status === 403) {
          setError('You are not authorized to delete departments.');
        } else if (normalized.status === 404) {
          setError('Department not found. It may already have been deleted.');
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

  return { remove, isDeleting, error, isBlocked, clearError };
}
