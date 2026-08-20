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

// Hierarchy validity is delegated to @validation/employee rather than copied —
// the live GET /hierarchy list wins over either doc's differing enumeration.
export function validateRolePermissionForm(values, allowedLevels) {
  const errors = {
    hierarchyLevel: validateHierarchyLevel(values.hierarchyLevel, allowedLevels),
    permission: validatePermissionRef(values.permission),
  };

  const hasError = Object.values(errors).some(Boolean);

  return { errors, hasError };
}

// Only shown when the backend handed back a populated object — create/list
// may return the reference bare.
export function permissionRefLabel(permissionRef) {
  if (!permissionRef || typeof permissionRef !== 'object') return null;

  return permissionSentence(permissionRef) || null;
}

// §5 documents one duplicate rule: the same permission twice on one hierarchy.
// Pinned to `permission`; hierarchyLevel is a dropdown with nothing to fix.
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
