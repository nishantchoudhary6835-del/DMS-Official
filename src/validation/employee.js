export const HIERARCHY_LEVELS = [
  'SUPER_ADMIN',
  'GOVERNANCE',
  'EXECUTIVE',
  'DEPARTMENT',
  'MANAGER',
  'TEAM_LEAD',
  'TEAM',
  'EMPLOYEE',
  'INTERN',
];

export const HIERARCHY_LABELS = {
  SUPER_ADMIN: 'Super Admin',
  GOVERNANCE: 'Governance',
  EXECUTIVE: 'Executive',
  DEPARTMENT: 'Department Head',
  MANAGER: 'Manager',
  TEAM_LEAD: 'Team Lead',
  TEAM: 'Team',
  EMPLOYEE: 'Employee',
  INTERN: 'Intern',
};

export const EMPLOYEE_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmployeeId(value) {
  const trimmed = String(value ?? '').trim();

  if (!trimmed) return 'Employee ID is required';
  if (trimmed.length < 2) return 'Employee ID is too short';

  return undefined;
}

export function validateName(value, label) {
  const trimmed = String(value ?? '').trim();

  if (!trimmed) return `${label} is required`;

  return undefined;
}

export function validateEmployeeEmail(value) {
  const trimmed = String(value ?? '').trim();

  if (!trimmed) return 'Email is required';
  if (!EMAIL_PATTERN.test(trimmed)) return 'Enter a valid email address';

  return undefined;
}

export function validateHierarchyLevel(value) {
  if (!value) return 'Hierarchy level is required';
  if (!HIERARCHY_LEVELS.includes(value)) return 'Select a valid hierarchy level';

  return undefined;
}

export function mapEmployeeError(normalized) {
  const message = String(normalized.message ?? '');
  const lower = message.toLowerCase();

  if (normalized.status === 409) {
    if (lower.includes('email')) {
      return { fieldErrors: { email: message }, formError: null };
    }
    return { fieldErrors: { employeeId: message }, formError: null };
  }

  if (
    lower.includes('reporting manager') ||
    lower.includes('report to themselves')
  ) {
    return { fieldErrors: { reportingManager: message }, formError: null };
  }

  return { fieldErrors: {}, formError: message };
}

export function validateEmployeeForm(values) {
  const errors = {
    employeeId: validateEmployeeId(values.employeeId),
    firstName: validateName(values.firstName, 'First name'),
    lastName: validateName(values.lastName, 'Last name'),
    email: validateEmployeeEmail(values.email),
    hierarchyLevel: validateHierarchyLevel(values.hierarchyLevel),
  };

  const hasError = Object.values(errors).some(Boolean);

  return { errors, hasError };
}
