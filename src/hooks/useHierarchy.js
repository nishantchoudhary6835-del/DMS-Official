import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { normalizeError } from '@utils/errors';
import { FALLBACK_HIERARCHY_LEVELS, labelFor } from '@validation/employee';
import * as hierarchyApi from '@services/hierarchy';

// Configuration, not user data — cached for the life of the bundle, with
// concurrent callers de-duplicated. Only successes are cached.
let cachedRows = null;
let inFlight = null;

function clearHierarchyCache() {
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
      // Re-sorted even though the endpoint sorts: ordering is the point of
      // this list. A missing `level` yields NaN and leaves the server's order.
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

// Active hierarchy levels for dropdowns, chips and validation. Always returns
// a usable `levels` — `isFallback` says whether it came from the server.
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
    // An empty active set leaves the create form with nothing to pick, so
    // treat it like an unreachable endpoint: seeded list, flagged.
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
