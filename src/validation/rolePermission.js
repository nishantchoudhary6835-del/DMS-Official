import { validateHierarchyLevel } from '@validation/employee';
import { permissionSentence } from '@validation/permission';

export const ROLE_PERMISSION_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
};

export function validatePermissionRef(value) {
  if (!value) return 'Permission is required';

  return undefined;
}

/**
 * Hierarchy validity is delegated to @validation/employee rather than
 * duplicated here — ROLE_PERMISSION_MODULE.md's hierarchy list matches
 * FALLBACK_HIERARCHY_LEVELS exactly, and this app already sources the live
 * list from GET /hierarchy (useHierarchy) instead of keeping a second copy.
 * (ACCESS_CONTROL.md gives a differing list — DEPARTMENT_HEAD instead of
 * DEPARTMENT, no TEAM — which conflicts with ROLE_PERMISSION_MODULE.md's own
 * list; the live, tested endpoint wins over either doc.)
 */
export function validateRolePermissionForm(values, allowedLevels) {
  const errors = {
    hierarchyLevel: validateHierarchyLevel(values.hierarchyLevel, allowedLevels),
    permission: validatePermissionRef(values.permission),
  };

  const hasError = Object.values(errors).some(Boolean);

  return { errors, hasError };
}

/**
 * Only shown when the backend handed back a populated object — the same
 * caveat as Team's departmentLabel/leadName: create/list may return the
 * reference bare, so a card can only name it when given the object.
 */
export function permissionRefLabel(permissionRef) {
  if (!permissionRef || typeof permissionRef !== 'object') return null;

  return permissionSentence(permissionRef) || null;
}

/**
 * Routes a backend error to the field most likely responsible.
 *
 * ROLE_PERMISSION_MODULE.md §5 documents one duplicate rule: the same
 * permission cannot be assigned twice to the same hierarchy. Pinned to
 * `permission` since hierarchyLevel is a closed dropdown with nothing to fix.
 */
export function mapRolePermissionError(normalized) {
  const message = String(normalized.message ?? '');
  const lower = message.toLowerCase();

  if (
    normalized.status === 409 ||
    lower.includes('already exists') ||
    lower.includes('duplicate')
  ) {
    return { fieldErrors: { permission: message }, formError: null };
  }

  if (lower.includes('not active') && lower.includes('permission')) {
    return { fieldErrors: { permission: message }, formError: null };
  }

  return { fieldErrors: {}, formError: message };
}
