export function formatCountdown(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function normalizeEmail(email) {
  return String(email ?? '').trim().toLowerCase();
}

export function digitsOnly(value) {
  return String(value ?? '').replace(/\D/g, '');
}

/**
 * Two-letter monogram for avatars. Falls back to the email's first letter
 * when an employee record has no name yet, and to '—' when it has neither.
 */
export function initialsOf(first, last, email) {
  const a = String(first ?? '').trim().charAt(0);
  const b = String(last ?? '').trim().charAt(0);

  if (a || b) return `${a}${b}`.toUpperCase();

  const fromEmail = String(email ?? '').trim().charAt(0);
  return fromEmail ? fromEmail.toUpperCase() : '—';
}

export function formatDate(value) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
