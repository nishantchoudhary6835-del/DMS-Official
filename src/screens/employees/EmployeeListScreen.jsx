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

import { Button } from '@components/common/Button';
import { Chip } from '@components/common/Chip';
import { ErrorBanner } from '@components/common/ErrorBanner';
import { Loader } from '@components/common/Loader';
import { Screen } from '@components/layout/Screen';
import { TextField } from '@components/common/TextField';
import { EmployeeCard } from '@components/employee/EmployeeCard';
import { useEmployeeLookup } from '@hooks/useEmployeeLookup';
import { useEmployees } from '@hooks/useEmployees';
import { ROUTES } from '@navigation/routes';
import {
  EMPLOYEE_STATUS,
  HIERARCHY_LABELS,
  HIERARCHY_LEVELS,
} from '@validation/employee';

import { styles } from '@theme/styles/EmployeeListScreen.styles';

export function EmployeeListScreen({ navigation }) {
  const {
    employees,
    filters,
    activeFilterCount,
    isLoading,
    isRefreshing,
    error,
    isForbidden,
    toggleFilter,
    clearFilters,
    refresh,
  } = useEmployees();

  const {
    lookup,
    isSearching,
    error: lookupError,
    isNotFound,
    clear: clearLookup,
  } = useEmployeeLookup();

  const [lookupEmail, setLookupEmail] = useState('');
  const [awaitingOnly, setAwaitingOnly] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

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

  const visible = useMemo(
    () =>
      awaitingOnly ? employees.filter((item) => !item.isRegistered) : employees,
    [employees, awaitingOnly]
  );

  const suggestions = useMemo(() => {
    const query = lookupEmail.trim().toLowerCase();

    if (!query) return [];

    return employees
      .filter((item) => {
        const email = String(item.email ?? '').toLowerCase();
        return email.includes(query) && email !== query;
      })
      .slice(0, 4);
  }, [employees, lookupEmail]);

  const activeLabels = useMemo(() => {
    const labels = [];

    if (filters.status) {
      labels.push(filters.status === EMPLOYEE_STATUS.ACTIVE ? 'Active' : 'Inactive');
    }
    if (awaitingOnly) labels.push('Awaiting registration');
    if (filters.hierarchyLevel) {
      labels.push(HIERARCHY_LABELS[filters.hierarchyLevel]);
    }

    return labels;
  }, [filters, awaitingOnly]);

  const totalFilterCount = activeFilterCount + (awaitingOnly ? 1 : 0);

  const handleClearFilters = () => {
    setAwaitingOnly(false);
    clearFilters();
  };

  const openEmployee = (id) => {
    setLookupEmail('');
    clearLookup();
    navigation.navigate(ROUTES.MAIN.EMPLOYEE_DETAIL, { employeeId: id });
  };

  const handleLookup = async () => {
    const found = await lookup(lookupEmail);

    if (found?._id) openEmployee(found._id);
  };

  const renderSearch = () => (
    <View style={styles.searchBlock}>
      <View style={styles.searchRow}>
        <View style={styles.searchField}>
          <TextField
            compact
            label="Find by email"
            value={lookupEmail}
            onChangeText={(text) => {
              setLookupEmail(text);
              clearLookup();
            }}
            error={lookupError}
            helper={
              isNotFound ? 'No employee has that email address.' : undefined
            }
            placeholder="Find by email…"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isSearching}
            returnKeyType="search"
            onSubmitEditing={handleLookup}
          />
        </View>

        <Button
          title="Find"
          onPress={handleLookup}
          loading={isSearching}
          disabled={!lookupEmail.trim()}
          fullWidth={false}
          style={styles.searchButton}
        />
      </View>

      {suggestions.length ? (
        <View style={styles.suggestions}>
          {suggestions.map((item, index) => (
            <Pressable
              key={item._id}
              onPress={() => openEmployee(item._id)}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.suggestion,
                index === suggestions.length - 1 && styles.suggestionLast,
                pressed && styles.suggestionPressed,
              ]}
            >
              <Text style={styles.suggestionEmail} numberOfLines={1}>
                {item.email}
              </Text>
              <Text style={styles.suggestionMeta} numberOfLines={1}>
                {[item.firstName, item.lastName].filter(Boolean).join(' ')} ·{' '}
                {item.employeeId}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );

  const renderFilterBar = () => (
    <View style={styles.filterBar}>
      <Pressable
        onPress={() => setIsFiltersOpen((prev) => !prev)}
        accessibilityRole="button"
        accessibilityState={{ expanded: isFiltersOpen }}
        style={styles.filterToggle}
      >
        <Text style={styles.filterToggleLabel}>
          Filters{totalFilterCount ? ` (${totalFilterCount})` : ''}
        </Text>
        <Text style={styles.filterChevron}>{isFiltersOpen ? '▴' : '▾'}</Text>
      </Pressable>

      {totalFilterCount ? (
        <>
          <Text style={styles.filterSummary} numberOfLines={1}>
            {activeLabels.join(' · ')}
          </Text>
          <Pressable onPress={handleClearFilters} accessibilityRole="button">
            <Text style={styles.filterClear}>Clear</Text>
          </Pressable>
        </>
      ) : (
        <Text style={styles.filterSummary} numberOfLines={1}>
          Showing everyone
        </Text>
      )}
    </View>
  );

  const renderFilterGroups = () => (
    <View style={styles.filterGroups}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {Object.values(EMPLOYEE_STATUS).map((status) => (
          <Chip
            key={status}
            label={status === EMPLOYEE_STATUS.ACTIVE ? 'Active' : 'Inactive'}
            selected={filters.status === status}
            onPress={() => toggleFilter('status', status)}
          />
        ))}
        <Chip
          label="Awaiting registration"
          selected={awaitingOnly}
          onPress={() => setAwaitingOnly((prev) => !prev)}
        />
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {HIERARCHY_LEVELS.map((level) => (
          <Chip
            key={level}
            label={HIERARCHY_LABELS[level]}
            selected={filters.hierarchyLevel === level}
            onPress={() => toggleFilter('hierarchyLevel', level)}
          />
        ))}
      </ScrollView>
    </View>
  );

  const renderEmpty = () => {
    if (isLoading) return null;

    return (
      <View style={styles.centred}>
        <Text style={styles.emptyTitle}>
          {totalFilterCount ? 'No matching employees' : 'No employees yet'}
        </Text>
        <Text style={styles.emptyBody}>
          {totalFilterCount
            ? 'Try clearing the filters to see everyone.'
            : 'Employees you create will appear here. They can then set up their own account using their work email.'}
        </Text>
        {totalFilterCount ? (
          <Button
            title="Clear filters"
            onPress={handleClearFilters}
            variant="secondary"
            fullWidth={false}
          />
        ) : null}
      </View>
    );
  };

  return (
    <Screen background="canvas" scrollable={false} padded={false}>
      <View style={styles.header}>
        <Button
          title="← Back"
          onPress={() => navigation.goBack()}
          variant="text"
          fullWidth={false}
        />
        <Button
          title="+ New"
          onPress={() => navigation.navigate(ROUTES.MAIN.CREATE_EMPLOYEE)}
          variant="text"
          fullWidth={false}
        />
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.title}>Employees</Text>
        <Text style={styles.count}>
          {isLoading
            ? 'Loading…'
            : `${visible.length} ${visible.length === 1 ? 'employee' : 'employees'}`}
        </Text>
      </View>

      {renderSearch()}

      {renderFilterBar()}

      {isFiltersOpen ? renderFilterGroups() : null}

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
        <Loader message="Loading employees…" />
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(item) => item._id ?? item.employeeId}
          renderItem={({ item }) => (
            <EmployeeCard
              employee={item}
              onPress={
                item._id ? () => openEmployee(item._id) : undefined
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
