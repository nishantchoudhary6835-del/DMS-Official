const GENERIC_MESSAGE = 'Something went wrong. Please try again.';

const NETWORK_MESSAGE =
  'Cannot reach the server. Check your connection and try again.';

const TIMEOUT_MESSAGE =
  'The server took too long to respond. Please try again.';

const BARE_STATUS_TEXT = new Set([
  'unauthorized',
  'forbidden',
  'bad request',
  'not found',
  'internal server error',
]);

function toFieldErrors(errors) {
  if (!Array.isArray(errors)) return {};

  return errors.reduce((acc, entry) => {
    if (entry && typeof entry.field === 'string' && entry.field) {
      if (!(entry.field in acc)) {
        acc[entry.field] = String(entry.message ?? GENERIC_MESSAGE);
      }
    }
    return acc;
  }, {});
}

function extractMessage(body) {
  if (
    body &&
    typeof body === 'object' &&
    typeof body.message === 'string' &&
    body.message
  ) {
    return body.message;
  }

  if (typeof body === 'string') {
    const trimmed = body.trim();
    if (trimmed && !BARE_STATUS_TEXT.has(trimmed.toLowerCase())) {
      return trimmed;
    }
  }

  return null;
}

export function normalizeError(error) {
  const response = error?.response;

  if (!response) {
    const isTimeout =
      error?.code === 'ECONNABORTED' || /timeout/i.test(error?.message ?? '');

    return {
      message: isTimeout ? TIMEOUT_MESSAGE : NETWORK_MESSAGE,
      hasServerMessage: false,
      fieldErrors: {},
      status: null,
      isNetwork: true,
      isTimeout,
      raw: error,
    };
  }

  const body = response.data ?? {};
  const serverMessage = extractMessage(body);

  return {
    message: serverMessage ?? GENERIC_MESSAGE,
    // Whether `message` is the backend's words or this file's placeholder.
    // Several routes refuse with a reason no client could derive.
    hasServerMessage: Boolean(serverMessage),
    fieldErrors: toFieldErrors(body.errors),
    status: response.status ?? null,
    isNetwork: false,
    raw: error,
  };
}

export function isRateLimited(normalized) {
  return normalized.status === 429;
}

// Which layer of Permission -> RolePermission -> ACL refused, or null for the
// route's own rule. Checked in that order, so an ACL cannot stand in for the first.
const ROLE_PERMISSION_DENIAL = /permission is not assigned/i;
const ACL_DENIAL = /no active acl rule|access denied/i;

function permissionDenialLayer(normalized) {
  if (normalized.status !== 403) return null;

  const message = normalized.message ?? '';

  if (ROLE_PERMISSION_DENIAL.test(message)) return 'ROLE_PERMISSION';
  if (ACL_DENIAL.test(message)) return 'ACL';

  return null;
}

// Advice naming the screen that actually fixes the denial, or null when the 403
// was not the engine's doing and the caller should explain it themselves.
export function permissionDenialMessage(normalized, { action, permission }) {
  switch (permissionDenialLayer(normalized)) {
    case 'ROLE_PERMISSION':
      return (
        `Your role is not allowed to ${action} documents. A Super Admin has to ` +
        `assign ${permission} to your hierarchy level under Role Assignments. ` +
        `An Access Rule will not do it — that layer only narrows a permission ` +
        `Role Assignments has already granted.`
      );

    case 'ACL':
      return (
        `Your role has ${permission}, but no active access rule allows it here. ` +
        `A Super Admin can add one under Access Rules.`
      );

    default:
      return null;
  }
}
