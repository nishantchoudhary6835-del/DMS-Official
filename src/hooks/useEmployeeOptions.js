import { useEffect, useMemo, useState } from 'react';

import { managerCandidates } from '@validation/employee';
import * as employeeApi from '@services/employee';

/**
 * Active employees, shaped for a Select. Three callers, three needs.
 *
 * `hierarchyLevel` + `ranks` makes it a reporting-manager picker, filtered and
 * ordered by seniority — see managerCandidates for that rule.
 *
 * `onlyLevel` restricts to a single hierarchy level. The Team Lead picker uses
 * it: the backend rejects a team lead who is not an active TEAM_LEAD, so
 * offering anyone else guarantees a failed save.
 *
 * With neither, every active employee alphabetically — what the Department
 * Head picker wants, since the backend constrains nothing there.
 */
export function useEmployeeOptions(excludeId = null, options = null) {
  const [managers, setManagers] = useState([]);

  const {
    hierarchyLevel = null,
    ranks = null,
    onlyLevel = null,
  } = options ?? {};

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

  return useMemo(() => {
    // Applied before the seniority rules rather than inside them — an exact
    // level match is a different question from "who outranks this person",
    // and the two are never wanted together.
    const pool = onlyLevel
      ? managers.filter((employee) => employee.hierarchyLevel === onlyLevel)
      : managers;

    return managerCandidates(pool, { excludeId, hierarchyLevel, ranks });
  }, [managers, excludeId, hierarchyLevel, ranks, onlyLevel]);
}
