// Fallback for GET /permission/options (see usePermissionVocabulary), which
// wins whenever reachable — as FALLBACK_HIERARCHY_LEVELS is to GET /hierarchy.
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

// The resource vocabulary from PERMISSION_MODULE.md's example response, with
// the same fallback relationship to GET /permission/options.
export const FALLBACK_PERMISSION_RESOURCES = [
  'USER',
  'EMPLOYEE',
  'DEPARTMENT',
  'TEAM',
  'DOCUMENT',
  'PERMISSION',
  'ROLE_PERMISSION',
  'ACL',
];

export const PERMISSION_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
};

// Every action is a single word, so title-casing covers all nine with no
// override table. Never returns null — callers interpolate it.
export function actionLabel(action) {
  if (!action) return '';

  const word = String(action);
  return word.charAt(0) + word.slice(1).toLowerCase();
}

// Resource is a closed vocabulary (GET /permission/options), not free text —
// mirrors validateHierarchyLevel's relationship to its allowed list.
function validateResource(value, allowedResources) {
  const allowed =
    Array.isArray(allowedResources) && allowedResources.length
      ? allowedResources
      : FALLBACK_PERMISSION_RESOURCES;

  if (!value) return 'Resource is required';
  if (!allowed.includes(value)) return 'Select a valid resource';

  return undefined;
}

function validateAction(value, allowedActions) {
  const allowed =
    Array.isArray(allowedActions) && allowedActions.length
      ? allowedActions
      : PERMISSION_ACTIONS;

  if (!value) return 'Action is required';
  if (!allowed.includes(value)) return 'Select a valid action';

  return undefined;
}

export function validatePermissionForm(values, allowedResources, allowedActions) {
  const errors = {
    resource: validateResource(values.resource, allowedResources),
    action: validateAction(values.action, allowedActions),
  };

  const hasError = Object.values(errors).some(Boolean);

  return { errors, hasError };
}

// `RESOURCE.ACTION`, §8's identity format ("TEAM.CREATE"). The compact
// technical identifier shown alongside — permissionSentence is the label.
export function permissionCode(permission) {
  if (!permission) return '';

  const resource = String(permission.resource ?? '').trim();
  const action = String(permission.action ?? '').trim();

  if (!resource || !action) return resource || action;

  return `${resource}.${action}`;
}

// Resource is free text (whatever the creator typed), so this title-cases
// every word rather than trusting the stored casing.
export function resourceLabel(resource) {
  return String(resource ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// The plain-English reading — "Create Team" — used as the primary label
// everywhere, since the bare RESOURCE.ACTION code never says what it allows.
export function permissionSentence(permission) {
  if (!permission) return '';

  const action = actionLabel(permission.action);
  const resource = resourceLabel(permission.resource);

  if (!action || !resource) return action || resource;

  return `${action} ${resource}`;
}

// Subject-less on purpose: actionExplainer wraps it as "Lets someone {phrase}",
// while RolePermission and ACL wrap it around their own subject.
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

// Only meaningful once `permission` is populated — a bare id reference has
// nothing to build a phrase from, so this returns '' and callers use the name.
export function permissionEffectPhrase(permission) {
  if (!permission) return '';

  const build = ACTION_VERB_PHRASES[permission.action];
  if (!build) return '';

  const resource = String(permission.resource ?? '').trim().toLowerCase() || 'this';

  return build(resource);
}

// Plain-language explanation, e.g. "Lets someone permanently remove a team
// record." Empty when the action isn't one of the nine known ones.
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

// Routes a backend error to its field. Any conflict is pinned to resource:
// action is a closed dropdown that cannot itself be "wrong".
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
