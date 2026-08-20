import { useEffect, useMemo } from 'react';

import { useAuth } from '@context/AuthContext';
import { useAppData } from '@context/AppDataContext';
import { referenceId } from '@utils/format';

// GET /document is already scoped server-side (owner OR own department OR own
// team, everything for SUPER_ADMIN). This narrows it further to "mine only".
export function useDocuments() {
  const { documents } = useAppData();
  const { user, isSuperAdmin } = useAuth();

  useEffect(() => {
    documents.ensure();
  }, [documents.ensure]);

  const ownEmployeeId = referenceId(user?.employeeId);

  const scoped = useMemo(() => {
    // isSuperAdmin is null until AuthContext resolves the level — fail closed
    // to own-documents rather than briefly showing everyone's to everyone.
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
    // For screens that change the document set without the list being
    // mounted beneath them — see AppDataContext's invalidate().
    invalidate: documents.invalidate,
  };
}
