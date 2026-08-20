import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

import { normalizeError } from '@utils/errors';
import * as aclApi from '@services/acl';
import * as departmentApi from '@services/department';
import * as documentApi from '@services/document';
import * as employeeApi from '@services/employee';
import * as permissionApi from '@services/permission';
import * as rolePermissionApi from '@services/rolePermission';
import * as teamApi from '@services/team';
import * as userApi from '@services/user';
import * as workflowApi from '@services/workflow';

const AppDataContext = createContext(null);

// One shared copy of each entity's full list, fetched lazily on first `ensure()`
// and reused, so two screens wanting the same list make one request, not two.
function useListResource(fetcher, forbiddenMessage) {
  // isLoading starts true: ensure() only runs after the first commit, and a
  // frame of isLoading=false flashed the unrestricted layout on account switch.
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

  // Marks the cache stale so the next `ensure()` really refetches — a mutation
  // made from a screen the list is not mounted under would otherwise be missed.
  const invalidate = useCallback(() => {
    hasLoadedRef.current = false;
    setState((prev) => ({ ...prev, hasLoaded: false }));
  }, []);

  return useMemo(
    () => ({ ...state, ensure, refresh, invalidate }),
    [state, ensure, refresh, invalidate]
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
  const documents = useListResource(
    documentApi.listDocuments,
    'You are not authorized to view documents.'
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
      documents,
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
      documents,
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
