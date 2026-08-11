import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { normalizeError } from '@utils/errors';
import { TEAM_STATUS } from '@validation/team';
import * as teamApi from '@services/team';

/**
 * Active teams within one department, shaped for a Select.
 *
 * Scoped by department because that is what a team is — offering IT's teams
 * to someone being placed in HR would produce a record the org chart cannot
 * explain. With no department chosen there is nothing to offer, and the hook
 * does not fetch at all rather than pulling every team and discarding most.
 *
 * Filtering happens server-side; unlike /department, this endpoint takes
 * query parameters.
 *
 * Not cached, for the same reason useDepartmentOptions is not: teams are
 * created and deactivated from inside this app, and a bundle-lifetime cache
 * would hide one you just made.
 */
export function useTeamOptions(departmentId = null) {
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const requestRef = useRef(0);

  const load = useCallback(async (id) => {
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;

    if (!id) {
      setTeams([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await teamApi.listTeams({
        department: id,
        status: TEAM_STATUS.ACTIVE,
      });

      if (requestRef.current !== requestId) return;

      setTeams(Array.isArray(response?.data) ? response.data : []);
    } catch (caught) {
      if (requestRef.current !== requestId) return;

      // A 403 is expected for anyone outside SUPER_ADMIN / TEAM_LEAD. On an
      // employee form that is not worth shouting about — the empty dropdown
      // already says the field has nothing to offer.
      const normalized = normalizeError(caught);

      setError(normalized.status === 403 ? null : normalized.message);
      setTeams([]);
    } finally {
      if (requestRef.current === requestId) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load(departmentId);
  }, [departmentId, load]);

  const options = useMemo(
    () =>
      teams
        .slice()
        .sort((a, b) => String(a.name ?? '').localeCompare(String(b.name ?? '')))
        .map((team) => ({ value: team._id, label: team.name })),
    [teams]
  );

  const refresh = useCallback(() => load(departmentId), [departmentId, load]);

  return { options, teams, isLoading, error, refresh };
}
