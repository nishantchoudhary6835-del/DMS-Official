/**
 * §3's field table names PDF/DOCX explicitly; the picker is restricted to
 * these so a rejected file type is caught before upload rather than as a
 * server error after one.
 */
export const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export function validateTitle(value) {
  const trimmed = String(value ?? '').trim();

  if (!trimmed) return 'Title is required';

  return undefined;
}

export function validateDocumentType(value) {
  const trimmed = String(value ?? '').trim();

  if (!trimmed) return 'Document type is required';

  return undefined;
}

/** §6: Department must exist and be ACTIVE. Team has no such requirement — §3 explicitly allows it blank. */
export function validateDocumentDepartment(value) {
  if (!value) return 'Department is required';

  return undefined;
}

export function validateFile(file) {
  if (!file) return 'A file is required';

  return undefined;
}

export function validateDocumentForm(values) {
  const errors = {
    title: validateTitle(values.title),
    documentType: validateDocumentType(values.documentType),
    department: validateDocumentDepartment(values.department),
    file: validateFile(values.file),
  };

  const hasError = Object.values(errors).some(Boolean);

  return { errors, hasError };
}

/**
 * Same as create except the file — §14's update example only appends a
 * file when one was actually picked, so keeping the existing file by
 * leaving the picker untouched has to be a valid submission.
 */
export function validateDocumentEditForm(values) {
  const errors = {
    title: validateTitle(values.title),
    documentType: validateDocumentType(values.documentType),
    department: validateDocumentDepartment(values.department),
  };

  const hasError = Object.values(errors).some(Boolean);

  return { errors, hasError };
}

/**
 * DOCUMENT_MODULE_DOCUMENTATION.md §15 lists the full document lifecycle
 * (separate from Workflow's own PENDING_REVIEW/REVISION/REJECTED/COMPLETED
 * set) — but every live document.status this app has actually observed so
 * far has only ever been DRAFT/SUBMITTED/REVISION, never PUBLISHED/ACTIVE/
 * AMENDMENT/ARCHIVED. This table is written to the full documented set
 * regardless, since falling back to a title-cased render of whatever the
 * server actually sends (below) means an unobserved value still displays
 * reasonably instead of blank.
 */
const DOCUMENT_STATUS_TONES = {
  DRAFT: 'neutral',
  SUBMITTED: 'info',
  REVIEW: 'info',
  REVISION: 'accent',
  APPROVED: 'success',
  PUBLISHED: 'success',
  ACTIVE: 'success',
  AMENDMENT: 'accent',
  ARCHIVED: 'neutral',
};

/**
 * The three statuses that mean "this document is live" — it finished the
 * approval workflow and is in force. PUBLISHED is set at final Governance
 * approval, ACTIVE is what a restored document becomes (restore does not go
 * back to PUBLISHED), and AMENDMENT is a live document being revised.
 *
 * Everything before these — SUBMITTED, REVIEW, REVISION, APPROVED — is still
 * in the approval pipeline and is NOT published, however far along it is.
 *
 * This is also exactly the set document.service.js allows archiving, which is
 * not a coincidence: archiving is retiring a live document, so the two
 * questions have the same answer. DocumentDetailScreen reuses it for that.
 */
export const PUBLISHED_DOCUMENT_STATUSES = ['PUBLISHED', 'ACTIVE', 'AMENDMENT'];

export function isPublishedStatus(status) {
  return PUBLISHED_DOCUMENT_STATUSES.includes(status);
}

function titleCase(value) {
  return String(value)
    .toLowerCase()
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function documentStatusLabel(status) {
  if (!status) return '';

  return titleCase(status);
}

export function documentStatusTone(status) {
  return DOCUMENT_STATUS_TONES[status] ?? 'neutral';
}

/**
 * Routes a backend error to the field that caused it, per §13's documented
 * error messages.
 */
export function mapDocumentError(normalized) {
  const message = String(normalized.message ?? '');
  const lower = message.toLowerCase();

  if (lower.includes('team')) {
    return { fieldErrors: { team: message }, formError: null };
  }

  if (lower.includes('department')) {
    return { fieldErrors: { department: message }, formError: null };
  }

  if (lower.includes('file')) {
    return { fieldErrors: { file: message }, formError: null };
  }

  return { fieldErrors: {}, formError: message };
}
