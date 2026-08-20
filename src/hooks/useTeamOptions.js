import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { normalizeError } from '@utils/errors';
import { TEAM_STATUS } from '@validation/team';
import * as teamApi from '@services/team';

// Active teams within one department — offering IT's teams to an HR placement
// would make a record the org chart cannot explain. Filtered server-side.
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

      // A 403 is expected outside SUPER_ADMIN / TEAM_LEAD. The empty dropdown
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
