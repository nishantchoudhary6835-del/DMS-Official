import { useCallback, useMemo, useState } from 'react';

import { referenceId } from '@utils/format';
import { documentStatusLabel } from '@validation/document';
import { employeeRefLabel } from '@validation/workflow';

const EMPTY_FILTERS = {
  search: '',
  status: null,
  documentType: null,
  department: null,
  owner: null,
};

/**
 * Lifecycle order, so a status filter row reads as a progression rather than
 * in whatever order the loaded documents happen to mention each value.
 * Anything unrecognised sorts to the end instead of vanishing.
 */
const STATUS_ORDER = [
  'DRAFT',
  'SUBMITTED',
  'REVIEW',
  'REVISION',
  'APPROVED',
  'PUBLISHED',
  'ACTIVE',
  'AMENDMENT',
  'ARCHIVED',
];

function byStatusOrder(a, b) {
  const rankA = STATUS_ORDER.indexOf(a.value);
  const rankB = STATUS_ORDER.indexOf(b.value);

  return (rankA === -1 ? STATUS_ORDER.length : rankA) -
    (rankB === -1 ? STATUS_ORDER.length : rankB);
}

/**
 * Collects the distinct values of one reference-ish field across the loaded
 * documents, as `{ value, label }` pairs keyed by id.
 */
function collectOptions(documents, getValue, getLabel) {
  const seen = new Map();

  documents.forEach((document) => {
    const value = getValue(document);
    if (!value) return;
    if (seen.has(value)) return;

    seen.set(value, { value, label: getLabel(document) || value });
  });

  return [...seen.values()].sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Filters a document list in the browser rather than through the API.
 *
 * `GET /document` does support server-side `search`/`status`/`documentType`/
 * `department`/`team`, but listDocuments() already walks every page into
 * AppDataContext so the whole in-scope set is in memory, and the ownership
 * rule ("mine only, unless Super Admin") is applied on top of it client-side
 * anyway. Re-querying per keystroke would add latency and a spinner to
 * narrowing a list that is already sitting in state — and would fight the
 * ownership filter, since the server does not know about it.
 *
 * Every option offered is derived from the documents actually present, so a
 * filter can never produce an empty list by offering a value nothing has.
 * Options come from the *bucket* list, not the filtered result, so choosing
 * one filter never removes the others' choices.
 */
export function useDocumentFilters(documents) {
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const setFilter = useCallback((key, value) => {
    setFilters((prev) => (prev[key] === value ? prev : { ...prev, [key]: value }));
  }, []);

  const toggleFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: prev[key] === value ? null : value }));
  }, []);

  const clearFilters = useCallback(() => setFilters(EMPTY_FILTERS), []);

  const options = useMemo(
    () => ({
      statuses: collectOptions(
        documents,
        (document) => document.status,
        (document) => documentStatusLabel(document.status)
      ).sort(byStatusOrder),

      documentTypes: collectOptions(
        documents,
        (document) => document.documentType,
        (document) => document.documentType
      ),

      departments: collectOptions(
        documents,
        (document) => referenceId(document.department),
        (document) => document.department?.name
      ),

      owners: collectOptions(
        documents,
        (document) => referenceId(document.owner),
        (document) => employeeRefLabel(document.owner)
      ),
    }),
    [documents]
  );

  const visibleDocuments = useMemo(() => {
    const term = filters.search.trim().toLowerCase();

    return documents.filter((document) => {
      if (filters.status && document.status !== filters.status) return false;

      if (filters.documentType && document.documentType !== filters.documentType) {
        return false;
      }

      if (
        filters.department &&
        referenceId(document.department) !== filters.department
      ) {
        return false;
      }

      if (filters.owner && referenceId(document.owner) !== filters.owner) {
        return false;
      }

      if (!term) return true;

      // Searches what is actually visible on the card plus the filename,
      // which is often how someone remembers a document they uploaded.
      const haystack = [
        document.title,
        document.description,
        document.documentType,
        document.fileName,
        document.currentVersion,
        document.department?.name,
        document.team?.name,
        employeeRefLabel(document.owner),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [documents, filters]);

  // Search is excluded on purpose: it has its own always-visible box, while
  // this counts only what is hidden behind the collapsed Filters bar, which
  // is the number a reader needs to decide whether to open it.
  const activeFilterCount =
    (filters.status ? 1 : 0) +
    (filters.documentType ? 1 : 0) +
    (filters.department ? 1 : 0) +
    (filters.owner ? 1 : 0);

  const hasFilters = Boolean(filters.search.trim()) || activeFilterCount > 0;

  return {
    filters,
    setFilter,
    toggleFilter,
    clearFilters,
    hasFilters,
    activeFilterCount,
    options,
    documents: visibleDocuments,
  };
}
