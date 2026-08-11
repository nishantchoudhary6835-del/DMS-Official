import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { normalizeError } from '@utils/errors';
import { FALLBACK_HIERARCHY_LEVELS, labelFor } from '@validation/employee';
import * as hierarchyApi from '@services/hierarchy';

/**
 * Hierarchy is configuration, not user data — it changes about never, and
 * three screens want it. Cache the resolved rows for the life of the bundle
 * instead of refetching per mount, and de-duplicate concurrent callers the
 * same way axiosInstance de-duplicates token refreshes.
 *
 * Only successes are cached. A failure leaves both slots empty so the next
 * caller retries rather than inheriting the error.
 */
let cachedRows = null;
let inFlight = null;

export function clearHierarchyCache() {
  cachedRows = null;
  inFlight = null;
}

function toRows(response) {
  const raw = Array.isArray(response?.data) ? response.data : [];

  return (
    raw
      .filter((row) => typeof row?.hierarchyLevel === 'string' && row.hierarchyLevel)
      .map((row) => ({
        hierarchyLevel: row.hierarchyLevel,
        level: Number(row.level),
      }))
      // The endpoint already sorts by level and ordering is the whole point of
      // this list, so re-sorting costs nothing and survives a backend change.
      // If `level` ever goes missing the comparison yields NaN and the server's
      // own order is left intact, which is the right thing to fall back to.
      .sort((a, b) => a.level - b.level)
  );
}

function loadRows() {
  if (cachedRows) return Promise.resolve(cachedRows);

  if (!inFlight) {
    inFlight = hierarchyApi
      .listHierarchy()
      .then((response) => {
        cachedRows = toRows(response);
        return cachedRows;
      })
      .finally(() => {
        inFlight = null;
      });
  }

  return inFlight;
}

/**
 * Active hierarchy levels for dropdowns, filter chips and validation.
 *
 * Always returns a usable `levels` array — see `isFallback` for whether it
 * came from the server or from the seeded constant.
 */
export function useHierarchy() {
  const [rows, setRows] = useState(cachedRows);
  const [isLoading, setIsLoading] = useState(!cachedRows);
  const [error, setError] = useState(null);

  const activeRef = useRef(true);

  useEffect(() => {
    activeRef.current = true;

    return () => {
      activeRef.current = false;
    };
  }, []);

  const load = useCallback(async ({ force = false } = {}) => {
    if (force) clearHierarchyCache();

    setIsLoading(true);
    setError(null);

    try {
      const resolved = await loadRows();

      if (!activeRef.current) return;

      setRows(resolved);
    } catch (caught) {
      if (!activeRef.current) return;

      setError(normalizeError(caught).message);
      setRows(null);
    } finally {
      if (activeRef.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (cachedRows) return;

    load();
  }, [load]);

  const { levels, isFallback } = useMemo(() => {
    // An empty active set is technically valid data, but it leaves the create
    // form with nothing to pick and no way to explain itself. Treat it like an
    // unreachable endpoint: show the seeded list and flag it.
    if (!rows || !rows.length) {
      return { levels: FALLBACK_HIERARCHY_LEVELS, isFallback: true };
    }

    return {
      levels: rows.map((row) => row.hierarchyLevel),
      isFallback: false,
    };
  }, [rows]);

  const options = useMemo(
    () => levels.map((level) => ({ value: level, label: labelFor(level) })),
    [levels]
  );

  // enum -> numeric seniority, 1 being the most senior. Position stands in for
  // the server's `level` on the fallback path so both expose the same shape.
  const ranks = useMemo(() => {
    const pairs =
      rows && rows.length
        ? rows.map((row) => [row.hierarchyLevel, row.level])
        : FALLBACK_HIERARCHY_LEVELS.map((level, index) => [level, index + 1]);

    return Object.fromEntries(pairs);
  }, [rows]);

  const refresh = useCallback(() => load({ force: true }), [load]);

  return { levels, options, ranks, isLoading, error, isFallback, refresh };
}
