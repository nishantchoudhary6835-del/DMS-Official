export const DEPARTMENT_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
};

function validateDepartmentName(value) {
  const trimmed = String(value ?? '').trim();

  if (!trimmed) return 'Department name is required';

  return undefined;
}

// Required only. The backend documents no length or character rule, so
// inventing one here would reject codes the server would have accepted.
function validateDepartmentCode(value) {
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

// A delete refused because employees still reference the department — a
// legitimate outcome, so the caller keeps the row on screen.
export function isDeleteBlocked(normalized) {
  return /cannot be deleted/i.test(String(normalized.message ?? ''));
}

// Routes a backend error to its field. Order matters: the delete-protection
// message contains "employees" and would otherwise pin to Department Head.
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

// Select options that can always render `currentId`. A department deactivated
// after assignment would otherwise read as though the edit had cleared it.
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
