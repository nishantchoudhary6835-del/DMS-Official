import { labelFor } from '@validation/employee';

/**
 * Only PENDING_REVIEW is real today. WORKFLOW_MODULE.md's FRS section shows
 * the full Approve/Return/Escalate lifecycle, but §11–§12 mark all of that as
 * remaining, untested backend work — so this stays a single-entry map rather
 * than guessing at status names that don't exist on the server yet.
 */
export const WORKFLOW_STATUS = {
  PENDING_REVIEW: 'PENDING_REVIEW',
};

const STATUS_LABELS = {
  PENDING_REVIEW: 'Pending Review',
};

function titleCase(value) {
  return String(value)
    .toLowerCase()
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/** Never returns an empty string for a real status — falls through to a
 * title-cased render of whatever the server sends, the same rule
 * @validation/employee's labelFor follows for hierarchy levels. */
export function workflowStatusLabel(status) {
  if (!status) return '';

  return STATUS_LABELS[status] ?? titleCase(status);
}

/**
 * currentLevel is drawn from the same hierarchy enum Employee.hierarchyLevel
 * uses (WORKFLOW_MODULE.md §5's example shows TEAM_LEAD explicitly), so this
 * delegates to the existing hierarchy label table instead of keeping a
 * second one — same reasoning validateRolePermissionForm already documents.
 */
export function workflowLevelLabel(level) {
  return labelFor(level);
}

/**
 * Only shown when the backend handed back a populated object — the same
 * caveat ACL/RolePermission's *RefLabel helpers document. WORKFLOW_MODULE.md
 * doesn't pin down whether `document` always arrives populated on every
 * endpoint, so a card can only name it when given the object.
 */
export function documentRefLabel(documentRef) {
  if (!documentRef || typeof documentRef !== 'object') return null;

  return documentRef.title || null;
}

/** Same populated-object caveat, for currentReviewer / owner / lastActionBy. */
export function employeeRefLabel(employeeRef) {
  if (!employeeRef || typeof employeeRef !== 'object') return null;

  const name = [employeeRef.firstName, employeeRef.lastName]
    .filter(Boolean)
    .join(' ');

  return name || employeeRef.employeeId || null;
}

export function mapWorkflowError(normalized) {
  return { fieldErrors: {}, formError: normalized.message };
}
