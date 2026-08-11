import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { normalizeError } from '@utils/errors';
import { DEPARTMENT_STATUS } from '@validation/department';
import * as departmentApi from '@services/department';

/**
 * Departments shaped for a Select.
 *
 * Deliberately not cached, unlike useHierarchy. Hierarchy levels are seeded
 * configuration that nothing in this app can change, so caching them for the
 * life of the bundle is free. Departments are created, renamed and deactivated
 * from inside this same app — a bundle-lifetime cache would mean a department
 * you just created is missing from the next form you open. One fetch per mount
 * is the same trade useEmployeeOptions already makes.
 *
 * There is also no fallback list. A hierarchy level has a known seed to fall
 * back to; a department does not, and inventing one would be fabricating data.
 * If the fetch fails the dropdown is empty, which is exactly where the employee
 * form stood before this module existed.
 */
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

      // A 403 is expected for anyone below EXECUTIVE. It is not an error worth
      // shouting about on an employee form — the field simply has nothing to
      // offer, which the empty dropdown already communicates.
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

  // The ids a form may select, for grandfathering an already-assigned
  // department that has since been deactivated.
  const activeIds = useMemo(
    () => selectable.map((department) => department._id),
    [selectable]
  );

  return { options, activeIds, departments, isLoading, error, refresh: load };
}
