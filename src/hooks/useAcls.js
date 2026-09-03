import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAppData } from '@context/AppDataContext';
import { referenceId } from '@utils/format';
import { aclScopeTier } from '@validation/acl';

// All ACL rules, filtered client-side across every dimension GET /acl
// documents (ACL_MODULE.md §8.1) — the app fetches the full cached list once
// via AppDataContext rather than sending these as query params, same as the
// rest of the app's admin lists.
export function useAcls() {
  const { acls } = useAppData();
  const [filters, setFilters] = useState({});

  useEffect(() => {
    acls.ensure();
  }, [acls.ensure]);

  const visible = useMemo(
    () =>
      acls.data.filter((acl) => {
        if (filters.status && acl.status !== filters.status) return false;
        if (filters.effect && acl.effect !== filters.effect) return false;
        if (filters.hierarchyLevel && acl.hierarchyLevel !== filters.hierarchyLevel) {
          return false;
        }
        if (filters.scope && aclScopeTier(acl) !== filters.scope) return false;
        if (filters.permission && referenceId(acl.permission) !== filters.permission) {
          return false;
        }
        if (filters.department && referenceId(acl.department) !== filters.department) {
          return false;
        }
        if (filters.team && referenceId(acl.team) !== filters.team) return false;
        if (filters.employee && referenceId(acl.employee) !== filters.employee) return false;
        return true;
      }),
    [acls.data, filters]
  );

  const toggleFilter = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key] === value ? undefined : value,
    }));
  }, []);

  // Select-driven filters (Permission/Department/Team/Employee) set directly
  // rather than toggle — a dropdown always names an intentional value or
  // clears to none, unlike a chip re-tapped to undo itself.
  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }));
  }, []);

  const clearFilters = useCallback(() => setFilters({}), []);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return {
    acls: visible,
    totalCount: acls.data.length,
    filters,
    activeFilterCount,
    toggleFilter,
    setFilter,
    clearFilters,
    isLoading: acls.isLoading,
    isRefreshing: acls.isRefreshing,
    error: acls.error,
    isForbidden: acls.isForbidden,
    refresh: acls.refresh,
  };
}
