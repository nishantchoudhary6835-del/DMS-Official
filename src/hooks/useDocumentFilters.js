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

// Lifecycle order, so a status filter row reads as a progression rather than
// in document order. Anything unrecognised sorts to the end.
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

const STATUS_RANK = new Map(STATUS_ORDER.map((status, index) => [status, index]));

// Map lookup rather than indexOf, which re-scanned STATUS_ORDER on both sides
// of every comparison the sort made.
function byStatusOrder(a, b) {
  const rankA = STATUS_RANK.get(a.value) ?? STATUS_ORDER.length;
  const rankB = STATUS_RANK.get(b.value) ?? STATUS_ORDER.length;

  return rankA - rankB;
}

// Collects the distinct values of one reference-ish field across the loaded
// documents, as `{ value, label }` pairs keyed by id.
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

// Filtered in the browser, not through the API: listDocuments() already walks
// every page into memory, and the "mine only" rule is client-side regardless.
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

  // Searches what is actually visible on the card plus the filename, which
  // is often how someone remembers a document they uploaded.
  const haystacks = useMemo(
    () =>
      documents.map((document) =>
        [
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
          .toLowerCase()
      ),
    [documents]
  );

  const visibleDocuments = useMemo(() => {
    const term = filters.search.trim().toLowerCase();

    return documents.filter((document, index) => {
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

      return haystacks[index].includes(term);
    });
  }, [documents, haystacks, filters]);

  // Search is excluded on purpose — it has its own box. This counts only what
  // is hidden behind the collapsed Filters bar.
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
