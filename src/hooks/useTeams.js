import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAppData } from '@context/AppDataContext';
import { useAuth } from '@context/AuthContext';
import { referenceId } from '@utils/format';

const MEMBER_SCOPED_LEVELS = new Set(['MANAGER', 'EMPLOYEE', 'INTERN']);

// Teams visible to this user, filtered client-side. The full list is shared
// via AppDataContext rather than sent back as query params per filter
// change. Scoped below admin-or-above/Governance: a Team Lead sees only the
// team(s) they lead (matched by `team.teamLead`, not the employee's own
// `team` field — a separate, independently-maintained reference).
// Manager/Team/Employee/Intern see only the single team they personally
// belong to.
export function useTeams() {
  const { teams } = useAppData();
  const { user, isAdminOrAbove, hierarchyLevel } = useAuth();
  const [filters, setFilters] = useState({});

  useEffect(() => {
    teams.ensure();
  }, [teams.ensure]);

  const ownEmployee =
    user?.employeeId && typeof user.employeeId === 'object' ? user.employeeId : null;
  const ownEmployeeId = referenceId(user?.employeeId);
  const ownTeamId = referenceId(ownEmployee?.team);

  // Fails closed: while isAdminOrAbove/hierarchyLevel are still null
  // (unresolved) this yields an empty list rather than the full one.
  const scoped = useMemo(() => {
    if (isAdminOrAbove === true || hierarchyLevel === 'GOVERNANCE') return teams.data;

    if (hierarchyLevel === 'TEAM_LEAD') {
      return teams.data.filter((team) => referenceId(team.teamLead) === ownEmployeeId);
    }

    if (MEMBER_SCOPED_LEVELS.has(hierarchyLevel)) {
      return teams.data.filter((team) => team._id === ownTeamId);
    }

    return [];
  }, [teams.data, isAdminOrAbove, hierarchyLevel, ownEmployeeId, ownTeamId]);

  const visible = useMemo(
    () =>
      scoped.filter((team) => {
        if (
          filters.department &&
          referenceId(team.department) !== filters.department
        ) {
          return false;
        }
        if (filters.status && team.status !== filters.status) return false;
        return true;
      }),
    [scoped, filters]
  );

  const toggleFilter = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key] === value ? undefined : value,
    }));
  }, []);

  const clearFilters = useCallback(() => setFilters({}), []);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return {
    teams: visible,
    filters,
    activeFilterCount,
    isLoading: teams.isLoading,
    isRefreshing: teams.isRefreshing,
    error: teams.error,
    isForbidden: teams.isForbidden,
    toggleFilter,
    clearFilters,
    refresh: teams.refresh,
  };
}
