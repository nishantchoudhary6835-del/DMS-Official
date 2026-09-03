import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useRef, useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { theme } from '@theme';

import { Button } from '@components/common/Button';
import { Chip } from '@components/common/Chip';
import { ErrorBanner } from '@components/common/ErrorBanner';
import { Loader } from '@components/common/Loader';
import { Screen } from '@components/layout/Screen';
import { PermissionCard } from '@components/permission/PermissionCard';
import { usePermissions } from '@hooks/usePermissions';
import { ROUTES } from '@navigation/routes';
import {
  actionLabel,
  PERMISSION_ACTIONS,
  PERMISSION_STATUS,
} from '@validation/permission';

import { styles } from '@theme/styles/PermissionListScreen.styles';

export function PermissionListScreen({ navigation }) {
  const {
    permissions,
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
  } = usePermissions();

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

  const openPermission = (id) =>
    navigation.navigate(ROUTES.MAIN.PERMISSION_DETAIL, { permissionId: id });

  const renderEmpty = () => {
    if (isLoading) return null;

    return (
      <View style={styles.centred}>
        <Text style={styles.emptyTitle}>
          {activeFilterCount ? 'No matching permissions' : 'No permissions yet'}
        </Text>
        <Text style={styles.emptyBody}>
          {activeFilterCount
            ? 'Try clearing the filters to see every permission.'
            : 'Each permission pairs a resource with an action. Assign it to a hierarchy through RolePermission before it grants anyone access.'}
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
          onPress={() => navigation.navigate(ROUTES.MAIN.CREATE_PERMISSION)}
          variant="text"
          fullWidth={false}
        />
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.title}>Permissions</Text>
        <Text style={styles.count}>
          {isLoading
            ? 'Loading…'
            : `${permissions.length} of ${totalCount} shown`}
        </Text>
      </View>
      <Text style={styles.subtitle}>
        The building blocks — each one is a single action on a resource, like
        "Create Team". On its own it grants nobody anything; assign it to a
        role next in Role Assignments.
      </Text>

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

      {isFiltersOpen ? (
        <View style={styles.filterGroups}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterRow}
          >
            {Object.values(PERMISSION_STATUS).map((value) => (
              <Chip
                key={value}
                label={value === PERMISSION_STATUS.ACTIVE ? 'Active' : 'Inactive'}
                selected={filters.status === value}
                onPress={() => toggleFilter('status', value)}
              />
            ))}
          </ScrollView>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterRow}
          >
            {PERMISSION_ACTIONS.map((value) => (
              <Chip
                key={value}
                label={actionLabel(value)}
                selected={filters.action === value}
                onPress={() => toggleFilter('action', value)}
              />
            ))}
          </ScrollView>
        </View>
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
        <Loader message="Loading permissions…" />
      ) : (
        <FlatList
          data={permissions}
          keyExtractor={(item) => item._id ?? `${item.resource}.${item.action}`}
          renderItem={({ item }) => (
            <PermissionCard
              permission={item}
              onPress={item._id ? () => openPermission(item._id) : undefined}
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
