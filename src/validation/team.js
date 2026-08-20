export const TEAM_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
};

const TEAM_NAME_MIN = 2;
const TEAM_NAME_MAX = 100;

// The level the backend requires of a team lead; anyone else is rejected on
// save, so the picker filters to this rather than offering dead choices.
export const TEAM_LEAD_LEVEL = 'TEAM_LEAD';

function validateTeamName(value) {
  const trimmed = String(value ?? '').trim();

  if (!trimmed) return 'Team name is required';
  if (trimmed.length < TEAM_NAME_MIN) return 'Team name is too short';
  if (trimmed.length > TEAM_NAME_MAX) {
    return `Team name cannot exceed ${TEAM_NAME_MAX} characters`;
  }

  return undefined;
}

function validateTeamDepartment(value) {
  if (!value) return 'Department is required';

  return undefined;
}

export function validateTeamForm(values) {
  const errors = {
    name: validateTeamName(values.name),
    department: validateTeamDepartment(values.department),
  };

  const hasError = Object.values(errors).some(Boolean);

  return { errors, hasError };
}

// A delete refused because employees still belong to the team. A refusal, not
// a failure — but one that deserves an explanation.
export function isDeleteBlocked(normalized) {
  return /cannot be deleted|employees are assigned/i.test(
    String(normalized.message ?? '')
  );
}

// Order matters, as for departments: the delete refusal mentions "employees".
// Names are unique per department, so a duplicate belongs on the name field.
export function mapTeamError(normalized) {
  const message = String(normalized.message ?? '');
  const lower = message.toLowerCase();

  if (isDeleteBlocked(normalized)) {
    return { fieldErrors: {}, formError: message };
  }

  if (normalized.status === 409 || lower.includes('already exists')) {
    return { fieldErrors: { name: message }, formError: null };
  }

  if (lower.includes('team lead')) {
    return { fieldErrors: { teamLead: message }, formError: null };
  }

  if (lower.includes('department')) {
    return { fieldErrors: { department: message }, formError: null };
  }

  return { fieldErrors: {}, formError: message };
}

// Select options that can always render `currentId`, recovering the real name
// when the team was deactivated or belongs to another department.
export function teamOptionsWith(options, allTeams, currentId) {
  const list = Array.isArray(options) ? options : [];

  if (!currentId || list.some((option) => option.value === currentId)) {
    return list;
  }

  const found = (Array.isArray(allTeams) ? allTeams : []).find(
    (team) => team._id === currentId
  );

  return [
    ...list,
    {
      value: currentId,
      label: found?.name ?? 'Current team',
      hint: 'No longer available',
    },
  ];
}
