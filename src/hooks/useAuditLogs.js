import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { normalizeError } from '@utils/errors';
import { isCompleteDateInput, mapAuditError } from '@validation/audit';
import * as auditApi from '@services/audit';

const AUDIT_PAGE_SIZE = 20;

const EMPTY_FILTERS = {
  module: null,
  action: null,
  from: '',
  to: '',
};

// Deliberately not an AppDataContext resource: that caches one unparameterised
// list per session, while these are filtered, paged and unbounded server-side.
export function useAuditLogs() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);

  const [state, setState] = useState({
    logs: [],
    pagination: null,
    isLoading: true,
    isRefreshing: false,
    error: null,
    isForbidden: false,
  });

  // Guards against a slow early request landing after a faster later one and
  // repainting the table with stale rows.
  const requestRef = useRef(0);

  // Dates are only sent once they parse: the backend feeds them straight to
  // `new Date(...)`, where a half-typed "2026-08" silently matches nothing.
  const query = useMemo(
    () => ({
      module: filters.module,
      action: filters.action,
      from: isCompleteDateInput(filters.from) ? filters.from.trim() : null,
      to: isCompleteDateInput(filters.to) ? filters.to.trim() : null,
      page,
      limit: AUDIT_PAGE_SIZE,
    }),
    [filters.module, filters.action, filters.from, filters.to, page]
  );

  const load = useCallback(
    async ({ refresh = false } = {}) => {
      const requestId = requestRef.current + 1;
      requestRef.current = requestId;

      setState((prev) => ({
        ...prev,
        isLoading: !refresh,
        isRefreshing: refresh,
        error: null,
        isForbidden: false,
      }));

      try {
        const response = await auditApi.listAuditLogs(query);

        if (requestRef.current !== requestId) return;

        setState({
          // §15: `data` is `{ logs, pagination }`, not the array itself.
          logs: Array.isArray(response?.data?.logs) ? response.data.logs : [],
          pagination: response?.data?.pagination ?? null,
          isLoading: false,
          isRefreshing: false,
          error: null,
          isForbidden: false,
        });
      } catch (caught) {
        if (requestRef.current !== requestId) return;

        const normalized = normalizeError(caught);

        setState({
          logs: [],
          pagination: null,
          isLoading: false,
          isRefreshing: false,
          error: mapAuditError(normalized),
          isForbidden: normalized.status === 403,
        });
      }
    },
    [query]
  );

  useEffect(() => {
    load();
  }, [load]);

  // Any filter change resets to page 1 — staying on page 4 while narrowing
  // usually lands past the end of the new result set and reads as "no matches".
  const setFilter = useCallback((key, value) => {
    setFilters((prev) => {
      if (prev[key] === value) return prev;

      const next = { ...prev, [key]: value };

      // An action belongs to exactly one module, so one picked under the
      // previous module cannot survive the change.
      if (key === 'module') next.action = null;

      return next;
    });

    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  }, []);

  const totalPages = state.pagination?.totalPages ?? 0;

  const goToPage = useCallback(
    (nextPage) => {
      if (nextPage < 1) return;
      if (totalPages && nextPage > totalPages) return;

      setPage(nextPage);
    },
    [totalPages]
  );

  const refresh = useCallback(() => load({ refresh: true }), [load]);

  const hasFilters = Boolean(
    filters.module || filters.action || filters.from || filters.to
  );

  return {
    ...state,
    filters,
    setFilter,
    clearFilters,
    hasFilters,
    page,
    totalPages,
    goToPage,
    refresh,
  };
}
