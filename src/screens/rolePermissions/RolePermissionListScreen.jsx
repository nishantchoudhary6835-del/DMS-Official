import { useCallback, useRef } from 'react';
import { FlatList, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { Button } from '@components/common/Button';
import { Chip } from '@components/common/Chip';
import { ErrorBanner } from '@components/common/ErrorBanner';
import { Loader } from '@components/common/Loader';
import { Screen } from '@components/layout/Screen';
import { RolePermissionCard } from '@components/rolePermission/RolePermissionCard';
import { useHierarchy } from '@hooks/useHierarchy';
import { useRolePermissions } from '@hooks/useRolePermissions';
import { ROUTES } from '@navigation/routes';
import { ROLE_PERMISSION_STATUS } from '@validation/rolePermission';

import { styles } from '@theme/styles/RolePermissionListScreen.styles';

export function RolePermissionListScreen({ navigation }) {
  const {
    rolePermissions,
    totalCount,
    filters,
    activeFilterCount,
    toggleFilter,
    clearFilters,
    isLoading,
    isRefreshing,
    error,
    isForbidden,
    refresh,
  } = useRolePermissions();

  const { options: hierarchyOptions } = useHierarchy();

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

  const openRolePermission = (id) =>
    navigation.navigate(ROUTES.MAIN.ROLE_PERMISSION_DETAIL, {
      rolePermissionId: id,
    });

  const renderEmpty = () => {
    if (isLoading) return null;

    return (
      <View style={styles.centred}>
        <Text style={styles.emptyTitle}>
          {activeFilterCount ? 'No matching role assignments' : 'No role assignments yet'}
        </Text>
        <Text style={styles.emptyBody}>
          {activeFilterCount
            ? 'Try clearing the filters to see every assignment.'
            : 'Each assignment makes a hierarchy level eligible for one permission. Final access still depends on the ACL rule that applies.'}
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
          onPress={() => navigation.navigate(ROUTES.MAIN.CREATE_ROLE_PERMISSION)}
          variant="text"
          fullWidth={false}
        />
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.title}>Role assignments</Text>
        <Text style={styles.count}>
          {isLoading
            ? 'Loading…'
            : `${rolePermissions.length} of ${totalCount} shown`}
        </Text>
      </View>
      <Text style={styles.subtitle}>
        Makes a hierarchy level eligible for a permission — e.g. letting
        Department Head "Create Team". It's a first step, not a guarantee:
        the Access Rule decides for real.
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterRow}
      >
        {Object.values(ROLE_PERMISSION_STATUS).map((value) => (
          <Chip
            key={value}
            label={value === ROLE_PERMISSION_STATUS.ACTIVE ? 'Active' : 'Inactive'}
            selected={filters.status === value}
            onPress={() => toggleFilter('status', value)}
          />
        ))}
      </ScrollView>

      {hierarchyOptions.length ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterRow}
        >
          {hierarchyOptions.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              selected={filters.hierarchyLevel === option.value}
              onPress={() => toggleFilter('hierarchyLevel', option.value)}
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
        <Loader message="Loading role assignments…" />
      ) : (
        <FlatList
          data={rolePermissions}
          keyExtractor={(item) => item._id ?? `${item.hierarchyLevel}-${item.permission}`}
          renderItem={({ item }) => (
            <RolePermissionCard
              rolePermission={item}
              onPress={item._id ? () => openRolePermission(item._id) : undefined}
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
