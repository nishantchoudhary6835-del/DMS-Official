// Audit log vocabulary — AUDIT_MODULE.md §3-8. `module` is a real enum, so
// this list is exhaustive; `action` is a plain String, so lookups fall through.

/** Backed by an enum in audit.model.js — this is the complete set. */
export const AUDIT_MODULES = [
  'AUTH',
  'DOCUMENT',
  'WORKFLOW',
  'PERMISSION',
  'USER',
];

const AUDIT_MODULE_LABELS = {
  AUTH: 'Authentication',
  DOCUMENT: 'Documents',
  WORKFLOW: 'Workflow',
  PERMISSION: 'Permissions',
  USER: 'Users',
};

// Documented actions per module (§4-8). Narrows the action filter once a
// module is chosen; not a closed set when *reading* a log.
export const AUDIT_ACTIONS_BY_MODULE = {
  AUTH: ['LOGIN', 'LOGOUT', 'PASSWORD_RESET'],
  DOCUMENT: [
    'DOCUMENT_CREATED',
    'DOCUMENT_VIEWED',
    'DOCUMENT_EDITED',
    'DOCUMENT_VERSION_CREATED',
    'DOCUMENT_ARCHIVED',
  ],
  WORKFLOW: [
    'SUBMITTED',
    'APPROVED',
    'RETURNED',
    'REJECTED',
    'RESUBMITTED',
    'ESCALATED',
  ],
  PERMISSION: [
    'PERMISSION_CHANGED',
    'ROLE_PERMISSION_CHANGED',
    'ACL_CHANGED',
  ],
  USER: ['USER_CREATED', 'USER_CHANGED'],
};

// Every documented action, for when no module filter is applied. FAILED_LOGIN
// is absent by design: §4 puts failed-login auditing out of scope.
export const ALL_AUDIT_ACTIONS = AUDIT_MODULES.flatMap(
  (auditModule) => AUDIT_ACTIONS_BY_MODULE[auditModule] ?? []
);

// Overrides only: DOCUMENT_CREATED reads as "Created" beside a Documents
// label. Anything absent falls through to titleCase() below.
const AUDIT_ACTION_LABELS = {
  LOGIN: 'Signed in',
  LOGOUT: 'Signed out',
  PASSWORD_RESET: 'Password reset',
  DOCUMENT_CREATED: 'Created',
  DOCUMENT_VIEWED: 'Viewed',
  DOCUMENT_EDITED: 'Edited',
  DOCUMENT_VERSION_CREATED: 'New version',
  DOCUMENT_ARCHIVED: 'Archived',
  SUBMITTED: 'Submitted',
  APPROVED: 'Approved',
  RETURNED: 'Returned',
  REJECTED: 'Rejected',
  RESUBMITTED: 'Resubmitted',
  ESCALATED: 'Escalated',
  PERMISSION_CHANGED: 'Permission changed',
  ROLE_PERMISSION_CHANGED: 'Role assignment changed',
  ACL_CHANGED: 'Access rule changed',
  USER_CREATED: 'Account created',
  USER_CHANGED: 'Account changed',
};

function titleCase(value) {
  return String(value ?? '')
    .toLowerCase()
    .split('_')
    .filter(Boolean)
    .map((word, index) =>
      index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word
    )
    .join(' ');
}

export function auditModuleLabel(auditModule) {
  if (!auditModule) return '—';
  return AUDIT_MODULE_LABELS[auditModule] ?? titleCase(auditModule);
}

export function auditActionLabel(action) {
  if (!action) return '—';
  return AUDIT_ACTION_LABELS[action] ?? titleCase(action);
}

// Keyed off the action, not the module — a rejection should read as one
// whichever module it came from. Only tones Badge.styles.js defines.
export function auditActionTone(action) {
  switch (action) {
    case 'REJECTED':
      return 'danger';

    case 'APPROVED':
      return 'success';

    case 'RETURNED':
    case 'ESCALATED':
    case 'DOCUMENT_ARCHIVED':
      return 'accent';

    // Authorization changes are the ones an auditor is most likely hunting
    // for, so they get the loudest remaining tone.
    case 'PERMISSION_CHANGED':
    case 'ROLE_PERMISSION_CHANGED':
    case 'ACL_CHANGED':
      return 'danger';

    case 'LOGIN':
    case 'LOGOUT':
    case 'PASSWORD_RESET':
      return 'info';

    default:
      return 'neutral';
  }
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// The backend feeds from/to straight into `new Date(...)`, so a half-typed
// date becomes an Invalid Date and silently matches nothing.
export function isCompleteDateInput(value) {
  const trimmed = String(value ?? '').trim();

  if (!trimmed) return false;
  if (!DATE_PATTERN.test(trimmed)) return false;

  return !Number.isNaN(new Date(trimmed).getTime());
}

export function validateDateInput(value) {
  const trimmed = String(value ?? '').trim();

  if (!trimmed) return undefined;
  if (!isCompleteDateInput(trimmed)) return 'Use YYYY-MM-DD';

  return undefined;
}

export function validateDateRange(from, to) {
  if (!isCompleteDateInput(from) || !isCompleteDateInput(to)) return undefined;
  if (new Date(from) <= new Date(to)) return undefined;

  return 'Start date is after the end date';
}

// §16: an empty `logs` array means "nothing matched", never an error. 401 is
// the axios interceptor's; 403 is the only one worth phrasing here.
export function mapAuditError(normalized) {
  if (normalized.status === 403) {
    return 'You do not have permission to view audit logs.';
  }

  return normalized.message || 'Unable to load audit logs. Please try again later.';
}
