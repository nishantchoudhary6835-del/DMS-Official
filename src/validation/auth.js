const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_RULES = [
  {
    id: 'length',
    label: 'At least 8 characters',
    test: (value) => value.length >= 8,
  },
  {
    id: 'uppercase',
    label: 'One uppercase letter',
    test: (value) => /[A-Z]/.test(value),
  },
  {
    id: 'lowercase',
    label: 'One lowercase letter',
    test: (value) => /[a-z]/.test(value),
  },
  {
    id: 'number',
    label: 'One number',
    test: (value) => /\d/.test(value),
  },
  {
    id: 'special',
    label: 'One special character',
    test: (value) => /[^A-Za-z0-9]/.test(value),
  },
];

export const OTP_LENGTH = 6;

export const OTP_VALIDITY_SECONDS = 300;

export function validateEmail(value) {
  const trimmed = String(value ?? '').trim();

  if (!trimmed) return 'Email is required';
  if (!EMAIL_PATTERN.test(trimmed)) return 'Enter a valid email address';

  return undefined;
}

export function validatePassword(value) {
  const password = String(value ?? '');

  if (!password) return 'Password is required';

  const failed = PASSWORD_RULES.find((rule) => !rule.test(password));
  if (failed) return failed.label;

  return undefined;
}

export function validateConfirmPassword(value, password) {
  if (!value) return 'Confirm password is required';
  if (value !== password) return 'Passwords do not match';

  return undefined;
}

export function validateOtp(value) {
  const otp = String(value ?? '');

  if (!otp) return 'Enter the code from your email';
  if (otp.length !== OTP_LENGTH) return `Enter all ${OTP_LENGTH} digits`;
  if (!/^\d+$/.test(otp)) return 'The code should contain only numbers';

  return undefined;
}

export function validateLoginPassword(value) {
  if (!value) return 'Password is required';
  return undefined;
}
