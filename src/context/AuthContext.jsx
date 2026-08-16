import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  clearStoredUser,
  getStoredUser,
  setStoredUser,
} from '@utils/storage';
import { IS_DEV } from '@config/env';
import * as authApi from '@services/auth';
import * as departmentApi from '@services/department';
import * as employeeApi from '@services/employee';

const AuthContext = createContext(null);

/**
 * There is no hierarchyLevel/role field anywhere in the login response or
 * the JWT (checked against AUTH_FLOW.md) and the one endpoint that could
 * look it up, GET /employee/:id, is itself SUPER_ADMIN-only — so a logged-in
 * user has no way to learn their own role, and neither do we. This infers it
 * indirectly: firing two lightweight requests against endpoints whose
 * authorization is already documented (GET /employee is SUPER_ADMIN-only
 * per EMPLOYEE_MANAGEMENT.md, GET /department is SUPER_ADMIN+EXECUTIVE per
 * DEPARTMENT_MANAGEMENT.md) and reading the result off whether they 200 or
 * 403. Best-effort by nature: it can't tell Governance/Department
 * Head/Manager/Team Lead apart from each other, only "Super Admin" vs
 * "Super Admin or Executive" vs "neither".
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isRestoring, setIsRestoring] = useState(true);
  const [access, setAccess] = useState({ isSuperAdmin: null, isAdminOrAbove: null });

  const applyUser = useCallback(async (userData) => {
    setUser(userData);

    if (userData) {
      await setStoredUser(userData);
    } else {
      await clearStoredUser();
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const stored = await getStoredUser();

      if (cancelled) return;

      if (stored) setUser(stored);
      setIsRestoring(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Re-probes whenever `user` changes identity — a fresh sign-in or the
  // one-time restore-from-storage above — and resets to "unknown" on
  // sign-out rather than leaving a stale role behind for the next session.
  useEffect(() => {
    if (!user) {
      setAccess({ isSuperAdmin: null, isAdminOrAbove: null });
      return;
    }

    let cancelled = false;

    (async () => {
      const [superAdminProbe, adminProbe] = await Promise.allSettled([
        employeeApi.listEmployees(),
        departmentApi.listDepartments(),
      ]);

      if (cancelled) return;

      const isSuperAdmin = superAdminProbe.status === 'fulfilled';

      setAccess({
        isSuperAdmin,
        // Super Admin is authorized everywhere Executive is, so passing the
        // stricter probe implies passing this one too.
        isAdminOrAbove: isSuperAdmin || adminProbe.status === 'fulfilled',
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const signIn = useCallback(
    async (userData) => {
      await applyUser(userData ?? null);
    },
    [applyUser]
  );

  const signOut = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      if (IS_DEV) {
        console.warn('[AuthContext] Server logout failed; clearing locally.', error);
      }
    } finally {
      await applyUser(null);
    }
  }, [applyUser]);

  const onSessionExpired = useCallback(() => {
    applyUser(null);
  }, [applyUser]);

  const value = useMemo(
    () => ({
      user,
      isRestoring,
      isAuthenticated: Boolean(user),
      // null while the access probe hasn't resolved yet (or there's no user) —
      // treat as "not yet proven", not as "no access", when deciding whether
      // to render something briefly.
      isSuperAdmin: access.isSuperAdmin,
      isAdminOrAbove: access.isAdminOrAbove,
      isCheckingAccess: Boolean(user) && access.isSuperAdmin === null,
      signIn,
      signOut,
      onSessionExpired,
    }),
    [user, isRestoring, access, signIn, signOut, onSessionExpired]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>.');
  }

  return context;
}
