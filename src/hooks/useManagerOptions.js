import { useEffect, useMemo, useState } from 'react';

import { HIERARCHY_LABELS } from '@validation/employee';
import * as employeeApi from '@services/employee';

export function useManagerOptions(excludeId = null) {
  const [managers, setManagers] = useState([]);

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
    () =>
      managers
        .filter((employee) => employee._id !== excludeId)
        .map((employee) => ({
          value: employee._id,
          label:
            [employee.firstName, employee.lastName].filter(Boolean).join(' ') ||
            employee.employeeId,
          hint: `${employee.employeeId} · ${
            HIERARCHY_LABELS[employee.hierarchyLevel] ?? employee.hierarchyLevel
          }`,
        })),
    [managers, excludeId]
  );
}
