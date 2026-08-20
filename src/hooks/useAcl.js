import { useCallback, useEffect, useRef, useState } from 'react';

import { normalizeError } from '@utils/errors';
import * as aclApi from '@services/acl';

export function useAcl(aclId) {
  const [acl, setAcl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isForbidden, setIsForbidden] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);

  const requestRef = useRef(0);

  const load = useCallback(async (id, { refresh = false } = {}) => {
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;

    // A refresh deliberately leaves isLoading alone: no detail screen shows
    // a background indicator, and flipping it would flash the full-page loader.
    if (!refresh) setIsLoading(true);

    setError(null);
    setIsForbidden(false);
    setIsNotFound(false);

    if (!id) {
      setAcl(null);
      setIsNotFound(true);
      setError('Access rule not found.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await aclApi.getAclById(id);

      if (requestRef.current !== requestId) return;

      setAcl(response?.data ?? null);
    } catch (caught) {
      if (requestRef.current !== requestId) return;

      const normalized = normalizeError(caught);

      if (normalized.status === 403) {
        setIsForbidden(true);
        setError('You are not authorized to view this access rule.');
      } else if (normalized.status === 404) {
        setIsNotFound(true);
        setError('Access rule not found.');
      } else {
        setError(normalized.message);
      }

      setAcl(null);
    } finally {
      if (requestRef.current === requestId) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    load(aclId);
  }, [aclId, load]);

  const refresh = useCallback(
    () => load(aclId, { refresh: true }),
    [aclId, load]
  );

  return { acl, isLoading, error, isForbidden, isNotFound, refresh };
}
