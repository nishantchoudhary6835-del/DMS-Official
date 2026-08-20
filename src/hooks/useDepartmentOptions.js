import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { normalizeError } from '@utils/errors';
import { DEPARTMENT_STATUS } from '@validation/department';
import * as departmentApi from '@services/department';

// Departments shaped for a Select. Deliberately not cached, unlike
// useHierarchy: they are created and renamed from inside this same app.
export function useDepartmentOptions({ includeInactive = false } = {}) {
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const requestRef = useRef(0);

  const load = useCallback(async () => {
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;

    setIsLoading(true);
    setError(null);

    try {
      const response = await departmentApi.listDepartments();

      if (requestRef.current !== requestId) return;

      setDepartments(Array.isArray(response?.data) ? response.data : []);
    } catch (caught) {
      if (requestRef.current !== requestId) return;

      // A 403 is expected below EXECUTIVE. Not worth shouting about on an
      // employee form — the empty dropdown already says there is nothing.
      const normalized = normalizeError(caught);

      setError(normalized.status === 403 ? null : normalized.message);
      setDepartments([]);
    } finally {
      if (requestRef.current === requestId) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const selectable = useMemo(
    () =>
      includeInactive
        ? departments
        : departments.filter(
            (department) => department.status === DEPARTMENT_STATUS.ACTIVE
          ),
    [departments, includeInactive]
  );

  const options = useMemo(
    () =>
      selectable
        .slice()
        .sort((a, b) => String(a.name ?? '').localeCompare(String(b.name ?? '')))
        .map((department) => ({
          value: department._id,
          label: department.name,
          hint:
            department.status === DEPARTMENT_STATUS.ACTIVE
              ? department.code
              : `${department.code} · Inactive`,
        })),
    [selectable]
  );

  return { options, departments, isLoading, error, refresh: load };
}
