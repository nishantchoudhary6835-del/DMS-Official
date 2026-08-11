import { useEffect, useMemo, useState } from 'react';

import { managerCandidates } from '@validation/employee';
import * as employeeApi from '@services/employee';

/**
 * Active employees, shaped for a Select.
 *
 * Two callers with different needs. Pass `seniority` and it becomes a
 * reporting-manager picker, filtered and ordered by rank — see
 * managerCandidates for that rule. Omit it and you get every active employee
 * alphabetically, which is what the Department Head picker wants: the backend
 * imposes no constraint on who may head a department, so neither do we.
 */
export function useEmployeeOptions(excludeId = null, seniority = null) {
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
