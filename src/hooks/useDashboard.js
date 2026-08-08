import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { normalizeError } from '@utils/errors';
import { EMPLOYEE_STATUS } from '@validation/employee';
import * as employeeApi from '@services/employee';
import * as userApi from '@services/user';

export function useDashboard() {
  const [employees, setEmployees] = useState([]);
  const [users, setUsers] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isForbidden, setIsForbidden] = useState(false);

  const requestRef = useRef(0);

  const load = useCallback(async () => {
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;

    setError(null);
    setIsForbidden(false);

    const [employeeResult, userResult] = await Promise.allSettled([
      employeeApi.listEmployees(),
      userApi.listUsers(),
    ]);

    if (requestRef.current !== requestId) return;

    if (employeeResult.status === 'fulfilled') {
      const data = employeeResult.value?.data;
      setEmployees(Array.isArray(data) ? data : []);
    } else {
      const normalized = normalizeError(employeeResult.reason);

      if (normalized.status === 403) {
        setIsForbidden(true);
        setError('You are not authorized to view employees.');
      } else {
        setError(normalized.message);
      }

      setEmployees([]);
    }

    const userData =
      userResult.status === 'fulfilled' ? userResult.value?.data : null;

    setUsers(Array.isArray(userData) ? userData : null);

    setIsLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const active = employees.filter(
      (item) => item.status === EMPLOYEE_STATUS.ACTIVE
    ).length;

    return {
      total: employees.length,
      active,
      inactive: employees.length - active,
      awaitingRegistration: employees.filter((item) => !item.isRegistered)
        .length,
    };
  }, [employees]);

  const accountStats = useMemo(() => {
    if (!users) return null;

    return {
      total: users.length,
      locked: users.filter((item) => item.lockUntil).length,
      unverified: users.filter((item) => !item.isEmailVerified).length,
    };
  }, [users]);

  return { stats, accountStats, isLoading, error, isForbidden, refresh: load };
}
