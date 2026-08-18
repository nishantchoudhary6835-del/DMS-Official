/**
 * Fallback dropdown options for a required reference field (department/team)
 * whose real list came back empty because the account's role can't browse
 * that directory (e.g. GET /department and GET /team are role-gated — most
 * employees creating or editing a document can never see either list), but
 * the account's own assigned id — or the value already on the record being
 * edited — is known. There's no route that resolves either id to a display
 * name for an unauthorized caller, so the best this can do honestly is offer
 * the id back as "Your department" / "Assigned department" rather than a
 * real name.
 */
export function ownReferenceOptions(list, ownId, noun, currentValue) {
  if (list.length) return list;

  const options = [];
  const seen = new Set();

  const add = (id, label) => {
    if (!id || seen.has(id)) return;
    seen.add(id);
    options.push({ value: id, label, hint: 'Assigned to your account' });
  };

  add(ownId, `Your ${noun}`);
  add(currentValue, `Assigned ${noun}`);

  return options;
}
