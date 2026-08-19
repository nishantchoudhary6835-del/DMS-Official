import { useEffect, useMemo } from 'react';

import { useAuth } from '@context/AuthContext';
import { useAppData } from '@context/AppDataContext';
import { referenceId } from '@utils/format';

/**
 * All documents GET /document says this account can access — see its header
 * comment in @services/document. Live testing showed that response isn't
 * actually ACL-scoped to "documents I own" the way GET /workflow/my-
 * submissions was: a regular account got back other people's documents too.
 * Only Super Admin is supposed to see everyone's; every other role gets the
 * client-side ownership filter below instead of trusting the server to have
 * already narrowed it.
 */
export function useDocuments() {
  const { documents } = useAppData();
  const { user, isSuperAdmin } = useAuth();

  useEffect(() => {
    documents.ensure();
  }, [documents.ensure]);

  const ownEmployeeId = referenceId(user?.employeeId);

  const scoped = useMemo(() => {
    // isSuperAdmin is null while the role probe is still in flight — fails
    // closed to "own documents only" until it resolves true, rather than
    // briefly showing everyone's documents to every account.
    if (isSuperAdmin === true) return documents.data;

    return documents.data.filter(
      (document) => referenceId(document.owner) === ownEmployeeId
    );
  }, [documents.data, isSuperAdmin, ownEmployeeId]);

  return {
    documents: scoped,
    isLoading: documents.isLoading,
    isRefreshing: documents.isRefreshing,
    error: documents.error,
    isForbidden: documents.isForbidden,
    refresh: documents.refresh,
  };
}
