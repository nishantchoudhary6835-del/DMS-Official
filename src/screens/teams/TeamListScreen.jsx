import { useCallback, useMemo, useRef } from 'react';
import { FlatList, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { Button } from '@components/common/Button';
import { Chip } from '@components/common/Chip';
import { ErrorBanner } from '@components/common/ErrorBanner';
import { Loader } from '@components/common/Loader';
import { Screen } from '@components/layout/Screen';
import { TeamCard } from '@components/team/TeamCard';
import { useDepartmentOptions } from '@hooks/useDepartmentOptions';
import { useTeams } from '@hooks/useTeams';
import { ROUTES } from '@navigation/routes';
import { TEAM_STATUS } from '@validation/team';

import { styles } from '@theme/styles/TeamListScreen.styles';

export function TeamListScreen({ navigation }) {
  const {
    teams,
    filters,
    activeFilterCount,
    isLoading,
    isRefreshing,
    error,
    isForbidden,
    toggleFilter,
    clearFilters,
    refresh,
  } = useTeams();

  const { options: departmentOptions } = useDepartmentOptions();

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

  const activeLabels = useMemo(() => {
    const labels = [];

    if (filters.status) {
      labels.push(filters.status === TEAM_STATUS.ACTIVE ? 'Active' : 'Inactive');
    }
    if (filters.department) {
      const match = departmentOptions.find(
        (option) => option.value === filters.department
      );
      labels.push(match?.label ?? 'Department');
    }

    return labels;
  }, [filters, departmentOptions]);

  const openTeam = (id) =>
    navigation.navigate(ROUTES.MAIN.TEAM_DETAIL, { teamId: id });

  const renderEmpty = () => {
    if (isLoading) return null;

    return (
      <View style={styles.centred}>
        <Text style={styles.emptyTitle}>
          {activeFilterCount ? 'No matching teams' : 'No teams yet'}
        </Text>
        <Text style={styles.emptyBody}>
          {activeFilterCount
            ? 'Try clearing the filters to see every team.'
            : 'Teams you create will appear here. Each belongs to a department, and employees are then assigned to them.'}
        </Text>
        {activeFilterCount ? (
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
        <Button
          title="New"
          icon="add"
          onPress={() => navigation.navigate(ROUTES.MAIN.CREATE_TEAM)}
          variant="text"
          fullWidth={false}
        />
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.title}>Teams</Text>
        <Text style={styles.count}>
          {isLoading
            ? 'Loading…'
            : `${teams.length} ${teams.length === 1 ? 'team' : 'teams'}`}
        </Text>
      </View>

      {activeLabels.length ? (
        <View style={styles.filterSummaryRow}>
          <Text style={styles.filterSummary} numberOfLines={1}>
            {activeLabels.join(' · ')}
          </Text>
          <Text style={styles.filterClear} onPress={clearFilters}>
            Clear
          </Text>
        </View>
      ) : null}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterRow}
      >
        {Object.values(TEAM_STATUS).map((value) => (
          <Chip
            key={value}
            label={value === TEAM_STATUS.ACTIVE ? 'Active' : 'Inactive'}
            selected={filters.status === value}
            onPress={() => toggleFilter('status', value)}
          />
        ))}
      </ScrollView>

      {departmentOptions.length ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterRow}
        >
          {departmentOptions.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              selected={filters.department === option.value}
              onPress={() => toggleFilter('department', option.value)}
            />
          ))}
        </ScrollView>
      ) : null}

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
        <Loader message="Loading teams…" />
      ) : (
        <FlatList
          data={teams}
          keyExtractor={(item) => item._id ?? item.name}
          renderItem={({ item }) => (
            <TeamCard
              team={item}
              onPress={item._id ? () => openTeam(item._id) : undefined}
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
