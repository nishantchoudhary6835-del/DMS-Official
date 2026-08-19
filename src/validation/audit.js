/**
 * Audit log vocabulary — AUDIT_MODULE.md §3-8.
 *
 * `module` is a real enum on the backend model, so this list is exhaustive
 * and safe to render as a fixed filter row. `action` is NOT — the model
 * declares it as a plain required String, so the values below are only the
 * ones the spec documents today. Anything unrecognised has to keep working,
 * which is why every lookup here falls through to a generated label rather
 * than returning undefined.
 */

/** Backed by an enum in audit.model.js — this is the complete set. */
export const AUDIT_MODULES = [
  'AUTH',
  'DOCUMENT',
  'WORKFLOW',
  'PERMISSION',
  'USER',
];

export const AUDIT_MODULE_LABELS = {
  AUTH: 'Authentication',
  DOCUMENT: 'Documents',
  WORKFLOW: 'Workflow',
  PERMISSION: 'Permissions',
  USER: 'Users',
};

/**
 * Documented actions per module (§4-8). Used to narrow the action filter
 * once a module is chosen; not treated as a closed set when *reading* a log.
 */
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

/**
 * §4 states failed-login auditing is deliberately out of scope, so a
 * FAILED_LOGIN row will never arrive. Recorded here so nobody adds it to the
 * filter list assuming it was an oversight.
 */
export const AUDIT_ACTIONS_NOT_RECORDED = ['FAILED_LOGIN'];

/** Every documented action, for when no module filter is applied. */
export const ALL_AUDIT_ACTIONS = AUDIT_MODULES.flatMap(
  (auditModule) => AUDIT_ACTIONS_BY_MODULE[auditModule] ?? []
);

/**
 * Overrides only. `DOCUMENT_CREATED` reads as "Created" once it is sitting
 * next to a Documents label — repeating the module in the action is noise in
 * a table. Anything absent falls through to titleCase() below.
 */
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

/**
 * Tone is keyed off the action rather than the module, because the action is
 * the part that carries meaning — a rejection should read as a rejection
 * whichever module it came from. The module is rendered as plain text
 * alongside. Only tones that exist in Badge.styles.js are used: neutral,
 * info, accent, success, danger.
 */
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

/**
 * The backend passes `from`/`to` straight into `new Date(...)`, so a partial
 * or malformed string becomes an Invalid Date and silently matches nothing.
 * Requiring a complete YYYY-MM-DD before sending keeps a half-typed date
 * from emptying the table under the user mid-keystroke.
 */
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

/**
 * §16: an empty `logs` array is a successful response meaning "nothing
 * matched", never an error. §27 splits 401 (handled by the axios
 * interceptor) from 403, which is the only one this needs to phrase.
 */
export function mapAuditError(normalized) {
  if (normalized.status === 403) {
    return 'You do not have permission to view audit logs.';
  }

  return normalized.message || 'Unable to load audit logs. Please try again later.';
}
