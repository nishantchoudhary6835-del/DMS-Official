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
 * Pulls the ObjectId out of a Mongo reference that may or may not be
 * populated. The same field comes back three ways depending on the endpoint —
 * `null`, a bare id string, or a populated object — so anything sending a
 * reference back to the server has to normalise it first.
 *
 * Department.head is the clearest case: create and list return it unpopulated,
 * update returns it populated.
 */
export function referenceId(reference) {
  if (!reference) return null;
  if (typeof reference === 'string') return reference;

  return reference._id ?? null;
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
