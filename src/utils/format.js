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

// Pulls the ObjectId out of a Mongo reference that may arrive null, as a bare
// id, or populated — so anything sending one back has to normalise it first.
export function referenceId(reference) {
  if (!reference) return null;
  if (typeof reference === 'string') return reference;

  return reference._id ?? null;
}

// Two-letter monogram for avatars. Falls back to the email's first letter when
// an employee record has no name yet, and to '—' when it has neither.
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

// Date plus time: audit logs need the clock as well as the day, since several
// entries per second are normal and a date-only column hides their order.
export function formatDateTime(value) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
