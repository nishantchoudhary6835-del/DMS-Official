/**
 * The only status DOCUMENT_MANAGEMENT.md's current Create API can produce.
 * The FRS lifecycle (Submitted, Review, Approved, Published, …) exists on
 * paper but has no API yet — see the module's §14/§15 — so nothing here
 * pretends a document can be anything else through this app.
 */
export const DOCUMENT_STATUS = {
  DRAFT: 'DRAFT',
};

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
