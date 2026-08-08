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
      fieldErrors: {},
      status: null,
      isNetwork: true,
      isTimeout,
      raw: error,
    };
  }

  const body = response.data ?? {};

  return {
    message: extractMessage(body) ?? GENERIC_MESSAGE,
    fieldErrors: toFieldErrors(body.errors),
    status: response.status ?? null,
    isNetwork: false,
    raw: error,
  };
}

export function isRateLimited(normalized) {
  return normalized.status === 429;
}

export function isUnauthorized(normalized) {
  return normalized.status === 401;
}
