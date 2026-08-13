import { useCallback, useState } from 'react';

import { normalizeError } from '@utils/errors';
import { mapAclError } from '@validation/acl';
import * as aclApi from '@services/acl';

export function useUpdateAcl() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const clearMessages = useCallback(() => {
    setError(null);
    setFieldErrors({});
  }, []);

  const submit = useCallback(
    async (aclId, changes) => {
      if (isSubmitting) return null;

      setIsSubmitting(true);
      clearMessages();

      try {
        const response = await aclApi.updateAcl(aclId, changes);
        return response?.data ?? null;
      } catch (caught) {
        const normalized = normalizeError(caught);

        if (normalized.status === 403) {
          setError('Only a Super Admin can edit access rules.');
          return null;
        }

        if (normalized.status === 404) {
          setError('Access rule not found.');
          return null;
        }

        const mapped = mapAclError(normalized);

        setFieldErrors({ ...mapped.fieldErrors, ...normalized.fieldErrors });
        setError(mapped.formError);

        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, clearMessages]
  );

  return { submit, isSubmitting, error, fieldErrors, clearMessages };
}
