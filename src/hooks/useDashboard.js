import { useEffect, useMemo } from 'react';

import { useAppData } from '@context/AppDataContext';
import { EMPLOYEE_STATUS } from '@validation/employee';

export function useDashboard() {
  const { employees } = useAppData();

  useEffect(() => {
    employees.ensure();
  }, [employees.ensure]);

  // One walk of the list instead of a filter per counter, each of which built
  // a whole array only to read its length.
  const stats = useMemo(() => {
    let active = 0;
    let awaitingRegistration = 0;

    for (const item of employees.data) {
      if (item.status === EMPLOYEE_STATUS.ACTIVE) active += 1;
      if (!item.isRegistered) awaitingRegistration += 1;
    }

    const total = employees.data.length;

    return { total, active, inactive: total - active, awaitingRegistration };
  }, [employees.data]);

  return {
    stats,
    isLoading: employees.isLoading,
    isForbidden: employees.isForbidden,
  };
}
