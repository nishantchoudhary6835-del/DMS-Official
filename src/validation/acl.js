import { validateHierarchyLevel } from '@validation/employee';
import { permissionSentence } from '@validation/permission';
import { validatePermissionRef } from '@validation/rolePermission';

export const ACL_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
};

export const ACL_EFFECT = {
  ALLOW: 'ALLOW',
  DENY: 'DENY',
};

export function validateEffect(value) {
  if (!value) return 'Effect is required';
  if (!Object.values(ACL_EFFECT).includes(value)) return 'Select a valid effect';

  return undefined;
}

/**
 * department, team, and employee are all optional per ACL_MODULE.md §3 — the
 * absence of all three is what makes a rule "Global Hierarchy" rather than
 * scoped. Nothing to validate on any of them beyond referential integrity,
 * which the backend already owns.
 */
export function validateAclForm(values, allowedLevels) {
  const errors = {
    hierarchyLevel: validateHierarchyLevel(values.hierarchyLevel, allowedLevels),
    permission: validatePermissionRef(values.permission),
    effect: validateEffect(values.effect),
  };

  const hasError = Object.values(errors).some(Boolean);

  return { errors, hasError };
}

/**
 * Only shown when the backend handed back a populated object — a write
 * response may return the reference bare.
 */
export function permissionRefLabel(permissionRef) {
  if (!permissionRef || typeof permissionRef !== 'object') return null;

  return permissionSentence(permissionRef) || null;
}

function refName(ref, ...fields) {
  if (!ref || typeof ref !== 'object') return null;

  return fields.map((field) => ref[field]).filter(Boolean).join(' ') || null;
}

export function departmentRefLabel(department) {
  return refName(department, 'name');
}

export function teamRefLabel(team) {
  return refName(team, 'name');
}

export function employeeRefLabel(employee) {
  if (!employee || typeof employee !== 'object') return null;

  return (
    [employee.firstName, employee.lastName].filter(Boolean).join(' ') ||
    employee.employeeId ||
    null
  );
}

/**
 * The scope label a rule reads as, per the priority order ACL_MODULE.md §4
 * and ACCESS_CONTROL.md §8 both give: Employee > Team > Department > Global.
 * A rule naming all three still only ever matches on the most specific one
 * present — this just names which tier that is.
 */
export function aclScopeLabel(acl) {
  if (acl?.employee) return 'Employee-specific';
  if (acl?.team) return 'Team-specific';
  if (acl?.department) return 'Department-specific';

  return 'Global';
}

/**
 * A plain-English reading of who a rule narrows down to, for the card where
 * there's no room for separate Department/Team/Employee rows the way the
 * detail screen has. Falls back to the tier name when the reference hasn't
 * come back populated yet.
 */
export function aclScopeDetail(acl) {
  if (acl?.employee) {
    const name = employeeRefLabel(acl.employee);
    return name ? `Only ${name}` : 'One specific employee only';
  }

  if (acl?.team) {
    const name = teamRefLabel(acl.team);
    return name ? `Only the ${name} team` : 'One specific team only';
  }

  if (acl?.department) {
    const name = departmentRefLabel(acl.department);
    return name ? `Only the ${name} department` : 'One specific department only';
  }

  return 'Everyone at this level';
}

/**
 * Unlike Permission and RolePermission, neither ACL doc names a specific
 * duplicate rule — so, deliberately, no 409 guess is pinned to a field here.
 * A conflict just surfaces as the backend's own message.
 */
export function mapAclError(normalized) {
  const message = String(normalized.message ?? '');
  const lower = message.toLowerCase();

  if (lower.includes('permission') && lower.includes('active')) {
    return { fieldErrors: { permission: message }, formError: null };
  }

  if (lower.includes('hierarchy')) {
    return { fieldErrors: { hierarchyLevel: message }, formError: null };
  }

  return { fieldErrors: {}, formError: message };
}
