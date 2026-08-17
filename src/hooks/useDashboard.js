import { useCallback, useEffect, useMemo } from 'react';

import { useAppData } from '@context/AppDataContext';
import { EMPLOYEE_STATUS } from '@validation/employee';

export function useDashboard() {
  const { employees, users } = useAppData();

  useEffect(() => {
    employees.ensure();
    users.ensure();
  }, [employees.ensure, users.ensure]);

  const stats = useMemo(() => {
    const list = employees.data;
    const active = list.filter(
      (item) => item.status === EMPLOYEE_STATUS.ACTIVE
    ).length;

    return {
      total: list.length,
      active,
      inactive: list.length - active,
      awaitingRegistration: list.filter((item) => !item.isRegistered).length,
    };
  }, [employees.data]);

  // Best-effort, same as before: a failed/not-yet-loaded users fetch leaves
  // this null rather than surfacing its own error — the dashboard's account
  // stats are a nice-to-have, not worth an error banner of their own.
  const accountStats = useMemo(() => {
    if (!users.hasLoaded || users.isForbidden || users.error) return null;

    return {
      total: users.data.length,
      locked: users.data.filter((item) => item.lockUntil).length,
      unverified: users.data.filter((item) => !item.isEmailVerified).length,
    };
  }, [users.hasLoaded, users.isForbidden, users.error, users.data]);

  const refresh = useCallback(() => {
    employees.refresh();
    users.refresh();
  }, [employees.refresh, users.refresh]);

  return {
    stats,
    accountStats,
    isLoading: employees.isLoading,
    error: employees.error,
    isForbidden: employees.isForbidden,
    refresh,
  };
}
