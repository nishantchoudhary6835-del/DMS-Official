import { referenceId } from '@utils/format';

// Fallback options for a required reference (department/team) whose real list
// 403'd. Named from the populated login response; `Your ${noun}` for a bare id.
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
