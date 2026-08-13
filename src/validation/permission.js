/**
 * The nine actions PERMISSION_MODULE.md documents as currently supported.
 * Unlike hierarchy levels there is no GET endpoint that returns this list —
 * the doc presents it as fixed, so it is hardcoded rather than fetched.
 */
export const PERMISSION_ACTIONS = [
  'VIEW',
  'CREATE',
  'EDIT',
  'DELETE',
  'REVIEW',
  'APPROVE',
  'PUBLISH',
  'ARCHIVE',
  'RESTORE',
];

export const PERMISSION_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
};

/**
 * Every action is a single word, so a title-cased transform covers all nine
 * with no exceptions — unlike HIERARCHY_LABELS this needs no override table.
 * Never returns null: callers interpolate this into badges and strings.
 */
export function actionLabel(action) {
  if (!action) return '';

  const word = String(action);
  return word.charAt(0) + word.slice(1).toLowerCase();
}

export function validateResource(value) {
  const trimmed = String(value ?? '').trim();

  if (!trimmed) return 'Resource is required';

  return undefined;
}

export function validateAction(value) {
  if (!value) return 'Action is required';
  if (!PERMISSION_ACTIONS.includes(value)) return 'Select a valid action';

  return undefined;
}

export function validatePermissionForm(values) {
  const errors = {
    resource: validateResource(values.resource),
    action: validateAction(values.action),
  };

  const hasError = Object.values(errors).some(Boolean);

  return { errors, hasError };
}

/**
 * `RESOURCE.ACTION`, the identity format PERMISSION_MODULE.md §8 uses
 * ("TEAM.CREATE"). Guards against either half being absent rather than
 * rendering a broken string while a record is still loading. Kept around as
 * the compact technical identifier shown alongside — not the primary label,
 * see permissionSentence for that.
 */
export function permissionCode(permission) {
  if (!permission) return '';

  const resource = String(permission.resource ?? '').trim();
  const action = String(permission.action ?? '').trim();

  if (!resource || !action) return resource || action;

  return `${resource}.${action}`;
}

/**
 * Resource is free text (whatever the creator typed — "team", "Team",
 * "team documents"), so this defensively title-cases every word rather than
 * trusting the stored casing.
 */
export function resourceLabel(resource) {
  return String(resource ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * The plain-English reading of a permission — "Create Team", "Approve Idea"
 * — used as the primary label everywhere a permission is shown, instead of
 * the RESOURCE.ACTION code. Answers "what does this actually let someone do"
 * at a glance, which the bare code does not.
 */
export function permissionSentence(permission) {
  if (!permission) return '';

  const action = actionLabel(permission.action);
  const resource = resourceLabel(permission.resource);

  if (!action || !resource) return action || resource;

  return `${action} ${resource}`;
}

/**
 * The verb phrase for each action with the resource dropped in — e.g.
 * "add a new team record". Subject-less on purpose: actionExplainer wraps it
 * as "Lets someone {phrase}" for a Permission on its own, while RolePermission
 * and ACL wrap the same phrase around their own subject ("Department Head is
 * eligible to {phrase}", "Can {phrase}") so the concrete effect — not just
 * the permission's name — shows up everywhere a permission is referenced.
 */
const ACTION_VERB_PHRASES = {
  VIEW: (resource) => `see ${resource} records`,
  CREATE: (resource) => `add a new ${resource} record`,
  EDIT: (resource) => `change details on an existing ${resource} record`,
  DELETE: (resource) => `permanently remove a ${resource} record`,
  REVIEW: (resource) => `look over a ${resource} record before it moves forward`,
  APPROVE: (resource) => `sign off on a ${resource} record, moving it to the next stage`,
  PUBLISH: (resource) => `make a ${resource} record visible to others`,
  ARCHIVE: (resource) => `put a ${resource} record into storage, out of everyday view (not delete it)`,
  RESTORE: (resource) => `bring an archived or deleted ${resource} record back`,
};

/**
 * The verb phrase for a permission's action + resource, e.g.
 * "add a new team record". Only meaningful once `permission` has come back
 * populated (resource/action present) — a bare reference (just an id) has
 * nothing to build a phrase from, so this returns '' and callers fall back
 * to the permission's name instead.
 */
export function permissionEffectPhrase(permission) {
  if (!permission) return '';

  const build = ACTION_VERB_PHRASES[permission.action];
  if (!build) return '';

  const resource = String(permission.resource ?? '').trim().toLowerCase() || 'this';

  return build(resource);
}

/**
 * Plain-language explanation of what a permission actually does, e.g.
 * "Lets someone permanently remove a team record." Falls back to nothing if
 * the action isn't one of the nine known ones.
 */
export function actionExplainer(permission) {
  const phrase = permissionEffectPhrase(permission);
  if (!phrase) return '';

  const suffix = permission.action === 'DELETE' ? '. This cannot be undone.' : '.';

  return `Lets someone ${phrase}${suffix}`;
}

const ACTION_ICONS = {
  VIEW: 'eye-outline',
  CREATE: 'add-circle-outline',
  EDIT: 'create-outline',
  DELETE: 'trash-outline',
  REVIEW: 'search-outline',
  APPROVE: 'checkmark-circle-outline',
  PUBLISH: 'megaphone-outline',
  ARCHIVE: 'archive-outline',
  RESTORE: 'refresh-outline',
};

/** Ionicons name for an action, so a card can show a recognizable glyph instead of a text code. */
export function actionIcon(action) {
  return ACTION_ICONS[action] || 'ellipse-outline';
}

/**
 * Routes a backend error to the field that caused it.
 *
 * The doc never states whether the (resource, action) pair or resource alone
 * must be unique — only that a duplicate should be rejected somehow. Since
 * action is a closed dropdown that cannot itself be "wrong" in a way worth
 * pointing at, any conflict is pinned to resource, where a fix is actually
 * possible.
 */
export function mapPermissionError(normalized) {
  const message = String(normalized.message ?? '');
  const lower = message.toLowerCase();

  if (normalized.status === 409 || lower.includes('already exists')) {
    return { fieldErrors: { resource: message }, formError: null };
  }

  if (lower.includes('action')) {
    return { fieldErrors: { action: message }, formError: null };
  }

  return { fieldErrors: {}, formError: message };
}
