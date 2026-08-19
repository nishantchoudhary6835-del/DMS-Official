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
 * Levels that may see the Administration section (see navigation.js's
 * ADMIN_OR_ABOVE gate). Deliberately just these two, which is exactly what
 * the previous probe-based check granted — GOVERNANCE sits above EXECUTIVE
 * in the hierarchy and arguably belongs here, but adding it would hand a
 * level access it does not have today, and the screens behind the gate are
 * ACL-checked server-side regardless. Left out until someone confirms it.
 */
const ADMIN_OR_ABOVE_LEVELS = new Set(['SUPER_ADMIN', 'EXECUTIVE']);

/**
 * The login response populates `employeeId` into a full Employee object,
 * `hierarchyLevel` included. Returns null when that isn't available — a user
 * restored from storage after a session that predates that backend change
 * still has the old flat ObjectId string, and would otherwise silently lose
 * their role on the next launch.
 */
function hierarchyLevelOf(user) {
  const employee = user?.employeeId;

  if (!employee || typeof employee !== 'object') return null;

  return employee.hierarchyLevel ?? null;
}

/**
 * `{ isSuperAdmin, isAdminOrAbove }` for a signed-in user, or null when their
 * record carries no hierarchyLevel to read — meaning the caller has to fall
 * back to probing. Exported so the rule can be exercised directly; the
 * provider below is the only production caller.
 */
export function deriveAccess(user) {
  const level = hierarchyLevelOf(user);

  if (!level) return null;

  return {
    isSuperAdmin: level === 'SUPER_ADMIN',
    isAdminOrAbove: ADMIN_OR_ABOVE_LEVELS.has(level),
  };
}

/**
 * Access is read straight off `user.employeeId.hierarchyLevel`, which the
 * login response has carried since the backend started populating the
 * employee reference.
 *
 * It used to be inferred instead, by firing GET /employee and GET /department
 * and reading the role off whether they returned 200 or 403. That was written
 * when no role field existed anywhere in the login response or the JWT, and
 * it has since become actively wrong rather than merely wasteful: both of
 * those routes are now gated by `accessControl(...)` — the configurable
 * Permission -> RolePermission -> ACL engine — not by a fixed hierarchy
 * check. So the probe was reading a runtime permission grant and reporting it
 * as a role. Grant EMPLOYEE.VIEW to an ordinary employee and they would have
 * been detected as Super Admin; revoke it from a Super Admin and they would
 * have been detected as neither.
 *
 * Reading the field directly also costs two fewer round trips per session
 * start, and distinguishes all nine levels rather than only "Super Admin" vs
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

  // Re-evaluates whenever `user` changes identity — a fresh sign-in or the
  // one-time restore-from-storage above — and resets to "unknown" on
  // sign-out rather than leaving a stale role behind for the next session.
  useEffect(() => {
    if (!user) {
      setAccess({ isSuperAdmin: null, isAdminOrAbove: null });
      return;
    }

    const derived = deriveAccess(user);

    if (derived) {
      setAccess(derived);
      return;
    }

    // No hierarchyLevel to read — a user restored from storage that predates
    // the populated-employeeId login response. Fall back to the old probe so
    // that session keeps working until its next sign-in refreshes the shape.
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
