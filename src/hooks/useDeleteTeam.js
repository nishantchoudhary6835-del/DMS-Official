import { useCallback, useState } from 'react';

import { normalizeError } from '@utils/errors';
import { isDeleteBlocked } from '@validation/team';
import * as teamApi from '@services/team';

export function useDeleteTeam() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);

  const clearError = useCallback(() => {
    setError(null);
    setIsBlocked(false);
  }, []);

  const remove = useCallback(
    async (teamId) => {
      if (isDeleting) return false;

      setIsDeleting(true);
      setError(null);
      setIsBlocked(false);

      try {
        await teamApi.deleteTeam(teamId);
        return true;
      } catch (caught) {
        const normalized = normalizeError(caught);

        if (isDeleteBlocked(normalized)) {
          setIsBlocked(true);
          setError(
            'This team cannot be deleted because employees are assigned to it.'
          );
        } else if (normalized.status === 403) {
          // Deleting is SUPER_ADMIN only while a TEAM_LEAD may do everything
          // else here — the expected answer for a whole class of user.
          setError('Only a Super Admin can delete a team.');
        } else if (normalized.status === 404) {
          setError('Team not found. It may already have been deleted.');
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
