import { useCallback, useEffect, useRef, useState } from 'react';

import { normalizeError } from '@utils/errors';
import * as teamApi from '@services/team';

export function useTeam(teamId) {
  const [team, setTeam] = useState(null);
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
      setTeam(null);
      setIsNotFound(true);
      setError('Team not found.');
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    try {
      const response = await teamApi.getTeamById(id);

      if (requestRef.current !== requestId) return;

      setTeam(response?.data ?? null);
    } catch (caught) {
      if (requestRef.current !== requestId) return;

      const normalized = normalizeError(caught);

      if (normalized.status === 403) {
        setIsForbidden(true);
        setError('You are not authorized to view this team.');
      } else if (normalized.status === 404) {
        setIsNotFound(true);
        setError('Team not found.');
      } else {
        setError(normalized.message);
      }

      setTeam(null);
    } finally {
      if (requestRef.current === requestId) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    load(teamId);
  }, [teamId, load]);

  const refresh = useCallback(
    () => load(teamId, { refresh: true }),
    [teamId, load]
  );

  return { team, isLoading, isRefreshing, error, isForbidden, isNotFound, refresh };
}
