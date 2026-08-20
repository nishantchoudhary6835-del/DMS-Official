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

function validateEffect(value) {
  if (!value) return 'Effect is required';
  if (!Object.values(ACL_EFFECT).includes(value)) return 'Select a valid effect';

  return undefined;
}

// department/team/employee are all optional (§3) — the absence of all three
// is what makes a rule "Global Hierarchy". Referential integrity is backend's.
export function validateAclForm(values, allowedLevels) {
  const errors = {
    hierarchyLevel: validateHierarchyLevel(values.hierarchyLevel, allowedLevels),
    permission: validatePermissionRef(values.permission),
    effect: validateEffect(values.effect),
  };

  const hasError = Object.values(errors).some(Boolean);

  return { errors, hasError };
}

// Only when the backend handed back a populated object — a write response
// may return the reference bare.
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

// The tier a rule matches on, per §4's priority order: Employee > Team >
// Department > Global. Naming all three still matches only the narrowest.
export function aclScopeLabel(acl) {
  if (acl?.employee) return 'Employee-specific';
  if (acl?.team) return 'Team-specific';
  if (acl?.department) return 'Department-specific';

  return 'Global';
}

// Plain-English reading of who a rule narrows to, for the card with no room
// for separate rows. Falls back to the tier name if not yet populated.
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

// Neither ACL doc names a specific duplicate rule, so no 409 guess is pinned
// to a field here — a conflict surfaces as the backend's own message.
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
