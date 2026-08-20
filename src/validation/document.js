// §3's field table names PDF/DOCX explicitly, so the picker is restricted to
// these — a rejected type is caught before upload rather than after it.
export const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

function validateTitle(value) {
  const trimmed = String(value ?? '').trim();

  if (!trimmed) return 'Title is required';

  return undefined;
}

function validateDocumentType(value) {
  const trimmed = String(value ?? '').trim();

  if (!trimmed) return 'Document type is required';

  return undefined;
}

/** §6: Department must exist and be ACTIVE. Team has no such requirement — §3 explicitly allows it blank. */
function validateDocumentDepartment(value) {
  if (!value) return 'Department is required';

  return undefined;
}

function validateFile(file) {
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

// Same as create except the file: §14's update example only appends one when
// actually picked, so leaving the picker untouched has to be valid.
export function validateDocumentEditForm(values) {
  const errors = {
    title: validateTitle(values.title),
    documentType: validateDocumentType(values.documentType),
    department: validateDocumentDepartment(values.department),
  };

  const hasError = Object.values(errors).some(Boolean);

  return { errors, hasError };
}

// Written to §15's full documented lifecycle even though only DRAFT/SUBMITTED/
// REVISION have been seen live; anything unknown title-cases below.
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

// The three statuses meaning "live": PUBLISHED (final approval), ACTIVE (what
// a restore produces) and AMENDMENT. Also exactly what may be archived.
const PUBLISHED_DOCUMENT_STATUSES = ['PUBLISHED', 'ACTIVE', 'AMENDMENT'];

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

// Routes a backend error to the field that caused it, per §13's documented
// error messages.
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
