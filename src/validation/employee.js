// FALLBACK only — GET /hierarchy is the source of truth (see useHierarchy).
// Kept because a cold-started backend would leave the form unsubmittable.
export const FALLBACK_HIERARCHY_LEVELS = [
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

// Display names, overrides only — GET /hierarchy returns the raw enum. Missing
// entries fall through to titleCase(); DEPARTMENT is why this is a table.
const HIERARCHY_LABELS = {
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

function titleCase(value) {
  return String(value)
    .toLowerCase()
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Never returns null: callers interpolate this into strings and badges, and a
// literal "null" on screen is worse than an empty one.
export function labelFor(level) {
  if (!level) return '';

  return HIERARCHY_LABELS[level] ?? titleCase(level);
}

// The server's active list plus whatever the record already has: validating
// strictly would block unrelated edits to anyone holding a retired level.
export function allowedLevelsFor(activeLevels, currentLevel) {
  const active = Array.isArray(activeLevels) ? activeLevels : [];

  if (!currentLevel || active.includes(currentLevel)) return active;

  return [...active, currentLevel];
}

// Select options that can always render `currentLevel`. Without it an edit
// touching only other fields reads as though it had cleared the hierarchy.
export function optionsWithCurrentLevel(options, currentLevel) {
  const list = Array.isArray(options) ? options : [];

  if (!currentLevel || list.some((option) => option.value === currentLevel)) {
    return list;
  }

  return [
    ...list,
    { value: currentLevel, label: labelFor(currentLevel), hint: 'No longer offered' },
  ];
}

function nameOf(employee) {
  return (
    [employee.firstName, employee.lastName].filter(Boolean).join(' ') ||
    employee.employeeId
  );
}

// Reporting-manager candidates, most senior first. Peers are kept — same-level
// reporting is normal — and `hiddenCount` separates "none qualify" from "none".
export function managerCandidates(employees, options = {}) {
  const { excludeId = null, hierarchyLevel = null, ranks = null } = options;
  const list = Array.isArray(employees) ? employees : [];

  const subjectRank = hierarchyLevel ? ranks?.[hierarchyLevel] : null;

  const candidates = list.filter((employee) => employee._id !== excludeId);

  const eligible = subjectRank
    ? candidates.filter((employee) => {
        const rank = ranks[employee.hierarchyLevel];

        // A level deactivated since this record was created stays visible
        // rather than disappearing for a reason nobody can see.
        return !rank || rank <= subjectRank;
      })
    : candidates;

  const rankOf = (employee) =>
    ranks?.[employee.hierarchyLevel] ?? Number.MAX_SAFE_INTEGER;

  return {
    options: eligible
      .slice()
      .sort((a, b) => rankOf(a) - rankOf(b) || nameOf(a).localeCompare(nameOf(b)))
      .map((employee) => ({
        value: employee._id,
        label: nameOf(employee),
        hint: [employee.employeeId, labelFor(employee.hierarchyLevel)]
          .filter(Boolean)
          .join(' · '),
      })),
    hiddenCount: candidates.length - eligible.length,
  };
}

function validateEmployeeId(value) {
  const trimmed = String(value ?? '').trim();

  if (!trimmed) return 'Employee ID is required';
  if (trimmed.length < 2) return 'Employee ID is too short';

  return undefined;
}

function validateName(value, label) {
  const trimmed = String(value ?? '').trim();

  if (!trimmed) return `${label} is required`;

  return undefined;
}

function validateEmployeeEmail(value) {
  const trimmed = String(value ?? '').trim();

  if (!trimmed) return 'Email is required';
  if (!EMAIL_PATTERN.test(trimmed)) return 'Enter a valid email address';

  return undefined;
}

// An empty `allowedLevels` means "not loaded yet", not "nothing is valid" —
// otherwise a submit during the hierarchy fetch rejects everything.
export function validateHierarchyLevel(value, allowedLevels) {
  const allowed =
    Array.isArray(allowedLevels) && allowedLevels.length
      ? allowedLevels
      : FALLBACK_HIERARCHY_LEVELS;

  if (!value) return 'Hierarchy level is required';
  if (!allowed.includes(value)) return 'Select a valid hierarchy level';

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

export function validateEmployeeForm(values, allowedLevels) {
  const errors = {
    employeeId: validateEmployeeId(values.employeeId),
    firstName: validateName(values.firstName, 'First name'),
    lastName: validateName(values.lastName, 'Last name'),
    email: validateEmployeeEmail(values.email),
    hierarchyLevel: validateHierarchyLevel(values.hierarchyLevel, allowedLevels),
  };

  const hasError = Object.values(errors).some(Boolean);

  return { errors, hasError };
}
