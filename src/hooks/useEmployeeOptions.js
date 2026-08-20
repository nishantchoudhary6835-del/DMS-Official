import { useEffect, useMemo, useState } from 'react';

import { managerCandidates } from '@validation/employee';
import * as employeeApi from '@services/employee';

// Active employees shaped for a Select: `hierarchyLevel`+`ranks` makes it a
// manager picker, `onlyLevel` a Team Lead one, neither an alphabetical list.
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
    // Before the seniority rules, not inside them — an exact level match is a
    // different question from "who outranks this person".
    const pool = onlyLevel
      ? managers.filter((employee) => employee.hierarchyLevel === onlyLevel)
      : managers;

    return managerCandidates(pool, { excludeId, hierarchyLevel, ranks });
  }, [managers, excludeId, hierarchyLevel, ranks, onlyLevel]);
}
