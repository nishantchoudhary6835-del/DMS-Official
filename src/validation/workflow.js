import { labelFor } from '@validation/employee';

// §31 marks the full lifecycle implemented, so this covers every
// workflow.status §3/§24 name (COMPLETED is terminal, not a level).
export const WORKFLOW_STATUS = {
  PENDING_REVIEW: 'PENDING_REVIEW',
  REVISION: 'REVISION',
  REJECTED: 'REJECTED',
  COMPLETED: 'COMPLETED',
};

const STATUS_LABELS = {
  PENDING_REVIEW: 'Pending Review',
  REVISION: 'Needs Revision',
  REJECTED: 'Rejected',
  COMPLETED: 'Completed',
};

/** Badge tones confirmed available in Badge.styles.js — no 'warning' tone exists. */
const STATUS_TONES = {
  PENDING_REVIEW: 'info',
  REVISION: 'accent',
  REJECTED: 'danger',
  COMPLETED: 'success',
};

export function workflowStatusTone(status) {
  return STATUS_TONES[status] ?? 'neutral';
}

function titleCase(value) {
  return String(value)
    .toLowerCase()
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Never empty for a real status — falls through to a title-cased render, the
// same rule @validation/employee's labelFor follows.
export function workflowStatusLabel(status) {
  if (!status) return '';

  return STATUS_LABELS[status] ?? titleCase(status);
}

// currentLevel draws on the same hierarchy enum as Employee.hierarchyLevel,
// so this delegates to that label table instead of keeping a second one.
export function workflowLevelLabel(level) {
  return labelFor(level);
}

// Only shown when the backend handed back a populated object — the docs don't
// pin down whether `document` arrives populated on every endpoint.
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

// The backend 400s on RETURN/REJECT with an empty reviewComment; checked here
// so the request never round-trips just to fail validation. APPROVE ignores it.
export function validateReviewComment(action, reviewComment) {
  if (action !== 'RETURN' && action !== 'REJECT') return undefined;

  if (!String(reviewComment ?? '').trim()) {
    return 'A comment is required when returning or rejecting a document.';
  }

  return undefined;
}
