import { useEffect, useMemo } from 'react';

import { useAuth } from '@context/AuthContext';
import { useAppData } from '@context/AppDataContext';
import { referenceId } from '@utils/format';

/**
 * All documents GET /document says this account can access — see its header
 * comment in @services/document.
 *
 * That response *is* scoped server-side, contrary to an earlier note here
 * that said it wasn't: `buildDocumentScope` in the backend's
 * document.service.js returns everything for SUPER_ADMIN, and
 * `owner OR own department OR own team` for everyone else. So the reason a
 * regular account saw other people's documents wasn't a missing filter — it
 * was a deliberately wider one than this app wants. The rule here is "my own
 * documents, unless I'm Super Admin", which is narrower than anything the
 * endpoint offers, so it stays a client-side filter.
 */
export function useDocuments() {
  const { documents } = useAppData();
  const { user, isSuperAdmin } = useAuth();

  useEffect(() => {
    documents.ensure();
  }, [documents.ensure]);

  const ownEmployeeId = referenceId(user?.employeeId);

  const scoped = useMemo(() => {
    // isSuperAdmin is null until AuthContext has resolved the signed-in
    // employee's hierarchyLevel — fails closed to "own documents only" until
    // it reads true, rather than briefly showing everyone's documents to
    // every account.
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
