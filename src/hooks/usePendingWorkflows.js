import { useEffect } from 'react';

import { useAppData } from '@context/AppDataContext';

/** Documents waiting on the logged-in reviewer — GET /workflow/pending scopes
 * this server-side, so there's no client-side filtering to do here. */
export function usePendingWorkflows() {
  const { pendingWorkflows } = useAppData();

  useEffect(() => {
    pendingWorkflows.ensure();
  }, [pendingWorkflows.ensure]);

  return {
    workflows: pendingWorkflows.data,
    isLoading: pendingWorkflows.isLoading,
    isRefreshing: pendingWorkflows.isRefreshing,
    error: pendingWorkflows.error,
    isForbidden: pendingWorkflows.isForbidden,
    refresh: pendingWorkflows.refresh,
  };
}
