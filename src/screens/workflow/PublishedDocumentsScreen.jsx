import { useCallback, useMemo, useRef } from 'react';
import { FlatList, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { Button } from '@components/common/Button';
import { Chip } from '@components/common/Chip';
import { ErrorBanner } from '@components/common/ErrorBanner';
import { Loader } from '@components/common/Loader';
import { Screen } from '@components/layout/Screen';
import { Select } from '@components/common/Select';
import { TextField } from '@components/common/TextField';
import { DocumentCard } from '@components/document/DocumentCard';
import { useDocumentFilters } from '@hooks/useDocumentFilters';
import { useDocuments } from '@hooks/useDocuments';
import { ROUTES } from '@navigation/routes';
import { isPublishedStatus } from '@validation/document';

import { styles } from '@theme/styles/WorkflowListScreen.styles';

const MODE_COPY = {
  drafts: {
    title: 'Drafts',
    subtitle: "Documents saved but not yet submitted. Open one to submit it for review.",
    empty: 'No drafts. New documents start here.',
  },
  review: {
    title: 'In Review',
    subtitle: 'Documents submitted and working their way through approval. Not published yet.',
    empty: 'Nothing is in review.',
  },
  published: {
    title: 'Published Documents',
    subtitle: 'Documents that completed approval and are in force.',
    empty: 'Nothing published yet.',
  },
  archived: {
    title: 'Archived Documents',
    subtitle: 'Documents you can access that have been archived.',
    empty: 'Nothing archived yet.',
  },
};

/**
 * Four mutually exclusive buckets over `document.status`, so a document
 * appears in exactly one place and none can go missing:
 *
 *   drafts     DRAFT
 *   archived   ARCHIVED
 *   published  PUBLISHED / ACTIVE / AMENDMENT  (finished approval, in force)
 *   review     everything else                  (still in the pipeline)
 *
 * "Published" used to be the catch-all, which put SUBMITTED and REVIEW
 * documents under a heading claiming they were published. It is now the
 * strict set, and `review` took over as the catch-all — deliberately, so a
 * status the backend adds later shows up as in-flight rather than silently
 * belonging to no bucket and disappearing from every screen.
 */
const MODE_FILTERS = {
  drafts: (document) => document.status === 'DRAFT',
  archived: (document) => document.status === 'ARCHIVED',
  published: (document) => isPublishedStatus(document.status),
  review: (document) =>
    document.status !== 'DRAFT' &&
    document.status !== 'ARCHIVED' &&
    !isPublishedStatus(document.status),
};

/**
 * Sourced from GET /document (DOCUMENT_MODULE_DOCUMENTATION.md §9) rather
 * than GET /workflow/my-submissions — that endpoint is inherently
 * owner-scoped ("my own submissions"), so no permission check could ever
 * make it show more than the documents this account personally authored.
 * §9 describes /document as "documents accessible to the authenticated
 * user," which is the actually-correct, ACL-driven scope this screen wants
 * — an unrestricted role like Super Admin should see every document here,
 * not just their own. That's the theory the doc states; whether the
 * backend's ACL genuinely implements it that broadly for Super Admin is
 * unverified until the first real response is observed.
 *
 * `route.params.focus` picks which single lifecycle bucket to show —
 * 'drafts', 'archived', or anything else (default 'published') — rather than
 * showing several together, so each sidebar link lands on exactly what it
 * says.
 */
export function PublishedDocumentsScreen({ navigation, route }) {
  const focus = route?.params?.focus;
  const mode = MODE_FILTERS[focus] ? focus : 'published';
  const copy = MODE_COPY[mode];

  const { documents, isLoading, isRefreshing, error, isForbidden, refresh } =
    useDocuments();

  const bucketDocuments = useMemo(
    () => documents.filter(MODE_FILTERS[mode]),
    [documents, mode]
  );

  const {
    filters,
    setFilter,
    toggleFilter,
    clearFilters,
    hasFilters,
    options,
    documents: visibleDocuments,
  } = useDocumentFilters(bucketDocuments);

  /**
   * A control that can only offer one value cannot narrow anything, so it is
   * hidden rather than shown inert. In practice that means Drafts and
   * Archived never render a status filter (every document in them shares one
   * status), and an account that only ever sees its own documents never
   * renders the owner filter.
   */
  const showStatus = options.statuses.length > 1;
  const showType = options.documentTypes.length > 1;
  const showDepartment = options.departments.length > 1;
  const showOwner = options.owners.length > 1;
  const showSelects = showType || showDepartment || showOwner;

  const hasFocusedOnce = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (!hasFocusedOnce.current) {
        hasFocusedOnce.current = true;
        return;
      }
      refresh();
    }, [refresh])
  );

  const renderEmpty = () => {
    if (isLoading) return null;

    // Distinguishes "this bucket is empty" from "your filters excluded
    // everything" — the fix for the second is a button, not patience.
    return (
      <View style={styles.centred}>
        <Text style={styles.emptyTitle}>
          {hasFilters ? 'Nothing matches these filters' : copy.empty}
        </Text>
        {hasFilters ? (
          <Button
            title="Clear filters"
            onPress={clearFilters}
            variant="secondary"
            fullWidth={false}
          />
        ) : null}
      </View>
    );
  };

  return (
    <Screen scrollable={false} padded={false}>
      <View style={styles.header}>
        <Button
          title="Back"
          icon="chevron-back"
          onPress={() => navigation.goBack()}
          variant="text"
          fullWidth={false}
        />
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.count}>
          {isLoading
            ? 'Loading…'
            : hasFilters
            ? `${visibleDocuments.length} of ${bucketDocuments.length}`
            : `${visibleDocuments.length} shown`}
        </Text>
      </View>
      <Text style={styles.subtitle}>{copy.subtitle}</Text>

      {isLoading ? null : (
        <>
          {/* `compact` is right here and wrong on a field sitting beside a
              Select: it drops the label and the reserved message row. A
              search box with a magnifier and a descriptive placeholder needs
              neither, and it owns its row so there is nothing to align to. */}
          <View style={styles.searchRow}>
            <TextField
              label="Search"
              value={filters.search}
              onChangeText={(value) => setFilter('search', value)}
              placeholder="Title, type, filename, owner…"
              icon="search-outline"
              compact
            />
          </View>

          {showStatus ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterScroll}
              contentContainerStyle={styles.filterRow}
            >
              {options.statuses.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  selected={filters.status === option.value}
                  onPress={() => toggleFilter('status', option.value)}
                />
              ))}
            </ScrollView>
          ) : null}

          {showSelects ? (
            <View style={styles.filterFields}>
              {showType ? (
                <View style={styles.filterField}>
                  <Select
                    label="Type"
                    value={filters.documentType}
                    options={options.documentTypes}
                    onChange={(value) => setFilter('documentType', value)}
                    placeholder="Any type"
                    allowClear
                  />
                </View>
              ) : null}

              {showDepartment ? (
                <View style={styles.filterField}>
                  <Select
                    label="Department"
                    value={filters.department}
                    options={options.departments}
                    onChange={(value) => setFilter('department', value)}
                    placeholder="Any department"
                    allowClear
                  />
                </View>
              ) : null}

              {showOwner ? (
                <View style={styles.filterField}>
                  <Select
                    label="Owner"
                    value={filters.owner}
                    options={options.owners}
                    onChange={(value) => setFilter('owner', value)}
                    placeholder="Anyone"
                    allowClear
                  />
                </View>
              ) : null}
            </View>
          ) : null}

          {hasFilters ? (
            <View style={styles.filterActions}>
              <Button
                title="Clear filters"
                onPress={clearFilters}
                variant="text"
                fullWidth={false}
              />
            </View>
          ) : null}
        </>
      )}

      {error ? (
        <View style={styles.errorBlock}>
          <ErrorBanner message={error} />
          {!isForbidden ? (
            <Button
              title="Try again"
              onPress={refresh}
              variant="secondary"
              fullWidth={false}
            />
          ) : null}
        </View>
      ) : null}

      {isLoading ? (
        <Loader message="Loading documents…" />
      ) : (
        <FlatList
          data={visibleDocuments}
          keyExtractor={(item, index) => item._id ?? String(index)}
          renderItem={({ item }) => (
            <DocumentCard
              document={item}
              onPress={() =>
                navigation.navigate(ROUTES.MAIN.DOCUMENT_DETAIL, {
                  document: item,
                })
              }
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={refresh} />
          }
        />
      )}
    </Screen>
  );
}
