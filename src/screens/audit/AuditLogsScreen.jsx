import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, Text, View } from 'react-native';

import { AuditLogCard } from '@components/audit/AuditLogCard';
import { AuditLogDetailsDialog } from '@components/audit/AuditLogDetailsDialog';
import { Button } from '@components/common/Button';
import { Chip } from '@components/common/Chip';
import { DatePicker } from '@components/common/DatePicker';
import { ErrorBanner } from '@components/common/ErrorBanner';
import { Loader } from '@components/common/Loader';
import { Select } from '@components/common/Select';
import { Screen } from '@components/layout/Screen';
import { useAuditLogs } from '@hooks/useAuditLogs';
import {
  ALL_AUDIT_ACTIONS,
  AUDIT_ACTIONS_BY_MODULE,
  AUDIT_MODULES,
  auditActionLabel,
  auditModuleLabel,
  validateDateInput,
  validateDateRange,
} from '@validation/audit';

import { styles } from '@theme/styles/AuditLogsScreen.styles';

// Read-only by design (§28). Not refreshed on focus either: it refetches on every
// filter change, and a table reordering under a reader is worse than a stale one.
export function AuditLogsScreen({ navigation }) {
  const {
    logs,
    pagination,
    isLoading,
    isRefreshing,
    error,
    isForbidden,
    filters,
    setFilter,
    clearFilters,
    hasFilters,
    page,
    totalPages,
    goToPage,
    refresh,
  } = useAuditLogs();

  const [selectedLog, setSelectedLog] = useState(null);

  // With no module chosen the action list is every documented action; once one
  // is chosen it narrows, since an action belongs to exactly one module.
  // The documented vocabulary (validation/audit.js) can drift from what the
  // backend actually stores on a record — its own comment admits `action` is
  // a plain String, not a real enum — so whatever the loaded logs show for
  // this module is unioned in, guaranteeing the dropdown always offers a
  // value the server will actually match.
  const actionOptions = useMemo(() => {
    const documented = filters.module
      ? (AUDIT_ACTIONS_BY_MODULE[filters.module] ?? [])
      : ALL_AUDIT_ACTIONS;

    const actions = new Set(documented);
    logs.forEach((log) => {
      if (!log.action) return;
      if (filters.module && log.module !== filters.module) return;
      actions.add(log.action);
    });

    return [...actions].map((action) => ({
      value: action,
      label: auditActionLabel(action),
    }));
  }, [filters.module, logs]);

  const fromError = validateDateInput(filters.from);
  const toError = validateDateInput(filters.to);
  const rangeError = validateDateRange(filters.from, filters.to);

  const total = pagination?.total ?? 0;

  const countLabel = isLoading
    ? 'Loading…'
    : `${total} ${total === 1 ? 'event' : 'events'}`;

  const renderEmpty = () => {
    if (isLoading || error) return null;

    // §16: an empty array is a valid success response, not a failure.
    return (
      <View style={styles.centred}>
        <Text style={styles.emptyTitle}>
          {hasFilters ? 'No audit records found' : 'No audit records yet'}
        </Text>
        <Text style={styles.emptyBody}>
          {hasFilters
            ? 'No event matches these filters. Try widening them.'
            : 'Events appear here as people sign in, work on documents, and permissions change.'}
        </Text>
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
        <Text style={styles.title}>Audit log</Text>
        <Text style={styles.count}>{countLabel}</Text>
      </View>

      <Text style={styles.subtitle}>
        A permanent record of sign-ins, document activity, workflow decisions
        and permission changes. Read-only.
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterRow}
      >
        {AUDIT_MODULES.map((auditModule) => (
          <Chip
            key={auditModule}
            label={auditModuleLabel(auditModule)}
            selected={filters.module === auditModule}
            onPress={() =>
              setFilter(
                'module',
                filters.module === auditModule ? null : auditModule
              )
            }
          />
        ))}
      </ScrollView>

      <View style={styles.filterFields}>
        <View style={styles.filterField}>
          <Select
            label="Action"
            value={filters.action}
            options={actionOptions}
            onChange={(value) => setFilter('action', value)}
            placeholder="Any action"
            allowClear
          />
        </View>

        <View style={styles.filterField}>
          <DatePicker
            label="From"
            value={filters.from}
            onChange={(value) => setFilter('from', value)}
            placeholder="Select date"
            error={fromError}
            maxDate={filters.to || undefined}
          />
        </View>

        <View style={styles.filterField}>
          <DatePicker
            label="To"
            value={filters.to}
            onChange={(value) => setFilter('to', value)}
            placeholder="Select date"
            error={toError || rangeError}
            minDate={filters.from || undefined}
          />
        </View>
      </View>

      <View style={styles.actionRow}>
        <Button
          title="Refresh"
          onPress={refresh}
          variant="secondary"
          fullWidth={false}
          disabled={isLoading || isRefreshing}
        />
        {hasFilters ? (
          <Button
            title="Clear filters"
            onPress={clearFilters}
            variant="text"
            fullWidth={false}
          />
        ) : null}
      </View>

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
        <Loader message="Loading audit log…" />
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <AuditLogCard log={item} onPress={() => setSelectedLog(item)} />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={refresh} />
          }
          ListFooterComponent={
            totalPages > 1 ? (
              <View style={styles.pager}>
                <Button
                  title="Previous"
                  onPress={() => goToPage(page - 1)}
                  variant="secondary"
                  fullWidth={false}
                  disabled={page <= 1}
                />
                <Text style={styles.pagerLabel}>
                  Page {page} of {totalPages}
                </Text>
                <Button
                  title="Next"
                  onPress={() => goToPage(page + 1)}
                  variant="secondary"
                  fullWidth={false}
                  disabled={page >= totalPages}
                />
              </View>
            ) : null
          }
        />
      )}

      <AuditLogDetailsDialog
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </Screen>
  );
}
