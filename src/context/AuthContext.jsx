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
import { FALLBACK_HIERARCHY_LEVELS } from '@validation/employee';
import { IS_DEV } from '@config/env';
import * as authApi from '@services/auth';
import * as departmentApi from '@services/department';
import * as employeeApi from '@services/employee';

const AuthContext = createContext(null);

// Levels that may see the Administration section. GOVERNANCE arguably belongs
// too, but adding it would grant access it does not have today.
const ADMIN_OR_ABOVE_LEVELS = new Set(['SUPER_ADMIN', 'EXECUTIVE']);

// Rank by position in the seeded hierarchy — lower means more authority.
// Derived from FALLBACK_HIERARCHY_LEVELS so the two lists cannot desync.
const HIERARCHY_RANK = FALLBACK_HIERARCHY_LEVELS.reduce(
  (ranks, level, index) => ({ ...ranks, [level]: index }),
  {}
);

// Reviewing is supervisory: nothing is ever routed below TEAM_LEAD. Note TEAM
// sits *below* TEAM_LEAD despite the similar name, and is correctly excluded.
function isAtOrAbove(level, floor) {
  const rank = HIERARCHY_RANK[level];
  const floorRank = HIERARCHY_RANK[floor];

  if (rank === undefined || floorRank === undefined) return false;

  return rank <= floorRank;
}

// Null when `employeeId` is not a populated object — a session restored from
// storage predating that backend change would otherwise lose its role.
function hierarchyLevelOf(user) {
  const employee = user?.employeeId;

  if (!employee || typeof employee !== 'object') return null;

  return employee.hierarchyLevel ?? null;
}

// `{ isSuperAdmin, isAdminOrAbove }`, or null when the record carries no
// hierarchyLevel to read and the caller has to fall back to probing.
function deriveAccess(user) {
  const level = hierarchyLevelOf(user);

  if (!level) return null;

  return {
    isSuperAdmin: level === 'SUPER_ADMIN',
    isAdminOrAbove: ADMIN_OR_ABOVE_LEVELS.has(level),
    isTeamLeadOrAbove: isAtOrAbove(level, 'TEAM_LEAD'),
  };
}

// Read straight off `user.employeeId.hierarchyLevel`. Inferring it from whether
// /employee and /department 403'd reported a runtime grant as a role.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isRestoring, setIsRestoring] = useState(true);
  const [access, setAccess] = useState({ isSuperAdmin: null, isAdminOrAbove: null, isTeamLeadOrAbove: null });

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

      if (!stored) {
        setIsRestoring(false);
        return;
      }

      // `stored` is only a display cache — the real session lives in the
      // httpOnly cookie. Confirm it is still valid (and still this account's)
      // before ever painting it, instead of showing it optimistically and
      // only correcting it after some later request happens to 401. That gap
      // is what let a stale or previously-signed-in account flash on load.
      try {
        await authApi.refreshSession();
        if (cancelled) return;
        setUser(stored);
      } catch {
        if (cancelled) return;
        await clearStoredUser();
      } finally {
        if (!cancelled) setIsRestoring(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Re-evaluates whenever `user` changes identity, and resets to "unknown" on
  // sign-out rather than leaving a stale role behind.
  useEffect(() => {
    if (!user) {
      setAccess({ isSuperAdmin: null, isAdminOrAbove: null, isTeamLeadOrAbove: null });
      return;
    }

    const derived = deriveAccess(user);

    if (derived) {
      setAccess(derived);
      return;
    }

    // No hierarchyLevel to read — a stored session predating the populated
    // login response. Fall back to the probe until its next sign-in.
    let cancelled = false;

    (async () => {
      const [superAdminProbe, adminProbe] = await Promise.allSettled([
        employeeApi.listEmployees(),
        departmentApi.listDepartments(),
      ]);

      if (cancelled) return;

      const isSuperAdmin = superAdminProbe.status === 'fulfilled';
      const isAdminOrAbove =
        // Super Admin is authorized everywhere Executive is, so passing the
        // stricter probe implies passing this one too.
        isSuperAdmin || adminProbe.status === 'fulfilled';

      setAccess({
        isSuperAdmin,
        isAdminOrAbove,
        // The probe cannot tell a Team Lead from an Intern, so it under-reports
        // rather than guessing. Self-heals on the next sign-in.
        isTeamLeadOrAbove: isAdminOrAbove,
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
      // null while the probe hasn't resolved (or there's no user) — "not yet
      // proven", not "no access", when deciding whether to render.
      isSuperAdmin: access.isSuperAdmin,
      isAdminOrAbove: access.isAdminOrAbove,
      isTeamLeadOrAbove: access.isTeamLeadOrAbove,
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
