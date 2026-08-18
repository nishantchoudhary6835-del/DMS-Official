import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

import { normalizeError } from '@utils/errors';
import * as aclApi from '@services/acl';
import * as departmentApi from '@services/department';
import * as employeeApi from '@services/employee';
import * as permissionApi from '@services/permission';
import * as rolePermissionApi from '@services/rolePermission';
import * as teamApi from '@services/team';
import * as userApi from '@services/user';
import * as workflowApi from '@services/workflow';

const AppDataContext = createContext(null);

/**
 * One shared place to hold each entity's full list, instead of every screen
 * that needs one firing its own independent GET. The per-entity hooks
 * (useDepartments, useEmployees, useTeams, useUsers, usePermissions,
 * useRolePermissions, useAcls, usePendingWorkflows, useMySubmissions) read
 * from here and layer their own local filtering/derivation on top exactly as
 * before — this only changes where the raw list comes from, not any
 * screen's filtering behaviour.
 *
 * Fetched lazily, once, on whichever screen asks for a resource first
 * (`ensure`), then shared — a later screen asking for the same resource
 * gets the cached result instantly instead of re-fetching. `refresh` forces
 * a real reload; every list screen still calls this on focus (via
 * useFocusEffect, unchanged), so the freshness behaviour a user sees is the
 * same as before — the only thing that's gone is two screens/hooks wanting
 * the same list firing two separate requests for it.
 *
 * Deliberately NOT included: detail-by-id fetches and parameter-scoped
 * dropdown queries (team options scoped to one department, manager options
 * excluding one employee, etc.). Forcing those through a single shared list
 * would mean re-deriving each one's exact filtering rule by hand with every
 * edge case re-verified — safer to leave those as their own direct,
 * already-deduped requests (see dedupedGet in axiosInstance.js) than risk a
 * subtly wrong derived result.
 *
 * Employees and Teams are the one real behaviour change: their list hooks
 * used to send filters to the server (GET /employee?status=..., GET
 * /team?department=...) so each filter combination was its own request.
 * Now the full unfiltered list is fetched once and filtered client-side,
 * matching how useDepartments/usePermissions/useRolePermissions/useAcls
 * already worked (their endpoints take no query params at all). Safe at
 * this app's current data volumes, and it makes changing a filter chip
 * instant instead of a network round trip.
 */
function useListResource(fetcher, forbiddenMessage) {
  // isLoading starts true, not false: every consumer calls ensure() from a
  // useEffect, which only fires after the first render commits. Starting
  // false left a one-render gap — right after AppDataProvider remounts on
  // account switch (see ScopedAppData in AppProviders.jsx) — where
  // isLoading/isForbidden both read as false before ensure() has even run,
  // which looks identical to "confirmed, nothing to hide" to any consumer
  // gating on `!isLoading && !isForbidden`. That flashed the full,
  // unrestricted card layout for one frame on every account switch,
  // regardless of the new account's real access.
  const [state, setState] = useState({
    data: [],
    isLoading: true,
    isRefreshing: false,
    error: null,
    isForbidden: false,
    hasLoaded: false,
  });

  const requestRef = useRef(0);
  const inFlightRef = useRef(null);
  const hasLoadedRef = useRef(false);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const load = useCallback(({ refresh = false } = {}) => {
    if (inFlightRef.current && !refresh) return inFlightRef.current;

    const requestId = requestRef.current + 1;
    requestRef.current = requestId;

    setState((prev) => ({
      ...prev,
      isLoading: refresh ? prev.isLoading : !prev.hasLoaded,
      isRefreshing: refresh,
      error: null,
      isForbidden: false,
    }));

    const promise = fetcherRef
      .current()
      .then((response) => {
        if (requestRef.current !== requestId) return;

        hasLoadedRef.current = true;
        setState({
          data: Array.isArray(response?.data) ? response.data : [],
          isLoading: false,
          isRefreshing: false,
          error: null,
          isForbidden: false,
          hasLoaded: true,
        });
      })
      .catch((caught) => {
        if (requestRef.current !== requestId) return;

        const normalized = normalizeError(caught);
        const isForbidden = normalized.status === 403;

        hasLoadedRef.current = true;
        setState({
          data: [],
          isLoading: false,
          isRefreshing: false,
          error: isForbidden ? (forbiddenMessage ?? null) : normalized.message,
          isForbidden,
          hasLoaded: true,
        });
      });

    inFlightRef.current = promise;
    promise.finally(() => {
      if (inFlightRef.current === promise) inFlightRef.current = null;
    });

    return promise;
  }, [forbiddenMessage]);

  // Stable for the resource's lifetime — safe as a useEffect dependency in
  // every consumer without re-triggering once the first fetch has resolved.
  const ensure = useCallback(() => {
    if (!hasLoadedRef.current && !inFlightRef.current) load();
  }, [load]);

  const refresh = useCallback(() => load({ refresh: true }), [load]);

  return useMemo(
    () => ({ ...state, ensure, refresh }),
    [state, ensure, refresh]
  );
}

export function AppDataProvider({ children }) {
  const departments = useListResource(
    departmentApi.listDepartments,
    'You are not authorized to view departments.'
  );
  const employees = useListResource(
    () => employeeApi.listEmployees(),
    'You are not authorized to view employees.'
  );
  const teams = useListResource(
    () => teamApi.listTeams(),
    'You are not authorized to view teams.'
  );
  const users = useListResource(
    userApi.listUsers,
    'You are not authorized to view accounts.'
  );
  const permissions = useListResource(
    permissionApi.listPermissions,
    'You are not authorized to view permissions.'
  );
  const rolePermissions = useListResource(
    rolePermissionApi.listRolePermissions,
    'You are not authorized to view role assignments.'
  );
  const acls = useListResource(
    aclApi.listAcls,
    'You are not authorized to view access rules.'
  );
  const pendingWorkflows = useListResource(
    workflowApi.listPendingWorkflows,
    'You are not authorized to view pending approvals.'
  );
  const mySubmissions = useListResource(
    workflowApi.listMySubmissions,
    'You are not authorized to view your submissions.'
  );

  const value = useMemo(
    () => ({
      departments,
      employees,
      teams,
      users,
      permissions,
      rolePermissions,
      acls,
      pendingWorkflows,
      mySubmissions,
    }),
    [
      departments,
      employees,
      teams,
      users,
      permissions,
      rolePermissions,
      acls,
      pendingWorkflows,
      mySubmissions,
    ]
  );

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);

  if (!context) {
    throw new Error('useAppData must be used inside <AppDataProvider>.');
  }

  return context;
}
