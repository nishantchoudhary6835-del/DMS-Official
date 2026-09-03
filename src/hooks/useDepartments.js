import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAppData } from '@context/AppDataContext';
import { useAuth } from '@context/AuthContext';
import { referenceId } from '@utils/format';

const MEMBER_SCOPED_LEVELS = new Set(['MANAGER', 'TEAM', 'EMPLOYEE', 'INTERN']);

// Departments visible to this user, status-filtered client-side (the endpoint
// takes no query parameters). Scoped below admin-or-above/Governance: a
// Department Head sees only the department(s) they head (matched by
// `department.head`, not the employee's own `department` field — naming a
// head does not move that person into the department, the two references
// are stored separately). Manager/Team/Employee/Intern see only the single
// department they personally belong to.
export function useDepartments() {
  const { departments } = useAppData();
  const { user, isAdminOrAbove, hierarchyLevel } = useAuth();
  const [status, setStatus] = useState(null);

  useEffect(() => {
    departments.ensure();
  }, [departments.ensure]);

  const ownEmployee =
    user?.employeeId && typeof user.employeeId === 'object' ? user.employeeId : null;
  const ownEmployeeId = referenceId(user?.employeeId);
  const ownDepartmentId = referenceId(ownEmployee?.department);

  // Fails closed: while isAdminOrAbove/hierarchyLevel are still null
  // (unresolved) this yields an empty list rather than the full one.
  const scoped = useMemo(() => {
    if (isAdminOrAbove === true || hierarchyLevel === 'GOVERNANCE') return departments.data;

    if (hierarchyLevel === 'DEPARTMENT') {
      return departments.data.filter(
        (department) => referenceId(department.head) === ownEmployeeId
      );
    }

    if (MEMBER_SCOPED_LEVELS.has(hierarchyLevel)) {
      return departments.data.filter((department) => department._id === ownDepartmentId);
    }

    return [];
  }, [departments.data, isAdminOrAbove, hierarchyLevel, ownEmployeeId, ownDepartmentId]);

  const visible = useMemo(
    () =>
      status ? scoped.filter((department) => department.status === status) : scoped,
    [scoped, status]
  );

  const toggleStatus = useCallback((value) => {
    setStatus((prev) => (prev === value ? null : value));
  }, []);

  return {
    departments: visible,
    totalCount: scoped.length,
    status,
    toggleStatus,
    isLoading: departments.isLoading,
    isRefreshing: departments.isRefreshing,
    error: departments.error,
    isForbidden: departments.isForbidden,
    refresh: departments.refresh,
  };
}
