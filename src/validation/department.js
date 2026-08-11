export const DEPARTMENT_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
};

export function validateDepartmentName(value) {
  const trimmed = String(value ?? '').trim();

  if (!trimmed) return 'Department name is required';

  return undefined;
}

/**
 * Required only.
 *
 * The backend documents the code as required, unique, trimmed and uppercased,
 * and says nothing about length or character set. Inventing a format rule here
 * would reject codes the server would have accepted, so uniqueness and format
 * are left to the server and surfaced through mapDepartmentError.
 */
export function validateDepartmentCode(value) {
  const trimmed = String(value ?? '').trim();

  if (!trimmed) return 'Department code is required';

  return undefined;
}

export function validateDepartmentForm(values) {
  const errors = {
    name: validateDepartmentName(values.name),
    code: validateDepartmentCode(values.code),
  };

  const hasError = Object.values(errors).some(Boolean);

  return { errors, hasError };
}

/**
 * True when a delete was refused because employees still reference the
 * department. This is a legitimate outcome rather than a failure, and the
 * caller has to keep the row on screen instead of optimistically dropping it.
 */
export function isDeleteBlocked(normalized) {
  return /cannot be deleted/i.test(String(normalized.message ?? ''));
}

/**
 * Routes a backend error to the field that caused it.
 *
 * Order matters. The delete-protection message contains the word "employees",
 * which would otherwise be mistaken for a Department Head problem and pinned
 * to the wrong field.
 */
export function mapDepartmentError(normalized) {
  const message = String(normalized.message ?? '');
  const lower = message.toLowerCase();

  if (isDeleteBlocked(normalized)) {
    return { fieldErrors: {}, formError: message };
  }

  if (normalized.status === 409 || lower.includes('code already exists')) {
    return { fieldErrors: { code: message }, formError: null };
  }

  if (lower.includes('head') || lower.includes('employee')) {
    return { fieldErrors: { head: message }, formError: null };
  }

  return { fieldErrors: {}, formError: message };
}

/**
 * Select options that can always render `currentId`.
 *
 * Departments deactivated after an employee was assigned to them drop out of
 * the selectable list, but the employee still points at one. Without this the
 * Select falls back to its placeholder and an edit touching only the surname
 * reads as though it had cleared the department.
 *
 * The label is recovered from the unfiltered list, so a deactivated department
 * still shows its real name rather than a placeholder — and is marked, so it
 * does not read as a normal choice.
 */
export function departmentOptionsWith(options, allDepartments, currentId) {
  const list = Array.isArray(options) ? options : [];

  if (!currentId || list.some((option) => option.value === currentId)) {
    return list;
  }

  const found = (Array.isArray(allDepartments) ? allDepartments : []).find(
    (department) => department._id === currentId
  );

  return [
    ...list,
    {
      value: currentId,
      label: found?.name ?? 'Current department',
      hint: found?.code ? `${found.code} · No longer active` : 'No longer active',
    },
  ];
}
