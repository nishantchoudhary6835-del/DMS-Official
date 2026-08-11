export const TEAM_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
};

export const TEAM_NAME_MIN = 2;
export const TEAM_NAME_MAX = 100;

/**
 * The hierarchy level the backend requires of a team lead. Anyone else is
 * rejected on save, so the picker filters to this rather than offering
 * choices that cannot work.
 */
export const TEAM_LEAD_LEVEL = 'TEAM_LEAD';

export function validateTeamName(value) {
  const trimmed = String(value ?? '').trim();

  if (!trimmed) return 'Team name is required';
  if (trimmed.length < TEAM_NAME_MIN) return 'Team name is too short';
  if (trimmed.length > TEAM_NAME_MAX) {
    return `Team name cannot exceed ${TEAM_NAME_MAX} characters`;
  }

  return undefined;
}

export function validateTeamDepartment(value) {
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

/**
 * True when a delete was refused because employees still belong to the team.
 * A refusal, not a failure — the caller keeps the row on screen either way,
 * but this one deserves an explanation rather than a generic error.
 */
export function isDeleteBlocked(normalized) {
  return /cannot be deleted|employees are assigned/i.test(
    String(normalized.message ?? '')
  );
}

/**
 * Routes a backend error to the field that caused it.
 *
 * Order matters for the same reason it did for departments: the delete
 * refusal mentions "employees", which the team-lead branch would otherwise
 * claim and pin to the wrong field.
 *
 * Team names are unique *within a department*, so a duplicate is a property
 * of the pair — the message belongs on the name field, where the fix is.
 */
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

/**
 * Select options that can always render `currentId`, recovering the real name
 * from the unfiltered list when the team has since been deactivated — or when
 * it belongs to a department other than the one now selected.
 *
 * Same rule the department dropdown needed: without it the Select falls back
 * to its placeholder and an unrelated edit reads as though it had cleared the
 * team.
 */
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
