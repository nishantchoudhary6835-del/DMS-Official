import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAppData } from '@context/AppDataContext';
import { referenceId } from '@utils/format';
import { normalizeHierarchyLevel } from '@validation/employee';

// All employees, filtered client-side. The full list is shared via
// AppDataContext rather than sent back as query params per filter change.
export function useEmployees() {
  const { employees } = useAppData();
  const [filters, setFilters] = useState({});

  useEffect(() => {
    employees.ensure();
  }, [employees.ensure]);

  const visible = useMemo(
    () =>
      employees.data.filter((employee) => {
        if (
          filters.hierarchyLevel &&
          normalizeHierarchyLevel(employee.hierarchyLevel) !==
            normalizeHierarchyLevel(filters.hierarchyLevel)
        ) {
          return false;
        }
        if (
          filters.department &&
          referenceId(employee.department) !== filters.department
        ) {
          return false;
        }
        if (filters.team && referenceId(employee.team) !== filters.team) {
          return false;
        }
        if (filters.status && employee.status !== filters.status) return false;
        return true;
      }),
    [employees.data, filters]
  );

  const toggleFilter = useCallback((key, value) => {
    setFilters((prev) => {
      const next = {
        ...prev,
        [key]: prev[key] === value ? undefined : value,
      };

      // Teams are listed per department, so a team filter left behind by a
      // department change would keep filtering invisibly. Drop it with its parent.
      if (key === 'department' && next.department !== prev.department) {
        next.team = undefined;
      }

      return next;
    });
  }, []);

  const clearFilters = useCallback(() => setFilters({}), []);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return {
    employees: visible,
    filters,
    activeFilterCount,
    isLoading: employees.isLoading,
    isRefreshing: employees.isRefreshing,
    error: employees.error,
    isForbidden: employees.isForbidden,
    toggleFilter,
    clearFilters,
    refresh: employees.refresh,
  };
}
