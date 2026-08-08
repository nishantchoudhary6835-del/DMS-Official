export const ACCOUNT_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
};

export const ACCOUNT_STATUS_LEVELS = [
  ACCOUNT_STATUS.ACTIVE,
  ACCOUNT_STATUS.INACTIVE,
  ACCOUNT_STATUS.SUSPENDED,
];

export const ACCOUNT_STATUS_LABELS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  SUSPENDED: 'Suspended',
};

export const ACCOUNT_STATUS_TONES = {
  ACTIVE: 'success',
  INACTIVE: 'neutral',
  SUSPENDED: 'danger',
};

export function mapUserError(normalized) {
  const message = String(normalized.message ?? '');

  if (normalized.status === 409) {
    return { fieldErrors: { email: message }, formError: null };
  }

  return { fieldErrors: {}, formError: message };
}
