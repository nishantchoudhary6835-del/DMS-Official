import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAppData } from '@context/AppDataContext';

// All departments, status-filtered client-side (the endpoint takes no query
// parameters).
export function useDepartments() {
  const { departments } = useAppData();
  const [status, setStatus] = useState(null);

  useEffect(() => {
    departments.ensure();
  }, [departments.ensure]);

  const visible = useMemo(
    () =>
      status
        ? departments.data.filter((department) => department.status === status)
        : departments.data,
    [departments.data, status]
  );

  const toggleStatus = useCallback((value) => {
    setStatus((prev) => (prev === value ? null : value));
  }, []);

  return {
    departments: visible,
    totalCount: departments.data.length,
    status,
    toggleStatus,
    isLoading: departments.isLoading,
    isRefreshing: departments.isRefreshing,
    error: departments.error,
    isForbidden: departments.isForbidden,
    refresh: departments.refresh,
  };
}
