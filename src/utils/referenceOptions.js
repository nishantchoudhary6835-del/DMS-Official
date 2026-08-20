import { referenceId } from '@utils/format';

/**
 * Fallback dropdown options for a required reference field (department/team)
 * whose real list came back empty because the account's role can't browse
 * that directory — GET /department and GET /team are both permission-gated,
 * and most employees creating or editing a document get a 403 from each.
 *
 * The login response populates `user.employeeId.department` and `.team` as
 * full objects with their `name`, so the option can now be labelled with the
 * real department or team rather than a placeholder. That is the whole point
 * of this helper: an Intern who cannot list departments still sees
 * "Information Technology" in the form, not "Your department".
 *
 * The generic `Your ${noun}` / `Assigned ${noun}` labels survive as a last
 * resort for a reference that arrives as a bare id with no name attached —
 * a session restored from storage that predates the populated login
 * response, or an endpoint that returns the field unpopulated. There is no
 * route that resolves either id to a name for an unauthorized caller, so
 * naming it is the best this can do honestly.
 *
 * `ownReference` and `currentReference` each accept whatever shape the field
 * arrives in: null, a bare id string, or a populated object.
 */
export function ownReferenceOptions(list, ownReference, noun, currentReference) {
  if (list.length) return list;

  const options = [];
  const seen = new Set();

  const add = (reference, fallbackLabel) => {
    const id = referenceId(reference);

    if (!id || seen.has(id)) return;

    seen.add(id);

    const name =
      reference && typeof reference === 'object' ? reference.name : null;

    options.push({
      value: id,
      label: name || fallbackLabel,
      hint: 'Assigned to your account',
    });
  };

  add(ownReference, `Your ${noun}`);
  add(currentReference, `Assigned ${noun}`);

  return options;
}
