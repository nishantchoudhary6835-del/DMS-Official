import { useEffect } from 'react';

import { useAppData } from '@context/AppDataContext';

/** The logged-in employee's own submitted documents and their review status —
 * GET /workflow/my-submissions scopes this server-side to the caller. */
export function useMySubmissions() {
  const { mySubmissions } = useAppData();

  useEffect(() => {
    mySubmissions.ensure();
  }, [mySubmissions.ensure]);

  return {
    workflows: mySubmissions.data,
    isLoading: mySubmissions.isLoading,
    isRefreshing: mySubmissions.isRefreshing,
    error: mySubmissions.error,
    isForbidden: mySubmissions.isForbidden,
    refresh: mySubmissions.refresh,
  };
}
