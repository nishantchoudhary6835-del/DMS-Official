import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAppData } from '@context/AppDataContext';
import { referenceId } from '@utils/format';

/**
 * All teams, filtered client-side. Previously sent department/teamLead/
 * status to the server as query params — now the full list is shared via
 * AppDataContext, so filtering happens here instead, the same way
 * useDepartments already worked.
 */
export function useTeams() {
  const { teams } = useAppData();
  const [filters, setFilters] = useState({});

  useEffect(() => {
    teams.ensure();
  }, [teams.ensure]);

  const visible = useMemo(
    () =>
      teams.data.filter((team) => {
        if (
          filters.department &&
          referenceId(team.department) !== filters.department
        ) {
          return false;
        }
        if (
          filters.teamLead &&
          referenceId(team.teamLead) !== filters.teamLead
        ) {
          return false;
        }
        if (filters.status && team.status !== filters.status) return false;
        return true;
      }),
    [teams.data, filters]
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
