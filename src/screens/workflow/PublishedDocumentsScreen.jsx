import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { theme } from '@theme';

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

// Four mutually exclusive buckets over `document.status`. `review` is the
// catch-all, so a status added later shows as in-flight rather than nowhere.
const MODE_FILTERS = {
  drafts: (document) => document.status === 'DRAFT',
  archived: (document) => document.status === 'ARCHIVED',
  published: (document) => isPublishedStatus(document.status),
  review: (document) =>
    document.status !== 'DRAFT' &&
    document.status !== 'ARCHIVED' &&
    !isPublishedStatus(document.status),
};

// GET /document, not /workflow/my-submissions: that one is inherently owner-
// scoped, while §9's ACL-driven scope is what this wants. `focus` picks a bucket.
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
    activeFilterCount,
    options,
    documents: visibleDocuments,
  } = useDocumentFilters(bucketDocuments);

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // A control that can offer only one value cannot narrow anything, so it is
  // hidden rather than shown inert.
  const showStatus = options.statuses.length > 1;
  const showType = options.documentTypes.length > 1;
  const showDepartment = options.departments.length > 1;
  const showOwner = options.owners.length > 1;
  const showSelects = showType || showDepartment || showOwner;
  const showFilterBar = showStatus || showSelects;

  // Names what the collapsed controls are doing, so the bar is informative
  // closed. Falls back to the raw value only if an option list has not resolved.
  const activeLabels = useMemo(() => {
    const labelFrom = (list, value) =>
      list.find((option) => option.value === value)?.label ?? value;

    return [
      filters.status && labelFrom(options.statuses, filters.status),
      filters.documentType && labelFrom(options.documentTypes, filters.documentType),
      filters.department && labelFrom(options.departments, filters.department),
      filters.owner && labelFrom(options.owners, filters.owner),
    ].filter(Boolean);
  }, [filters, options]);

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
          {/* `compact` is right here and wrong beside a Select: it drops the
              label and message row, which a search box needs neither of. */}
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

          {showFilterBar ? (
            <View style={styles.filterBar}>
              <Pressable
                onPress={() => setIsFiltersOpen((prev) => !prev)}
                accessibilityRole="button"
                accessibilityState={{ expanded: isFiltersOpen }}
                style={styles.filterToggle}
              >
                <Text style={styles.filterToggleLabel}>
                  Filters{activeFilterCount ? ` (${activeFilterCount})` : ''}
                </Text>
                <Ionicons
                  name={isFiltersOpen ? 'chevron-up' : 'chevron-down'}
                  size={14}
                  color={theme.colors.textSecondary}
                  style={styles.filterChevron}
                />
              </Pressable>

              <Text style={styles.filterSummary} numberOfLines={1}>
                {activeLabels.length ? activeLabels.join(' · ') : 'No filters applied'}
              </Text>

              {hasFilters ? (
                <Pressable onPress={clearFilters} accessibilityRole="button">
                  <Text style={styles.filterClear}>Clear</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}

          {showFilterBar && isFiltersOpen ? (
            <View style={styles.filterGroups}>
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
