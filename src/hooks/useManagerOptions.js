import { useEffect, useMemo, useState } from 'react';

import { managerCandidates } from '@validation/employee';
import * as employeeApi from '@services/employee';

/**
 * Candidate reporting managers, most senior first.
 *
 * `seniority` is optional — see managerCandidates for the filtering rule. The
 * ranks it takes come from GET /hierarchy's `level`, which is the one thing
 * that endpoint provides that a hardcoded list could not.
 */
export function useManagerOptions(excludeId = null, seniority = null) {
  const [managers, setManagers] = useState([]);

  const { hierarchyLevel = null, ranks = null } = seniority ?? {};

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await employeeApi.listEmployees({ status: 'ACTIVE' });

        if (cancelled) return;

        setManagers(Array.isArray(response?.data) ? response.data : []);
      } catch {
        if (!cancelled) setManagers([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return useMemo(
    () => managerCandidates(managers, { excludeId, hierarchyLevel, ranks }),
    [managers, excludeId, hierarchyLevel, ranks]
  );
}
