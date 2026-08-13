import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { normalizeError } from '@utils/errors';
import { permissionCode, PERMISSION_STATUS } from '@validation/permission';
import * as permissionApi from '@services/permission';

/**
 * Active permissions shaped for a Select — used by RolePermission and ACL
 * forms, both of which need to pick "which permission does this rule cover".
 *
 * Not cached, for the same reason useDepartmentOptions and useTeamOptions
 * aren't: permissions are created and deactivated from inside this app, and
 * a bundle-lifetime cache would hide one just created.
 */
export function usePermissionOptions() {
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const requestRef = useRef(0);

  const load = useCallback(async () => {
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;

    setIsLoading(true);
    setError(null);

    try {
      const response = await permissionApi.listPermissions();

      if (requestRef.current !== requestId) return;

      setPermissions(Array.isArray(response?.data) ? response.data : []);
    } catch (caught) {
      if (requestRef.current !== requestId) return;

      // A 403 here just means the field has nothing to offer — not worth
      // surfacing as a form error on a screen that isn't about permissions.
      const normalized = normalizeError(caught);

      setError(normalized.status === 403 ? null : normalized.message);
      setPermissions([]);
    } finally {
      if (requestRef.current === requestId) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const active = useMemo(
    () => permissions.filter((p) => p.status === PERMISSION_STATUS.ACTIVE),
    [permissions]
  );

  const options = useMemo(
    () =>
      active
        .slice()
        .sort((a, b) => permissionCode(a).localeCompare(permissionCode(b)))
        .map((permission) => ({
          value: permission._id,
          label: permissionCode(permission),
          hint: permission.description || undefined,
        })),
    [active]
  );

  const refresh = useCallback(() => load(), [load]);

  return { options, permissions, isLoading, error, refresh };
}
