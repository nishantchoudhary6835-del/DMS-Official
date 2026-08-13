import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { normalizeError } from '@utils/errors';
import {
  actionLabel,
  resourceLabel,
  FALLBACK_PERMISSION_RESOURCES,
  PERMISSION_ACTIONS,
} from '@validation/permission';
import * as permissionApi from '@services/permission';

/**
 * The Resource/Action vocabulary for the Permission create/edit form —
 * GET /permission/options. Same reasoning as useHierarchy: this is
 * configuration, not user data, so the resolved lists are cached for the
 * life of the bundle and concurrent callers share one in-flight request.
 *
 * Not to be confused with usePermissionOptions, which fetches existing
 * Permission *records* for a RolePermission/ACL "pick a permission" Select —
 * this one fetches the closed vocabulary used to *create* a Permission.
 */
let cachedVocabulary = null;
let inFlight = null;

export function clearPermissionVocabularyCache() {
  cachedVocabulary = null;
  inFlight = null;
}

function toVocabulary(response) {
  const data = response?.data ?? {};

  const resources = Array.isArray(data.resources)
    ? data.resources.filter((value) => typeof value === 'string' && value)
    : [];
  const actions = Array.isArray(data.actions)
    ? data.actions.filter((value) => typeof value === 'string' && value)
    : [];

  return { resources, actions };
}

function loadVocabulary() {
  if (cachedVocabulary) return Promise.resolve(cachedVocabulary);

  if (!inFlight) {
    inFlight = permissionApi
      .getPermissionOptions()
      .then((response) => {
        cachedVocabulary = toVocabulary(response);
        return cachedVocabulary;
      })
      .finally(() => {
        inFlight = null;
      });
  }

  return inFlight;
}

/**
 * Resource and action options for the Permission form. Always returns usable
 * lists — see `isFallback` for whether they came from the server or the
 * seeded constants.
 */
export function usePermissionVocabulary() {
  const [vocabulary, setVocabulary] = useState(cachedVocabulary);
  const [isLoading, setIsLoading] = useState(!cachedVocabulary);
  const [error, setError] = useState(null);

  const activeRef = useRef(true);

  useEffect(() => {
    activeRef.current = true;

    return () => {
      activeRef.current = false;
    };
  }, []);

  const load = useCallback(async ({ force = false } = {}) => {
    if (force) clearPermissionVocabularyCache();

    setIsLoading(true);
    setError(null);

    try {
      const resolved = await loadVocabulary();

      if (!activeRef.current) return;

      setVocabulary(resolved);
    } catch (caught) {
      if (!activeRef.current) return;

      setError(normalizeError(caught).message);
      setVocabulary(null);
    } finally {
      if (activeRef.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (cachedVocabulary) return;

    load();
  }, [load]);

  const { resources, actions, isFallback } = useMemo(() => {
    if (!vocabulary || !vocabulary.resources.length || !vocabulary.actions.length) {
      return {
        resources: FALLBACK_PERMISSION_RESOURCES,
        actions: PERMISSION_ACTIONS,
        isFallback: true,
      };
    }

    return { resources: vocabulary.resources, actions: vocabulary.actions, isFallback: false };
  }, [vocabulary]);

  const resourceOptions = useMemo(
    () => resources.map((resource) => ({ value: resource, label: resourceLabel(resource) })),
    [resources]
  );

  const actionOptions = useMemo(
    () => actions.map((action) => ({ value: action, label: actionLabel(action) })),
    [actions]
  );

  const refresh = useCallback(() => load({ force: true }), [load]);

  return {
    resources,
    actions,
    resourceOptions,
    actionOptions,
    isLoading,
    error,
    isFallback,
    refresh,
  };
}
