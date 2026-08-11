import { useCallback, useState } from 'react';

import { normalizeError } from '@utils/errors';
import { mapTeamError } from '@validation/team';
import * as teamApi from '@services/team';

/**
 * Also the path for assigning and clearing the Team Lead — there is no
 * dedicated endpoint, so both are a PATCH carrying `teamLead`.
 */
export function useUpdateTeam() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const clearMessages = useCallback(() => {
    setError(null);
    setFieldErrors({});
  }, []);

  const submit = useCallback(
    async (teamId, changes) => {
      if (isSubmitting) return null;

      setIsSubmitting(true);
      clearMessages();

      try {
        const response = await teamApi.updateTeam(teamId, changes);
        return response?.data ?? null;
      } catch (caught) {
        const normalized = normalizeError(caught);

        if (normalized.status === 403) {
          setError('You are not authorized to edit teams.');
          return null;
        }

        if (normalized.status === 404) {
          setError('Team not found.');
          return null;
        }

        const mapped = mapTeamError(normalized);

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
